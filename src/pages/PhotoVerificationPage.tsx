import { useState, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Camera,
  Upload,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Clock,
  AlertTriangle,
  AlertCircle,
  Plus,
  X,
  Check,
  ChevronRight,
  Save,
  Send,
  Tag,
  Package,
  FileText,
  SkipForward,
  Trash2,
  ZoomIn,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAppStore, type InspectionItem, type IssueRecord, type PhotoRecord } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

type QuickIssueType = 'outOfStock' | 'misplaced' | 'priceTag' | 'promotion';

const quickIssueConfig: Record<QuickIssueType, { label: string; color: string; bg: string; border: string; icon: string }> = {
  outOfStock: { label: '缺货', color: 'text-danger-600', bg: 'bg-danger-50', border: 'border-danger-200', icon: '📦' },
  misplaced: { label: '错位', color: 'text-warning-600', bg: 'bg-warning-50', border: 'border-warning-200', icon: '🔄' },
  priceTag: { label: '价签问题', color: 'text-brand-600', bg: 'bg-brand-50', border: 'border-brand-200', icon: '🏷️' },
  promotion: { label: '促销牌', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: '📢' },
};

const issueTypeMap: Record<string, { typeName: string; type: string }> = {
  outOfStock: { typeName: '缺货', type: 'outOfStock' },
  misplaced: { typeName: '错位', type: 'misplaced' },
  priceTag: { typeName: '价签问题', type: 'priceTag' },
  promotion: { typeName: '促销牌', type: 'promotion' },
};

const priorityOptions = [
  { value: 'high', label: '高', color: 'text-danger-600', bg: 'bg-danger-50' },
  { value: 'medium', label: '中', color: 'text-warning-600', bg: 'bg-warning-50' },
  { value: 'low', label: '低', color: 'text-slate-600', bg: 'bg-slate-50' },
];

const generateId = () => Math.random().toString(36).substring(2, 10);

export default function PhotoVerificationPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tasks = useAppStore(state => state.tasks);
  const updateItemStatus = useAppStore(state => state.updateItemStatus);
  const addPhotoRecord = useAppStore(state => state.addPhotoRecord);
  const addIssueRecord = useAppStore(state => state.addIssueRecord);
  const currentUser = useAppStore(state => state.currentUser);

  const task = useMemo(() => {
    if (!taskId) return undefined;
    return tasks.find(t => t.id === taskId);
  }, [tasks, taskId]);

  const items = task?.items || [];

  const [currentItemId, setCurrentItemId] = useState<string | null>(() => {
    if (!task) return null;
    const firstPending = task.items.find((i) => i.status === 'pending');
    return firstPending?.id || task.items[0]?.id || null;
  });

  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState('');

  const [newIssue, setNewIssue] = useState({
    skuName: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    description: '',
    type: 'outOfStock' as QuickIssueType,
  });

  const currentItem = useMemo(() => {
    return items.find((i) => i.id === currentItemId) || null;
  }, [items, currentItemId]);

  const stats = useMemo(() => {
    const pass = items.filter((i) => i.status === 'pass').length;
    const fail = items.filter((i) => i.status === 'fail').length;
    const pending = items.filter((i) => i.status === 'pending').length;
    const completed = pass + fail;
    const total = items.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { pass, fail, pending, completed, total, percent };
  }, [items]);

  const currentItemPhotoCount = currentItem?.photoRecords.length || 0;
  const currentItemIssueCount = currentItem?.issueRecords.length || 0;

  const totalPhotos = items.reduce((acc, i) => acc + i.photoRecords.length, 0);
  const totalIssues = items.reduce((acc, i) => acc + i.issueRecords.length, 0);

  const typeLabelMap: Record<string, { label: string; className: string }> = {
    weekly: { label: '周检', className: 'bg-brand-50 text-brand-700 border-brand-100' },
    monthly: { label: '月检', className: 'bg-purple-50 text-purple-700 border-purple-100' },
    temporary: { label: '临时', className: 'bg-amber-50 text-amber-700 border-amber-100' },
    promotion: { label: '促销', className: 'bg-pink-50 text-pink-700 border-pink-100' },
  };

  const getRemainingTime = () => {
    if (!task) return '';
    const deadline = new Date(task.deadline.replace(' ', 'T')).getTime();
    const now = Date.now();
    const diff = deadline - now;
    if (diff <= 0) return '已超时';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `剩余 ${days} 天 ${hours % 24} 小时`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `剩余 ${hours} 小时 ${minutes} 分钟`;
  };

  const handleItemClick = (itemId: string) => {
    setCurrentItemId(itemId);
    setSelectedPhotoId(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !currentItem || !taskId) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const photo: PhotoRecord = {
          id: `ph-${generateId()}`,
          itemId: currentItem.id,
          taskId,
          url,
          uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          uploadedBy: currentUser.id,
          marks: [],
        };
        addPhotoRecord(taskId, currentItem.id, photo);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddQuickIssue = (type: QuickIssueType) => {
    setNewIssue((prev) => ({ ...prev, type }));
  };

  const handleAddIssue = () => {
    if (!currentItem || !taskId) return;

    const typeInfo = issueTypeMap[newIssue.type];
    const priorityMap: Record<string, string> = { high: '高', medium: '中', low: '低' };

    const issue: IssueRecord = {
      id: `issue-${generateId()}`,
      itemId: currentItem.id,
      taskId,
      type: newIssue.type as any,
      typeName: typeInfo?.typeName || newIssue.type,
      priority: newIssue.priority,
      priorityName: priorityMap[newIssue.priority],
      description: newIssue.description || `${typeInfo?.typeName}问题`,
      skuName: newIssue.skuName || undefined,
      photoId: selectedPhotoId || undefined,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      createdBy: currentUser.id,
      resolved: false,
    };

    addIssueRecord(taskId, currentItem.id, issue);

    setNewIssue({
      skuName: '',
      priority: 'medium',
      description: '',
      type: 'outOfStock',
    });
  };

  const handleMarkPass = () => {
    if (!currentItem || !taskId) return;
    updateItemStatus(taskId, currentItem.id, 'pass');
    goToNextPending();
  };

  const handleSaveAndNext = () => {
    if (!currentItem || !taskId) return;
    if (currentItem.issueRecords.length > 0) {
      updateItemStatus(taskId, currentItem.id, 'fail');
    }
    goToNextPending();
  };

  const handleSkip = () => {
    goToNextPending();
  };

  const goToNextPending = () => {
    const currentIndex = items.findIndex((i) => i.id === currentItemId);
    for (let i = currentIndex + 1; i < items.length; i++) {
      if (items[i].status === 'pending') {
        setCurrentItemId(items[i].id);
        setSelectedPhotoId(null);
        return;
      }
    }
    for (let i = 0; i < currentIndex; i++) {
      if (items[i].status === 'pending') {
        setCurrentItemId(items[i].id);
        setSelectedPhotoId(null);
        return;
      }
    }
  };

  const handleSubmit = () => {
    if (stats.pending > 0) {
      alert('还有未检查的项目，请全部检查完成后再提交');
      return;
    }
    if (confirm('确定要提交验收报告吗？')) {
      navigate('/inspection-tasks');
    }
  };

  const handleSaveDraft = () => {
    alert('草稿已保存');
  };

  const handlePreviewPhoto = (url: string) => {
    setPreviewPhotoUrl(url);
    setShowPhotoPreview(true);
  };

  const getItemStatusIcon = (item: InspectionItem) => {
    switch (item.status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-success-500" />;
      case 'fail':
        return <AlertCircle className="h-5 w-5 text-danger-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-slate-300" />;
    }
  };

  if (!task) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-amber-400" />
          <h2 className="mb-2 text-lg font-semibold text-slate-700">任务不存在</h2>
          <p className="mb-4 text-sm text-slate-500">未找到对应的巡检任务</p>
          <button
            onClick={() => navigate('/inspection-tasks')}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回任务列表
          </button>
        </div>
      </div>
    );
  }

  const typeConfig = typeLabelMap[task.type] || typeLabelMap.weekly;

  return (
    <div className="relative flex h-[calc(100vh-80px)] flex-col space-y-4">
      <div className="flex shrink-0 items-center justify-between rounded-[10px] bg-white px-5 py-3 shadow-card">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/inspection-tasks')}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{task.title}</h1>
              <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', typeConfig.className)}>
                {typeConfig.label}
              </span>
            </div>
            <p className="text-sm text-slate-500">{task.storeName}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="w-64">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-slate-500">检查进度</span>
              <span className="font-medium text-slate-700">{stats.completed}/{stats.total} 项 · {stats.percent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  stats.percent === 100 ? 'bg-success-500' : stats.percent > 50 ? 'bg-brand-500' : 'bg-amber-500'
                )}
                style={{ width: `${stats.percent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className={cn(
              'font-medium',
              stats.pending === 0 ? 'text-success-600' : 'text-slate-600'
            )}>
              {getRemainingTime()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        <div className="flex w-[300px] shrink-0 flex-col rounded-[10px] bg-white shadow-card overflow-hidden">
          <div className="border-b border-slate-100 p-4">
            <div className="mb-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-success-50 p-2 text-center">
                <div className="text-lg font-bold text-success-600">{stats.pass}</div>
                <div className="text-[10px] text-success-500">通过</div>
              </div>
              <div className="rounded-lg bg-danger-50 p-2 text-center">
                <div className="text-lg font-bold text-danger-600">{stats.fail}</div>
                <div className="text-[10px] text-danger-500">问题</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 text-center">
                <div className="text-lg font-bold text-slate-600">{stats.pending}</div>
                <div className="text-[10px] text-slate-500">待检</div>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-slate-700">检查项清单</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {items.map((item, index) => {
              const isActive = item.id === currentItemId;
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    'mb-1 cursor-pointer rounded-lg border p-3 transition-all',
                    isActive
                      ? 'border-brand-400 bg-brand-50/60 shadow-sm ring-2 ring-brand-100'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                      {getItemStatusIcon(item)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400">#{index + 1}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                          {item.categoryName}
                        </span>
                      </div>
                      <h4 className="mt-1 text-sm font-medium text-slate-700 line-clamp-2">
                        {item.standardName}
                      </h4>
                      {(item.photoRecords.length > 0 || item.issueRecords.length > 0) && (
                        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            {item.photoRecords.length}
                          </span>
                          {item.issueRecords.length > 0 && (
                            <span className="flex items-center gap-1 text-danger-500">
                              <AlertCircle className="h-3 w-3" />
                              {item.issueRecords.length}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className={cn('h-4 w-4 shrink-0 text-slate-300', isActive && 'text-brand-500')} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-1 flex-col rounded-[10px] bg-white shadow-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">
                {currentItem ? currentItem.standardName : '请选择检查项'}
              </h3>
              {currentItem && (
                <p className="text-xs text-slate-400">
                  {currentItem.categoryName} · {currentItem.standardCode}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                上传图片
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 transition-colors"
              >
                <Camera className="h-3.5 w-3.5" />
                拍照
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {currentItem && currentItem.photoRecords.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-full min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 via-slate-50 to-purple-50 ring-1 ring-slate-200/60 transition-all hover:ring-brand-300"
              >
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                  <Camera className="h-10 w-10 text-brand-500" />
                </div>
                <h3 className="mb-1 text-base font-medium text-slate-700">点击拍照或上传图片</h3>
                <p className="text-sm text-slate-400">支持多张照片上传</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {currentItem?.photoRecords.map((photo) => {
                    const isSelected = selectedPhotoId === photo.id;
                    return (
                      <div
                        key={photo.id}
                        className={cn(
                          'group relative aspect-square overflow-hidden rounded-lg ring-2 transition-all cursor-pointer',
                          isSelected ? 'ring-brand-500' : 'ring-slate-200 hover:ring-brand-300'
                        )}
                        onClick={() => setSelectedPhotoId(photo.id)}
                      >
                        <img
                          src={photo.url}
                          alt="检查照片"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewPhoto(photo.url);
                          }}
                          className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                        >
                          <ZoomIn className="h-3.5 w-3.5 text-slate-600" />
                        </button>
                        {photo.marks.length > 0 && (
                          <div className="absolute bottom-2 left-2 flex -space-x-1">
                            {photo.marks.slice(0, 3).map((mark, idx) => (
                              <div
                                key={mark.id}
                                className={cn(
                                  'h-4 w-4 rounded-full border-2 border-white',
                                  mark.type === 'outOfStock' && 'bg-danger-500',
                                  mark.type === 'misplaced' && 'bg-warning-500',
                                  mark.type === 'priceTag' && 'bg-brand-500',
                                  mark.type === 'promotion' && 'bg-purple-500',
                                )}
                                style={{ zIndex: 3 - idx }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-brand-400 hover:bg-brand-50/50"
                  >
                    <Plus className="mb-1 h-6 w-6 text-slate-400" />
                    <span className="text-xs text-slate-500">添加照片</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex w-[340px] shrink-0 flex-col rounded-[10px] bg-white shadow-card overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-700">问题记录</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4 grid grid-cols-4 gap-2">
              {(Object.keys(quickIssueConfig) as QuickIssueType[]).map((type) => {
                const config = quickIssueConfig[type];
                const isActive = newIssue.type === type;
                return (
                  <button
                    key={type}
                    onClick={() => handleAddQuickIssue(type)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border p-2 transition-all',
                      isActive
                        ? `${config.bg} ${config.border} ring-2 ring-offset-1`
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    )}
                    style={isActive ? { boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)' } : {}}
                  >
                    <span className="text-lg">{config.icon}</span>
                    <span className={cn('text-[10px] font-medium', config.color)}>{config.label}</span>
                  </button>
                );
              })}
            </div>

            {currentItem && currentItem.issueRecords.length > 0 && (
              <div className="mb-4 space-y-2">
                <div className="text-xs font-medium text-slate-500">已记录问题 ({currentItem.issueRecords.length})</div>
                {currentItem.issueRecords.map((issue) => {
                  const typeConfig = quickIssueConfig[issue.type as QuickIssueType] || quickIssueConfig.outOfStock;
                  const priorityConfig = priorityOptions.find((p) => p.value === issue.priority);
                  return (
                    <div
                      key={issue.id}
                      className="rounded-lg border border-slate-200 p-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className={cn('inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium', typeConfig.bg, typeConfig.color)}>
                          {typeConfig.label}
                        </span>
                        <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', priorityConfig?.bg, priorityConfig?.color)}>
                          {issue.priorityName}
                        </span>
                      </div>
                      {issue.skuName && (
                        <div className="mb-1 flex items-center gap-1 text-xs text-slate-600">
                          <Package className="h-3 w-3 text-slate-400" />
                          <span className="truncate">{issue.skuName}</span>
                        </div>
                      )}
                      <p className="text-xs text-slate-500 line-clamp-2">{issue.description}</p>
                      {issue.photoId && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                          <ImageIcon className="h-3 w-3" />
                          关联照片
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-3 rounded-lg bg-slate-50 p-3">
              <div className="text-xs font-medium text-slate-600">添加问题</div>

              <div>
                <label className="mb-1 block text-[11px] text-slate-500">SKU 名称</label>
                <input
                  type="text"
                  value={newIssue.skuName}
                  onChange={(e) => setNewIssue((p) => ({ ...p, skuName: e.target.value }))}
                  placeholder="选填，如：可口可乐 330ml"
                  className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] text-slate-500">严重程度</label>
                <div className="flex gap-1">
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setNewIssue((p) => ({ ...p, priority: opt.value as any }))}
                      className={cn(
                        'flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                        newIssue.priority === opt.value
                          ? `${opt.bg} ${opt.color} ring-1 ring-current/30`
                          : 'bg-white text-slate-500 hover:bg-slate-100'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] text-slate-500">问题描述</label>
                <textarea
                  value={newIssue.description}
                  onChange={(e) => setNewIssue((p) => ({ ...p, description: e.target.value }))}
                  placeholder="描述问题详情..."
                  rows={2}
                  className="w-full resize-none rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
                />
              </div>

              <button
                onClick={handleAddIssue}
                disabled={!currentItem}
                className="flex w-full items-center justify-center gap-1 rounded-md bg-brand-500 py-1.5 text-xs font-medium text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-3.5 w-3.5" />
                添加问题
              </button>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 bg-slate-50 p-3">
            <button
              onClick={handleMarkPass}
              disabled={!currentItem}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-success-500 py-2 text-sm font-medium text-white hover:bg-success-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="h-4 w-4" />
              标记为通过
            </button>
            <button
              onClick={handleSaveAndNext}
              disabled={!currentItem}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-500 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              保存并下一项
            </button>
            <button
              onClick={handleSkip}
              disabled={!currentItem}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipForward className="h-4 w-4" />
              跳过此项
            </button>
          </div>
        </div>
      </div>

      <div className="shrink-0 rounded-[10px] bg-white px-5 py-3 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ImageIcon className="h-4 w-4 text-slate-400" />
              <span>已拍照 <span className="font-semibold text-slate-800">{totalPhotos}</span> 张</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <AlertCircle className="h-4 w-4 text-danger-500" />
              <span>已记录问题 <span className="font-semibold text-slate-800">{totalIssues}</span> 个</span>
            </div>
            <button
              onClick={handleSaveDraft}
              className="ml-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Save className="h-4 w-4" />
              保存草稿
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={stats.pending > 0}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium text-white transition-all shadow-md',
              stats.pending > 0
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-600 hover:to-indigo-600 hover:shadow-lg'
            )}
          >
            <Send className="h-4 w-4" />
            提交验收报告
          </button>
        </div>
      </div>

      {showPhotoPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8"
          onClick={() => setShowPhotoPreview(false)}
        >
          <button
            onClick={() => setShowPhotoPreview(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={previewPhotoUrl}
            alt="预览"
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
