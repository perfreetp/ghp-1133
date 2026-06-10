import { Ruler, Search, Plus, Filter } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { useAppStore } from '@/store/useAppStore';
import EmptyState from '@/components/ui/EmptyState';

export default function DisplayStandardsPage() {
  const { standards, currentUser } = useAppStore();
  const isSupervisor = currentUser.role === 'supervisor';

  const enabledCount = standards.filter(s => s.enabled).length;
  const categories = new Set(standards.map(s => s.categoryName)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">陈列标准</h1>
          <p className="text-sm text-slate-500 mt-1">管理各品类商品的门店陈列规范{!isSupervisor && '（只读）'}</p>
        </div>
        {isSupervisor && (
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            新增标准
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="标准总数"
          value={standards.length}
          icon={<Ruler className="w-5 h-5" />}
        />
        <StatCard
          title="启用标准"
          value={enabledCount}
          change={3.6}
          icon={<Ruler className="w-5 h-5" />}
        />
        <StatCard
          title="覆盖品类"
          value={categories}
          icon={<Filter className="w-5 h-5" />}
        />
      </div>

      <div className="rounded-[10px] bg-white shadow-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索陈列标准..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>

        <EmptyState
          icon={<Ruler className="w-12 h-12" />}
          title="陈列标准列表"
          description="标准数据表格组件开发中，敬请期待"
        />
      </div>
    </div>
  );
}
