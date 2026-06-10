import { useMemo, useState } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
  Search,
  Filter,
  Download,
  ChevronDown,
  Trophy,
  Clock,
  Store,
  Tag,
  Check,
  ShoppingCart,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAppStore, type ReplenishmentSuggestion } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

type CategoryFilter = 'all' | 'drinks' | 'snacks' | 'daily' | 'fresh' | 'frozen';
type UrgencyFilter = 'all' | 'critical' | 'urgent' | 'normal';
type RankTab = 'count' | 'loss';

const categoryLabels: Record<CategoryFilter, string> = {
  all: '全部',
  drinks: '饮料',
  snacks: '零食',
  daily: '日用品',
  fresh: '鲜食',
  frozen: '冷冻',
};

const urgencyConfig: Record<ReplenishmentSuggestion['urgency'], { type: 'danger' | 'warning' | 'success'; label: string }> = {
  critical: { type: 'danger', label: '紧急' },
  urgent: { type: 'warning', label: '一般' },
  normal: { type: 'success', label: '正常' },
};

const categoryBadgeColors: Record<string, string> = {
  '饮料': 'bg-blue-50 text-blue-700 border-blue-100',
  '零食': 'bg-amber-50 text-amber-700 border-amber-100',
  '日用品': 'bg-purple-50 text-purple-700 border-purple-100',
  '鲜食': 'bg-green-50 text-green-700 border-green-100',
  '冷冻': 'bg-cyan-50 text-cyan-700 border-cyan-100',
};

const rankMedalColors = [
  'bg-gradient-to-br from-amber-300 to-amber-500 text-white',
  'bg-gradient-to-br from-slate-300 to-slate-400 text-white',
  'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
];

export default function ReplenishmentPage() {
  const {
    getStoresByCurrentUser,
    getReplenishmentsByStoreId,
    batchUpdateReplenishmentStatus,
    currentUser,
  } = useAppStore();

  const stores = getStoresByCurrentUser();
  const allReplenishments = useMemo(
    () => stores.flatMap((s) => getReplenishmentsByStoreId(s.id)),
    [stores, getReplenishmentsByStoreId]
  );

  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>(
    stores.map((s) => s.id)
  );
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rankTab, setRankTab] = useState<RankTab>('count');
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const stats = useMemo(() => {
    const pending = allReplenishments.filter((r) => r.status === 'pending');
    const criticalCount = pending.filter((r) => r.urgency === 'critical').length;
    const urgentCount = pending.filter(
      (r) => r.urgency === 'urgent' || r.urgency === 'critical'
    ).length;
    const totalSuggestedQty = pending.reduce((sum, r) => sum + r.suggestedQty, 0);
    const completedThisWeek = allReplenishments.filter(
      (r) => r.status === 'completed'
    ).length;
    const totalAll = allReplenishments.length;
    const completionRate = totalAll > 0 ? (completedThisWeek / totalAll) * 100 : 0;
    const estimatedLoss = pending
      .filter((r) => r.urgency === 'critical' || r.urgency === 'urgent')
      .reduce((sum, r) => sum + r.suggestedQty * 5, 0);

    return {
      outOfStockCount: pending.length,
      urgentCount,
      criticalCount,
      completionRate,
      estimatedLoss,
      totalSuggestedQty,
    };
  }, [allReplenishments]);

  const filteredData = useMemo(() => {
    return allReplenishments.filter((item) => {
      const matchStore = selectedStoreIds.includes(item.storeId);
      const matchCategory =
        categoryFilter === 'all' ||
        item.category === categoryLabels[categoryFilter];
      const matchUrgency =
        urgencyFilter === 'all' || item.urgency === urgencyFilter;
      const matchSearch =
        !searchText ||
        item.skuName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.skuId.toLowerCase().includes(searchText.toLowerCase());
      return matchStore && matchCategory && matchUrgency && matchSearch;
    });
  }, [allReplenishments, selectedStoreIds, categoryFilter, urgencyFilter, searchText]);

  const topRanking = useMemo(() => {
    const skuMap = new Map<
      string,
      {
        skuName: string;
        category: string;
        count: number;
        loss: number;
        days: number;
      }
    >();

    allReplenishments
      .filter((r) => r.status === 'pending')
      .forEach((r) => {
        const existing = skuMap.get(r.skuId);
        const loss = r.suggestedQty * 8;
        if (existing) {
          existing.count += 1;
          existing.loss += loss;
          existing.days = Math.max(existing.days, Math.floor(r.suggestedQty / 5));
        } else {
          skuMap.set(r.skuId, {
            skuName: r.skuName,
            category: r.category,
            count: 1,
            loss,
            days: Math.floor(r.suggestedQty / 5),
          });
        }
      });

    const list = Array.from(skuMap.entries()).map(([skuId, data]) => ({
      skuId,
      ...data,
    }));

    if (rankTab === 'count') {
      list.sort((a, b) => b.count - a.count);
    } else {
      list.sort((a, b) => b.loss - a.loss);
    }

    return list.slice(0, 10);
  }, [allReplenishments, rankTab]);

  const maxRankValue = useMemo(() => {
    if (topRanking.length === 0) return 1;
    return rankTab === 'count'
      ? topRanking[0].count
      : topRanking[0].loss;
  }, [topRanking, rankTab]);

  const allSelected = useMemo(() => {
    const pendingItems = filteredData.filter((r) => r.status === 'pending');
    if (pendingItems.length === 0) return false;
    return pendingItems.every((r) => selectedIds.has(r.id));
  }, [filteredData, selectedIds]);

  const selectedItems = useMemo(
    () => filteredData.filter((r) => selectedIds.has(r.id)),
    [filteredData, selectedIds]
  );

  const totalSelectedQty = selectedItems.reduce(
    (sum, r) => sum + r.suggestedQty,
    0
  );

  const handleToggleAll = () => {
    const pendingItems = filteredData.filter((r) => r.status === 'pending');
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingItems.map((r) => r.id)));
    }
  };

  const handleToggleItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleGenerateOrder = (ids?: string[]) => {
    const targetIds = ids || Array.from(selectedIds);
    if (targetIds.length === 0) return;

    batchUpdateReplenishmentStatus(targetIds, 'ordered');
    setSelectedIds(new Set());
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleAddToOrder = (id: string) => {
    handleGenerateOrder([id]);
  };

  const toggleStore = (storeId: string) => {
    const newSelected = new Set(selectedStoreIds);
    if (newSelected.has(storeId)) {
      newSelected.delete(storeId);
    } else {
      newSelected.add(storeId);
    }
    setSelectedStoreIds(Array.from(newSelected));
  };

  const handleSelectAllStores = () => {
    if (selectedStoreIds.length === stores.length) {
      setSelectedStoreIds([]);
    } else {
      setSelectedStoreIds(stores.map((s) => s.id));
    }
  };

  const exportCSV = () => {
    const headers = [
      'SKU编码',
      'SKU名称',
      '分类',
      '门店',
      '当前库存',
      '安全库存',
      '建议补货量',
      '紧急度',
      '上次补货时间',
      '状态',
    ];
    const rows = filteredData.map((r) => [
      r.skuId,
      r.skuName,
      r.category,
      r.storeName,
      r.currentStock,
      r.safetyStock,
      r.suggestedQty,
      urgencyConfig[r.urgency].label,
      r.lastReplenishedAt,
      r.status === 'pending'
        ? '待处理'
        : r.status === 'ordered'
          ? '已下单'
          : r.status === 'shipped'
            ? '配送中'
            : r.status === 'received'
              ? '已到货'
              : r.status === 'completed'
                ? '已完成'
                : '已取消',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `补货清单_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const criticalPending = stats.criticalCount > 0;

  return (
    <div className="space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">补货建议</h1>
          <p className="mt-1 text-sm text-slate-500">
            根据缺货记录和销售数据智能生成补货建议清单
          </p>
        </div>
      </div>

      {criticalPending && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-danger-500 via-danger-600 to-danger-500 p-5 text-white shadow-lg">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzAgMGwzMCAzMEwzMCA2MCAwIDMweiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold">
                  ⚠️ 当前有 {stats.criticalCount} 个 SKU 库存紧急，建议立即处理
                </p>
                <p className="text-sm text-white/80">
                  紧急商品如不及时补货可能造成严重销售损失
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const criticalIds = allReplenishments
                  .filter((r) => r.urgency === 'critical' && r.status === 'pending')
                  .map((r) => r.id);
                handleGenerateOrder(criticalIds);
              }}
              className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-danger-600 shadow-md transition hover:bg-danger-50 hover:shadow-lg"
            >
              <ShoppingCart className="h-4 w-4" />
              一键生成补货单
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="缺货 SKU 总数"
          value={stats.outOfStockCount}
          icon={<Package className="h-5 w-5 text-brand-600" />}
          trendData={[12, 15, 18, 16, 20, stats.outOfStockCount]}
        />
        <StatCard
          title="紧急补货数"
          value={stats.urgentCount}
          change={-8.5}
          icon={<AlertTriangle className="h-5 w-5 text-danger-500" />}
          trendData={[8, 10, 12, 9, 11, stats.urgentCount]}
        />
        <StatCard
          title="本周补货完成率"
          value={`${stats.completionRate.toFixed(1)}%`}
          change={5.2}
          icon={<CheckCircle2 className="h-5 w-5 text-success-500" />}
          trendData={[60, 65, 70, 68, 72, stats.completionRate]}
        />
        <StatCard
          title="预估销售损失"
          value={`¥${stats.estimatedLoss.toLocaleString()}`}
          change={12.8}
          icon={<TrendingDown className="h-5 w-5 text-warning-500" />}
          trendData={[2000, 2500, 3000, 2800, 3200, stats.estimatedLoss]}
        />
      </div>

      <div className="flex gap-5">
        <div className="w-[360px] shrink-0 space-y-4">
          <div className="rounded-[10px] bg-white p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <Trophy className="h-5 w-5 text-amber-500" />
                TOP 缺货排行
              </h3>
            </div>

            <div className="mb-4 flex rounded-lg bg-slate-100 p-1">
              <button
                onClick={() => setRankTab('count')}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition',
                  rankTab === 'count'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                按缺货次数
              </button>
              <button
                onClick={() => setRankTab('loss')}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition',
                  rankTab === 'loss'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                按销售损失
              </button>
            </div>

            <div className="space-y-2">
              {topRanking.map((item, index) => {
                const isTop3 = index < 3;
                const value = rankTab === 'count' ? item.count : item.loss;
                const progress = (value / maxRankValue) * 100;

                return (
                  <div
                    key={item.skuId}
                    className={cn(
                      'group relative rounded-lg border p-3 transition-all',
                      isTop3
                        ? 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        : 'border-transparent hover:border-slate-100 hover:bg-slate-50/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          isTop3
                            ? rankMedalColors[index]
                            : 'bg-slate-100 text-slate-500'
                        )}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {item.skuName}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">
                            {item.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.days}天
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {rankTab === 'count'
                            ? `${item.count}次`
                            : `¥${item.loss}`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          index === 0
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                            : index === 1
                              ? 'bg-gradient-to-r from-slate-300 to-slate-400'
                              : index === 2
                                ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                                : 'bg-brand-400'
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {topRanking.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-400">
                  暂无缺货数据
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="rounded-[10px] bg-white p-4 shadow-card">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Store className="h-4 w-4 text-slate-400" />
                  <span>
                    {selectedStoreIds.length === 0
                      ? '选择门店'
                      : selectedStoreIds.length === stores.length
                        ? '全部门店'
                        : `已选 ${selectedStoreIds.length} 家门店`}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-slate-400 transition',
                      storeDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                {storeDropdownOpen && (
                  <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-popover">
                    {currentUser.role === 'supervisor' && (
                      <button
                        onClick={handleSelectAllStores}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <div
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded border',
                            selectedStoreIds.length === stores.length
                              ? 'border-brand-500 bg-brand-500'
                              : 'border-slate-300'
                          )}
                        >
                          {selectedStoreIds.length === stores.length && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span className="font-medium">全部门店</span>
                      </button>
                    )}
                    <div className="my-1 h-px bg-slate-100" />
                    {stores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => toggleStore(store.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <div
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded border',
                            selectedStoreIds.includes(store.id)
                              ? 'border-brand-500 bg-brand-500'
                              : 'border-slate-300'
                          )}
                        >
                          {selectedStoreIds.includes(store.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span>{store.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                {(
                  Object.keys(categoryLabels) as CategoryFilter[]
                ).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-medium transition',
                      categoryFilter === cat
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    )}
                  >
                    {categoryLabels[cat]}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4 text-slate-400" />
                {(['all', 'critical', 'urgent', 'normal'] as UrgencyFilter[]).map(
                  (u) => (
                    <button
                      key={u}
                      onClick={() => setUrgencyFilter(u)}
                      className={cn(
                        'rounded-md px-2 py-1 text-xs font-medium transition',
                        urgencyFilter === u
                          ? u === 'critical'
                            ? 'bg-danger-100 text-danger-700'
                            : u === 'urgent'
                              ? 'bg-warning-100 text-warning-700'
                              : u === 'normal'
                                ? 'bg-success-100 text-success-700'
                                : 'bg-brand-100 text-brand-700'
                          : 'text-slate-500 hover:bg-slate-100'
                      )}
                    >
                      {u === 'all'
                        ? '全部'
                        : u === 'critical'
                          ? '紧急'
                          : u === 'urgent'
                            ? '一般'
                            : '正常'}
                    </button>
                  )
                )}
              </div>

              <div className="relative ml-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索 SKU 名称..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-56 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                导出补货单
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[10px] bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="w-12 px-4 py-3 text-left">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={handleToggleAll}
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded border transition',
                            allSelected
                              ? 'border-brand-500 bg-brand-500'
                              : 'border-slate-300 hover:border-brand-400'
                          )}
                        >
                          {allSelected && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                      SKU 信息
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                      分类
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                      门店
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                      库存状态
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                      建议补货量
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                      紧急度
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                      上次补货
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    const isOrdered = item.status === 'ordered';
                    const isDisabled = item.status !== 'pending';
                    const stockPercent = Math.min(
                      100,
                      (item.currentStock / item.safetyStock) * 100
                    );
                    const isLowStock = item.currentStock < item.safetyStock;

                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          'border-b border-slate-50 transition-colors',
                          isOrdered && 'bg-slate-50/50',
                          !isDisabled && 'hover:bg-brand-50/30',
                          isDisabled && 'opacity-60'
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() =>
                                !isDisabled && handleToggleItem(item.id)
                              }
                              disabled={isDisabled}
                              className={cn(
                                'flex h-4 w-4 items-center justify-center rounded border transition',
                                isSelected
                                  ? 'border-brand-500 bg-brand-500'
                                  : isDisabled
                                    ? 'border-slate-200 bg-slate-100'
                                    : 'border-slate-300 hover:border-brand-400'
                              )}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {item.skuName}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {item.skuId}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
                              categoryBadgeColors[item.category] ||
                                'bg-slate-50 text-slate-600 border-slate-200'
                            )}
                          >
                            <Tag className="h-3 w-3" />
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600">
                            {item.storeName}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-36">
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span
                                className={cn(
                                  'font-medium',
                                  isLowStock
                                    ? 'text-danger-600'
                                    : 'text-slate-600'
                                )}
                              >
                                {item.currentStock}
                              </span>
                              <span className="text-slate-400">
                                / {item.safetyStock} 安全库存
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  isLowStock
                                    ? 'bg-gradient-to-r from-danger-400 to-danger-500'
                                    : 'bg-gradient-to-r from-success-400 to-success-500'
                                )}
                                style={{ width: `${stockPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'text-lg font-bold',
                              item.urgency === 'critical'
                                ? 'text-danger-600'
                                : item.urgency === 'urgent'
                                  ? 'text-warning-600'
                                  : 'text-brand-600'
                            )}
                          >
                            {item.suggestedQty}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            type={urgencyConfig[item.urgency].type}
                            label={urgencyConfig[item.urgency].label}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-500">
                            {item.lastReplenishedAt}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isOrdered ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-success-50 px-2 py-1 text-xs font-medium text-success-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              已下单
                            </span>
                          ) : isDisabled ? (
                            <span className="text-xs text-slate-400">
                              {item.status === 'completed'
                                ? '已完成'
                                : item.status === 'shipped'
                                  ? '配送中'
                                  : item.status === 'received'
                                    ? '已到货'
                                    : '已取消'}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAddToOrder(item.id)}
                              className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600"
                            >
                              加入补货单
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="py-12 text-center text-sm text-slate-400"
                      >
                        <Package className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                        暂无符合条件的补货建议
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 animate-slide-up">
          <div className="mx-auto max-w-7xl px-6 pb-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
                  <ShoppingCart className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    已选 <span className="text-brand-600">{selectedIds.size}</span> 项
                  </p>
                  <p className="text-xs text-slate-500">
                    总计建议补货数量{' '}
                    <span className="font-semibold text-slate-700">
                      {totalSelectedQty}
                    </span>{' '}
                    件
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  onClick={() => handleGenerateOrder()}
                  className="flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-600 hover:shadow-lg"
                >
                  <Check className="h-4 w-4" />
                  生成补货单
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 animate-scale-in">
          <div className="flex items-center gap-2 rounded-lg bg-success-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            <CheckCircle2 className="h-5 w-5" />
            补货单生成成功！
          </div>
        </div>
      )}
    </div>
  );
}
