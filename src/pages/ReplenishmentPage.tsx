import { Package, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { useAppStore } from '@/store/useAppStore';
import EmptyState from '@/components/ui/EmptyState';

export default function ReplenishmentPage() {
  const { getReplenishmentsByStoreId, getStoresByCurrentUser } = useAppStore();
  const stores = getStoresByCurrentUser();
  const allReplenishments = stores.flatMap(s => getReplenishmentsByStoreId(s.id));

  const urgentCount = allReplenishments.filter(r => r.urgency === 'urgent' || r.urgency === 'critical').length;
  const criticalCount = allReplenishments.filter(r => r.urgency === 'critical').length;
  const totalQty = allReplenishments.reduce((s, r) => s + r.suggestedQty, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">补货建议</h1>
          <p className="text-sm text-slate-500 mt-1">根据缺货记录智能生成补货建议清单</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="建议总数"
          value={allReplenishments.length}
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard
          title="紧急补货"
          value={urgentCount}
          change={-10.5}
          icon={<AlertTriangle className="w-5 h-5 text-danger-500" />}
        />
        <StatCard
          title="严重缺货"
          value={criticalCount}
          change={25.0}
          icon={<CheckCircle2 className="w-5 h-5 text-warning-500" />}
        />
        <StatCard
          title="建议补货总量"
          value={totalQty}
          change={12.8}
          icon={<TrendingDown className="w-5 h-5" />}
        />
      </div>

      <div className="rounded-[10px] bg-white shadow-card p-8">
        <EmptyState
          icon={<Package className="w-12 h-12" />}
          title="补货建议列表"
          description="补货管理组件开发中，敬请期待"
        />
      </div>
    </div>
  );
}
