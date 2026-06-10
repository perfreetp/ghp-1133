import { useState, useMemo } from 'react';
import {
  ClipboardList, Clock, CheckCircle2, AlertTriangle,
  Plus, Search, Filter, Calendar, ChevronDown, X,
  Store, User, Eye, Camera, CalendarDays, ListTodo
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAppStore, type InspectionTask, type TaskType, type TaskStatus, type CategoryType, type NewTaskForm } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const typeLabels: Record<TaskType, { label: string; className: string }> = {
  weekly: { label: '周检', className: 'bg-brand-50 text-brand-700 border-brand-100' },
  monthly: { label: '月检', className: 'bg-purple-50 text-purple-700 border-purple-100' },
  temporary: { label: '临时', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  promotion: { label: '促销', className: 'bg-pink-50 text-pink-700 border-pink-100' },
};

const statusLabels: Record<TaskStatus, { label: string; type: 'success' | 'pending' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  pending: { label: '待执行', type: 'pending' },
  in_progress: { label: '进行中', type: 'info' },
  completed: { label: '已完成', type: 'success' },
  overdue: { label: '已超时', type: 'danger' },
};

const categoryOptions: { value: CategoryType; label: string; color: string }[] = [
  { value: 'drinks', label: '饮料', color: 'bg-blue-500' },
  { value: 'snacks', label: '零食', color: 'bg-amber-500' },
  { value: 'daily', label: '日用品', color: 'bg-green-500' },
  { value: 'fresh', label: '生鲜', color: 'bg-emerald-500' },
  { value: 'frozen', label: '冷冻', color: 'bg-cyan-500' },
  { value: 'others', label: '其他', color: 'bg-slate-500' },
];

export default function InspectionTasksPage() {
  const navigate = useNavigate();
  const { currentUser, getAllTasks, stores, standards, createTask } = useAppStore();
  const allTasks = getAllTasks();

  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TaskType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<NewTaskForm>({
    type: 'weekly',
    title: '',
    storeIds: [],
    assigneeId: '',
    startTime: '',
    deadline: '',
    categories: [],
  });

  const stats = useMemo(() => {
    const total = allTasks.length;
    const pending = allTasks.filter((t) => t.status === 'pending').length;
    const inProgress = allTasks.filter((t) => t.status === 'in_progress').length;
    const completed = allTasks.filter((t) => t.status === 'completed').length;
    const overdue = allTasks.filter((t) => t.status === 'overdue').length;
    const weekStart = new Date('2026-06-08').getTime();
    const weekEnd = new Date('2026-06-15').getTime();
    const thisWeek = allTasks.filter((t) => {
      const ct = new Date(t.createdAt).getTime();
      return ct >= weekStart && ct <= weekEnd;
    }).length;
    return { total, pending, inProgress, completed, overdue, thisWeek };
  }, [allTasks]);

  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (searchText && !task.title.includes(searchText) && !task.storeName.includes(searchText)) return false;
      if (typeFilter !== 'all' && task.type !== typeFilter) return false;
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (startDate && new Date(task.startTime) < new Date(startDate)) return false;
      if (endDate && new Date(task.deadline) > new Date(endDate + ' 23:59')) return false;
      return true;
    });
  }, [allTasks, searchText, typeFilter, statusFilter, startDate, endDate]);

  const toggleStore = (storeId: string) => {
    setFormData((prev) => ({
      ...prev,
      storeIds: prev.storeIds.includes(storeId)
        ? prev.storeIds.filter((id) => id !== storeId)
        : [...prev.storeIds, storeId],
    }));
  };

  const toggleCategory = (cat: CategoryType) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handleCreateTask = () => {
    if (!formData.title || formData.storeIds.length === 0 || !formData.assigneeId || !formData.startTime || !formData.deadline) {
      return;
    }
    createTask(formData);
    setShowModal(false);
    setFormData({ type: 'weekly', title: '', storeIds: [], assigneeId: '', startTime: '', deadline: '', categories: [] });
  };

  const handleStartVerify = (taskId: string) => {
    navigate(`/photo-verification/${taskId}`);
  };

  const statusOptions: { value: 'all' | TaskStatus; label: string }[] = [
    { value: 'all', label: '全部状态' },
    { value: 'pending', label: '待执行' },
    { value: 'in_progress', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'overdue', label: '已超时' },
  ];

  const columns = [
    {
      key: 'title',
      title: '任务标题',
      width: '200px',
      render: (row: InspectionTask) => (
        <div className="space-y-1">
          <button
            onClick={() => setExpandedRowId(expandedRowId === row.id ? null : row.id)}
            className="flex items-center gap-2 font-medium text-slate-800 hover:text-brand-600 transition-colors"
          >
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', expandedRowId === row.id && 'rotate-180')}
            />
            {row.title}
          </button>
          {expandedRowId === row.id && (
            <div className="ml-6 mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 space-y-1 animate-fade-in">
              <div>任务编号：<span className="font-mono text-slate-700">{row.id}</span></div>
              <div>创建人：{row.creatorName}</div>
              <div>创建时间：{row.createdAt}</div>
              <div>检查项：通过 {row.passItems} / 有问题 {row.failItems} / 待检 {row.itemCount - row.completedItems}</div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      title: '类型',
      width: '80px',
      align: 'center' as const,
      render: (row: InspectionTask) => {
        const config = typeLabels[row.type];
        return (
          <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', config.className)}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'storeName',
      title: '门店名称',
      width: '150px',
      render: (row: InspectionTask) => (
        <div className="flex items-center gap-2 text-slate-700">
          <Store className="h-4 w-4 text-slate-400" />
          <span className="truncate">{row.storeName}</span>
        </div>
      ),
    },
    {
      key: 'assigneeName',
      title: '执行人',
      width: '100px',
      render: (row: InspectionTask) => (
        <div className="flex items-center gap-2 text-slate-700">
          <User className="h-4 w-4 text-slate-400" />
          <span>{row.assigneeName}</span>
        </div>
      ),
    },
    {
      key: 'progress',
      title: '检查进度',
      width: '180px',
      render: (row: InspectionTask) => {
        const percent = Math.round((row.completedItems / row.itemCount) * 100);
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">{row.completedItems}/{row.itemCount} 项</span>
              <span className="font-medium text-slate-700">{percent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  percent === 100 ? 'bg-success-500' : percent > 50 ? 'bg-brand-500' : 'bg-amber-500'
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'startTime',
      title: '开始时间',
      width: '140px',
      render: (row: InspectionTask) => (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
          {row.startTime}
        </div>
      ),
    },
    {
      key: 'deadline',
      title: '截止时间',
      width: '140px',
      render: (row: InspectionTask) => (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {row.deadline}
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      width: '100px',
      align: 'center' as const,
      render: (row: InspectionTask) => {
        const config = statusLabels[row.status];
        return <StatusBadge type={config.type} label={config.label} />;
      },
    },
    {
      key: 'actions',
      title: '操作',
      width: '180px',
      align: 'center' as const,
      render: (row: InspectionTask) => (
        <div className="flex items-center justify-center gap-2">
          <button className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <Eye className="h-3.5 w-3.5" />
            查看详情
          </button>
          {currentUser.role === 'manager' && row.status === 'in_progress' && (
            <button
              onClick={() => handleStartVerify(row.id)}
              className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
              开始验收
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">巡检任务</h1>
          <p className="mt-1 text-sm text-slate-500">管理和跟踪所有巡检任务的执行状态</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard title="总任务数" value={stats.total} icon={<ListTodo className="h-5 w-5" />} className="" />
        <StatCard title="待执行" value={stats.pending} icon={<Clock className="h-5 w-5 text-amber-500" />} className="" />
        <StatCard title="进行中" value={stats.inProgress} icon={<ClipboardList className="h-5 w-5 text-brand-500" />} className="" />
        <StatCard title="已完成" value={stats.completed} icon={<CheckCircle2 className="h-5 w-5 text-success-500" />} className="" />
        <StatCard title="已超时" value={stats.overdue} icon={<AlertTriangle className="h-5 w-5 text-danger-500" />} className="" />
        <StatCard title="本周新增" value={stats.thisWeek} icon={<Plus className="h-5 w-5 text-purple-500" />} className="" />
      </div>

      <div className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索任务标题或门店名..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            {(['all', 'weekly', 'monthly', 'temporary', 'promotion'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                  typeFilter === t
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                )}
              >
                {t === 'all' ? '全部' : typeLabels[t].label}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Filter className="h-4 w-4 text-slate-400" />
              {statusFilter === 'all' ? '全部状态' : statusLabels[statusFilter].label}
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-popover animate-scale-in">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setStatusFilter(opt.value); setShowStatusDropdown(false); }}
                    className={cn(
                      'block w-full px-4 py-2 text-left text-sm transition-colors',
                      statusFilter === opt.value ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-sm text-slate-700 outline-none"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-sm text-slate-700 outline-none"
            />
          </div>

          {currentUser.role === 'supervisor' && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 hover:shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              新建任务
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredTasks}
        rowKey="id"
        emptyText="暂无符合条件的巡检任务"
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 animate-fade-in">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-[12px] bg-white shadow-popover animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">新建巡检任务</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-130px)] space-y-5 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">任务类型</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value as TaskType }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="weekly">周检</option>
                    <option value="monthly">月检</option>
                    <option value="temporary">临时</option>
                    <option value="promotion">促销</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">任务标题</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    placeholder="请输入任务标题"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  选择门店（可多选）<span className="text-danger-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  {stores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => toggleStore(store.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all',
                        formData.storeIds.includes(store.id)
                          ? 'border-brand-400 bg-brand-50 text-brand-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      )}
                    >
                      <Store className="h-3.5 w-3.5" />
                      {store.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">执行人</label>
                  <select
                    value={formData.assigneeId}
                    onChange={(e) => setFormData((p) => ({ ...p, assigneeId: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="">请选择执行人</option>
                    {stores.map((s) => (
                      <option key={s.managerId} value={s.managerId}>{s.name} - 店长</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">开始时间</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime ? formData.startTime.replace(' ', 'T') : ''}
                    onChange={(e) => setFormData((p) => ({ ...p, startTime: e.target.value.replace('T', ' ')}))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">截止时间</label>
                <input
                  type="datetime-local"
                  value={formData.deadline ? formData.deadline.replace(' ', 'T') : ''}
                  onChange={(e) => setFormData((p) => ({ ...p, deadline: e.target.value.replace('T', ' ')}))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  检查项分类（可多选，不选则使用默认分类）
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((cat) => {
                    const isActive = formData.categories.includes(cat.value);
                    return (
                      <button
                        key={cat.value}
                        onClick={() => toggleCategory(cat.value)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border',
                          isActive
                            ? 'text-white shadow-sm border-transparent'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        )}
                        style={isActive ? { backgroundColor: cat.color.replace('bg-', '').includes('500') ? undefined : undefined } : undefined}
                      >
                        <span
                          className={cn('h-2 w-2 rounded-full', cat.color)}
                          style={isActive ? { backgroundColor: 'rgba(255,255,255,0.8)' } : undefined}
                        />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">自动生成清单预览</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  {standards.slice(0, 3).map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-md bg-white px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium text-slate-600">
                          {standards.indexOf(s) + 1}
                        </span>
                        <span className="text-slate-700">{s.name}</span>
                      </div>
                      <span className="text-slate-400">{s.weight}分</span>
                    </div>
                  ))}
                  <div className="text-center text-slate-400 pt-1">... 还有约 {Math.max(0, (formData.categories.length || 3) * 6 - 3)} 项待生成</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!formData.title || formData.storeIds.length === 0 || !formData.assigneeId || !formData.startTime || !formData.deadline}
                className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
