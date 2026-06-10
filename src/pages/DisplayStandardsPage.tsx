import { useState, useMemo } from 'react';
import {
  Ruler,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  Filter,
  SortAsc,
  Eye,
  Edit,
  Trash2,
  X,
  Check,
  Clock,
  Package,
  Tag,
  Layers,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAppStore, type DisplayStandard } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

type SortType = 'updatedAt' | 'weight' | 'name';
type StatusFilter = 'all' | 'enabled' | 'disabled';
type PanelMode = 'view' | 'edit' | 'create' | 'none';

interface CategoryNode {
  key: string;
  label: string;
  children?: { key: string; label: string }[];
}

const categoryTree: CategoryNode[] = [
  {
    key: 'drinks',
    label: '饮料',
    children: [
      { key: '碳酸饮料', label: '碳酸饮料' },
      { key: '茶饮', label: '茶饮' },
      { key: '果汁', label: '果汁' },
      { key: '咖啡', label: '咖啡' },
      { key: '功能饮料', label: '功能饮料' },
      { key: '矿泉水', label: '矿泉水' },
      { key: '乳饮', label: '乳饮' },
    ],
  },
  {
    key: 'snacks',
    label: '零食',
    children: [
      { key: '膨化食品', label: '膨化食品' },
      { key: '饼干糕点', label: '饼干糕点' },
      { key: '糖果巧克力', label: '糖果巧克力' },
      { key: '坚果炒货', label: '坚果炒货' },
    ],
  },
  {
    key: 'daily',
    label: '日用品',
    children: [
      { key: '个人洗护', label: '个人洗护' },
      { key: '口腔护理', label: '口腔护理' },
      { key: '纸品湿巾', label: '纸品湿巾' },
    ],
  },
  {
    key: 'fresh',
    label: '鲜食',
    children: [
      { key: '三明治', label: '三明治' },
      { key: '便当饭团', label: '便当饭团' },
      { key: '面包烘焙', label: '面包烘焙' },
    ],
  },
  {
    key: 'frozen',
    label: '冷冻食品',
    children: [
      { key: '冷冻水饺', label: '冷冻水饺' },
      { key: '冰淇淋', label: '冰淇淋' },
      { key: '冷冻肉制品', label: '冷冻肉制品' },
    ],
  },
];

const categoryColorMap: Record<string, string> = {
  drinks: 'bg-blue-500',
  snacks: 'bg-amber-500',
  daily: 'bg-emerald-500',
  fresh: 'bg-green-500',
  frozen: 'bg-cyan-500',
};

export default function DisplayStandardsPage() {
  const { standards, currentUser, addStandard, updateStandard, toggleStandard, deleteStandard } = useAppStore();
  const isSupervisor = currentUser.role === 'supervisor';

  const [searchText, setSearchText] = useState('');
  const [sortType, setSortType] = useState<SortType>('updatedAt');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['drinks']);
  const [selectedStandardId, setSelectedStandardId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>('none');

  const [formData, setFormData] = useState<Partial<DisplayStandard>>({
    name: '',
    category: 'drinks',
    categoryName: '饮料',
    subCategory: '',
    description: '',
    shelfType: '',
    minSkuCount: 5,
    maxSkuCount: 10,
    facingRule: '',
    priceTagRule: '',
    promotionRule: '',
    weight: 5,
    enabled: true,
  });

  const stats = useMemo(() => {
    const total = standards.length;
    const enabled = standards.filter((s) => s.enabled).length;
    const categories = new Set(standards.map((s) => s.category)).size;
    const thisWeek = standards.filter((s) => {
      const date = new Date(s.updatedAt.replace(' ', 'T'));
      const weekStart = new Date('2026-06-08');
      return date >= weekStart;
    }).length;
    return { total, enabled, categories, thisWeek };
  }, [standards]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const subCounts: Record<string, number> = {};
    standards.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
      if (s.subCategory) {
        subCounts[s.subCategory] = (subCounts[s.subCategory] || 0) + 1;
      }
    });
    return { counts, subCounts };
  }, [standards]);

  const filteredStandards = useMemo(() => {
    let result = [...standards];

    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(lower) ||
          s.description.toLowerCase().includes(lower)
      );
    }

    if (statusFilter === 'enabled') {
      result = result.filter((s) => s.enabled);
    } else if (statusFilter === 'disabled') {
      result = result.filter((s) => !s.enabled);
    }

    if (selectedCategories.length > 0) {
      result = result.filter((s) => {
        return selectedCategories.some((cat) => {
          if (categoryTree.some((c) => c.key === cat)) {
            return s.category === cat;
          }
          return s.subCategory === cat;
        });
      });
    }

    if (sortType === 'updatedAt') {
      result.sort((a, b) => new Date(b.updatedAt.replace(' ', 'T')).getTime() - new Date(a.updatedAt.replace(' ', 'T')).getTime());
    } else if (sortType === 'weight') {
      result.sort((a, b) => b.weight - a.weight);
    } else if (sortType === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [standards, searchText, statusFilter, selectedCategories, sortType]);

  const selectedStandard = useMemo(() => {
    return standards.find((s) => s.id === selectedStandardId) || null;
  }, [standards, selectedStandardId]);

  const toggleCategoryExpand = (key: string) => {
    setExpandedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleCategorySelect = (key: string) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  const handleSelectStandard = (id: string) => {
    setSelectedStandardId(id);
    setPanelMode('view');
  };

  const handleCreateNew = () => {
    setSelectedStandardId(null);
    setFormData({
      name: '',
      category: 'drinks',
      categoryName: '饮料',
      subCategory: '',
      description: '',
      shelfType: '',
      minSkuCount: 5,
      maxSkuCount: 10,
      facingRule: '',
      priceTagRule: '',
      promotionRule: '',
      weight: 5,
      enabled: true,
    });
    setPanelMode('create');
  };

  const handleEdit = () => {
    if (selectedStandard) {
      setFormData({ ...selectedStandard });
      setPanelMode('edit');
    }
  };

  const handleCancel = () => {
    if (selectedStandardId) {
      setPanelMode('view');
    } else {
      setPanelMode('none');
    }
  };

  const handleSave = () => {
    if (!formData.name) return;

    if (panelMode === 'create') {
      const newStandard = addStandard(formData as Omit<DisplayStandard, 'id' | 'updatedAt'>);
      setSelectedStandardId(newStandard.id);
      setPanelMode('view');
    } else if (panelMode === 'edit' && selectedStandardId) {
      updateStandard(selectedStandardId, formData);
      setPanelMode('view');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个陈列标准吗？')) {
      deleteStandard(id);
      if (selectedStandardId === id) {
        setSelectedStandardId(null);
        setPanelMode('none');
      }
    }
  };

  const handleToggle = (id: string) => {
    toggleStandard(id);
  };

  const handleCategoryChange = (category: string) => {
    const catNode = categoryTree.find((c) => c.key === category);
    setFormData((prev) => ({
      ...prev,
      category,
      categoryName: catNode?.label || category,
      subCategory: '',
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">陈列标准</h1>
          <p className="mt-1 text-sm text-slate-500">
            管理各品类商品的门店陈列规范
            {!isSupervisor && <span className="ml-2 text-amber-600">（只读）</span>}
          </p>
        </div>
        {isSupervisor && (
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            新增标准
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="标准总数"
          value={stats.total}
          icon={<Ruler className="h-5 w-5 text-brand-600" />}
          trendData={[15, 16, 18, 20, 21, stats.total]}
        />
        <StatCard
          title="启用标准"
          value={stats.enabled}
          change={stats.total > 0 ? ((stats.enabled / stats.total) * 100 - 70) : 0}
          icon={<Check className="h-5 w-5 text-success-600" />}
          trendData={[12, 13, 14, 15, 16, stats.enabled]}
        />
        <StatCard
          title="覆盖品类"
          value={stats.categories}
          icon={<Tag className="h-5 w-5 text-amber-600" />}
          trendData={[3, 4, 4, 5, 5, stats.categories]}
        />
        <StatCard
          title="本周更新"
          value={stats.thisWeek}
          icon={<Clock className="h-5 w-5 text-purple-600" />}
          trendData={[2, 3, 4, 5, 6, stats.thisWeek]}
        />
      </div>

      <div className="flex gap-5">
        <div className="w-[260px] shrink-0 rounded-[10px] bg-white p-4 shadow-card">
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索分类..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">分类树</span>
            {selectedCategories.length > 0 && (
              <button
                onClick={clearAllCategories}
                className="text-xs text-brand-600 hover:text-brand-700"
              >
                清除筛选
              </button>
            )}
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategories([])}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors',
                selectedCategories.length === 0
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <Layers className="h-4 w-4" />
              <span className="flex-1 text-left">全部分类</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {standards.length}
              </span>
            </button>

            {categoryTree.map((cat) => {
              const isExpanded = expandedCategories.includes(cat.key);
              const isSelected = selectedCategories.includes(cat.key);
              const count = categoryCounts.counts[cat.key] || 0;

              return (
                <div key={cat.key}>
                  <button
                    onClick={() => toggleCategoryExpand(cat.key)}
                    className={cn(
                      'flex w-full items-center gap-1.5 rounded-md px-2 py-2 text-sm transition-colors',
                      isSelected
                        ? 'bg-brand-50 text-brand-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded transition-transform',
                        isExpanded && 'rotate-90'
                      )}
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </span>
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        categoryColorMap[cat.key] || 'bg-slate-400'
                      )}
                    />
                    <span
                      className="flex-1 text-left truncate"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategorySelect(cat.key);
                      }}
                    >
                      {cat.label}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {count}
                    </span>
                  </button>

                  {isExpanded && cat.children && (
                    <div className="ml-6 mt-1 space-y-0.5">
                      {cat.children.map((sub) => {
                        const subSelected = selectedCategories.includes(sub.key);
                        const subCount = categoryCounts.subCounts[sub.key] || 0;

                        return (
                          <button
                            key={sub.key}
                            onClick={() => toggleCategorySelect(sub.key)}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors',
                              subSelected
                                ? 'bg-brand-50 text-brand-700 font-medium'
                                : 'text-slate-500 hover:bg-slate-50'
                            )}
                          >
                            <span className="flex-1 text-left truncate">{sub.label}</span>
                            {subCount > 0 && (
                              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                                {subCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-[10px] bg-white p-4 shadow-card">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="按标准名称搜索..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all"
              />
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
              <SortAsc className="ml-2 h-4 w-4 text-slate-400" />
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                className="bg-transparent px-2 py-1.5 text-sm text-slate-600 outline-none cursor-pointer"
              >
                <option value="updatedAt">更新时间</option>
                <option value="weight">权重</option>
                <option value="name">名称</option>
              </select>
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
              <Filter className="ml-2 h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="bg-transparent px-2 py-1.5 text-sm text-slate-600 outline-none cursor-pointer"
              >
                <option value="all">全部状态</option>
                <option value="enabled">已启用</option>
                <option value="disabled">已停用</option>
              </select>
            </div>

            {isSupervisor && (
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-brand-600"
              >
                <Plus className="h-3.5 w-3.5" />
                新建标准
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredStandards.map((standard) => {
              const isSelected = selectedStandardId === standard.id;
              return (
                <div
                  key={standard.id}
                  onClick={() => handleSelectStandard(standard.id)}
                  className={cn(
                    'group relative cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md',
                    isSelected
                      ? 'border-brand-400 ring-2 ring-brand-100'
                      : 'border-slate-100 hover:border-slate-200'
                  )}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          categoryColorMap[standard.category] || 'bg-slate-400'
                        )}
                      />
                      <span className="text-xs font-medium text-slate-500">
                        {standard.categoryName}
                        {standard.subCategory && ` · ${standard.subCategory}`}
                      </span>
                    </div>
                    {isSupervisor ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(standard.id);
                        }}
                        className={cn(
                          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                          standard.enabled ? 'bg-success-500' : 'bg-slate-200'
                        )}
                      >
                        <span
                          className={cn(
                            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                            standard.enabled ? 'translate-x-4' : 'translate-x-0'
                          )}
                        />
                      </button>
                    ) : (
                      <StatusBadge
                        type={standard.enabled ? 'success' : 'neutral'}
                        label={standard.enabled ? '启用' : '停用'}
                      />
                    )}
                  </div>

                  <h3 className="mb-2 text-sm font-semibold text-slate-900 line-clamp-1">
                    {standard.name}
                  </h3>
                  <p className="mb-3 text-xs text-slate-500 line-clamp-2">
                    {standard.description}
                  </p>

                  <div className="mb-3 grid grid-cols-3 gap-2">
                    <div className="rounded-md bg-slate-50 px-2 py-1.5 text-center">
                      <div className="text-[10px] text-slate-400">货架类型</div>
                      <div className="text-xs font-medium text-slate-700 truncate">{standard.shelfType}</div>
                    </div>
                    <div className="rounded-md bg-slate-50 px-2 py-1.5 text-center">
                      <div className="text-[10px] text-slate-400">SKU范围</div>
                      <div className="text-xs font-medium text-slate-700">
                        {standard.minSkuCount}-{standard.maxSkuCount}
                      </div>
                    </div>
                    <div className="rounded-md bg-slate-50 px-2 py-1.5 text-center">
                      <div className="text-[10px] text-slate-400">权重</div>
                      <div className="text-xs font-medium text-slate-700">{standard.weight}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      更新于 {standard.updatedAt}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectStandard(standard.id);
                        }}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        title="查看"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {isSupervisor && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStandardId(standard.id);
                              setFormData({ ...standard });
                              setPanelMode('edit');
                            }}
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                            title="编辑"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(standard.id);
                            }}
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-danger-600 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredStandards.length === 0 && (
              <div className="col-span-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                <AlertCircle className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm text-slate-500">暂无符合条件的陈列标准</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-[380px] shrink-0 rounded-[10px] bg-white shadow-card overflow-hidden">
          {panelMode === 'none' ? (
            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Ruler className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-1 text-base font-medium text-slate-700">选择一个标准查看详情</h3>
              <p className="text-sm text-slate-400">点击左侧列表中的标准卡片</p>
              {isSupervisor && (
                <button
                  onClick={handleCreateNew}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  新建标准
                </button>
              )}
            </div>
          ) : panelMode === 'view' && selectedStandard ? (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="text-base font-semibold text-slate-900">标准详情</h3>
                <button
                  onClick={() => {
                    setSelectedStandardId(null);
                    setPanelMode('none');
                  }}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      categoryColorMap[selectedStandard.category] || 'bg-slate-400'
                    )}
                  />
                  <StatusBadge
                    type={selectedStandard.enabled ? 'success' : 'neutral'}
                    label={selectedStandard.enabled ? '已启用' : '已停用'}
                  />
                </div>

                <h2 className="text-lg font-bold text-slate-900">{selectedStandard.name}</h2>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-400">品类</div>
                    <div className="text-sm font-medium text-slate-700">
                      {selectedStandard.categoryName}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">子分类</div>
                    <div className="text-sm font-medium text-slate-700">
                      {selectedStandard.subCategory || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">货架类型</div>
                    <div className="text-sm font-medium text-slate-700">
                      {selectedStandard.shelfType}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">权重</div>
                    <div className="text-sm font-medium text-slate-700">
                      {selectedStandard.weight} 分
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-slate-400">描述</div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedStandard.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-slate-400">SKU 要求</div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700">
                      最少 {selectedStandard.minSkuCount} 个 SKU，最多 {selectedStandard.maxSkuCount} 个 SKU
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-slate-400">排面规则</div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-sm text-slate-600">{selectedStandard.facingRule}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-slate-400">价签规范</div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-sm text-slate-600">{selectedStandard.priceTagRule}</p>
                  </div>
                </div>

                {selectedStandard.promotionRule && (
                  <div className="space-y-2">
                    <div className="text-xs text-slate-400">促销要求</div>
                    <div className="rounded-lg bg-amber-50 p-3">
                      <p className="text-sm text-amber-700">{selectedStandard.promotionRule}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-xs text-slate-400">参考图</div>
                  <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
                    <ImageIcon className="h-8 w-8 text-slate-400" />
                    <span className="ml-2 text-sm text-slate-400">暂无参考图</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  更新时间：{selectedStandard.updatedAt}
                </div>
              </div>

              {isSupervisor && (
                <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
                  <button
                    onClick={handleEdit}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    编辑
                  </button>
                  <button
                    onClick={() => handleToggle(selectedStandard.id)}
                    className={cn(
                      'flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors',
                      selectedStandard.enabled
                        ? 'bg-warning-100 text-warning-700 hover:bg-warning-200'
                        : 'bg-success-100 text-success-700 hover:bg-success-200'
                    )}
                  >
                    {selectedStandard.enabled ? '停用' : '启用'}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedStandard.id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-danger-50 px-3 py-2 text-sm font-medium text-danger-600 hover:bg-danger-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (panelMode === 'edit' || panelMode === 'create') && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="text-base font-semibold text-slate-900">
                  {panelMode === 'create' ? '新建标准' : '编辑标准'}
                </h3>
                <button
                  onClick={handleCancel}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    标准名称 <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="请输入标准名称"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      品类 <span className="text-danger-500">*</span>
                    </label>
                    <select
                      value={formData.category || 'drinks'}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    >
                      {categoryTree.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      子分类
                    </label>
                    <select
                      value={formData.subCategory || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, subCategory: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    >
                      <option value="">请选择</option>
                      {categoryTree
                        .find((c) => c.key === formData.category)
                        ?.children?.map((sub) => (
                          <option key={sub.key} value={sub.key}>
                            {sub.label}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      货架类型
                    </label>
                    <input
                      type="text"
                      value={formData.shelfType || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, shelfType: e.target.value }))}
                      placeholder="如：主货架、端架等"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      权重（分）
                    </label>
                    <input
                      type="number"
                      value={formData.weight || 0}
                      onChange={(e) => setFormData((p) => ({ ...p, weight: Number(e.target.value) }))}
                      min="1"
                      max="20"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      最小 SKU 数
                    </label>
                    <input
                      type="number"
                      value={formData.minSkuCount || 0}
                      onChange={(e) => setFormData((p) => ({ ...p, minSkuCount: Number(e.target.value) }))}
                      min="1"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      最大 SKU 数
                    </label>
                    <input
                      type="number"
                      value={formData.maxSkuCount || 0}
                      onChange={(e) => setFormData((p) => ({ ...p, maxSkuCount: Number(e.target.value) }))}
                      min="1"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    描述
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="请输入标准描述"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    排面规则
                  </label>
                  <textarea
                    value={formData.facingRule || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, facingRule: e.target.value }))}
                    placeholder="请输入排面规则"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    价签规范
                  </label>
                  <textarea
                    value={formData.priceTagRule || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, priceTagRule: e.target.value }))}
                    placeholder="请输入价签规范"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    促销要求
                  </label>
                  <textarea
                    value={formData.promotionRule || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, promotionRule: e.target.value }))}
                    placeholder="请输入促销要求（选填）"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                {isSupervisor && (
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                    <div>
                      <div className="text-sm font-medium text-slate-700">启用状态</div>
                      <div className="text-xs text-slate-400">启用后将在巡检中使用此标准</div>
                    </div>
                    <button
                      onClick={() => setFormData((p) => ({ ...p, enabled: !p.enabled }))}
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                        formData.enabled ? 'bg-success-500' : 'bg-slate-300'
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                          formData.enabled ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50 px-5 py-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.name}
                  className="flex-1 rounded-lg bg-brand-500 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
