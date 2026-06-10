import { useState, useMemo } from 'react'
import {
  ClipboardList,
  Clock,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Eye,
  UserPlus,
  Bell,
  Send,
  ThumbsUp,
  ThumbsDown,
  Plus,
  LayoutGrid,
  List,
  MessageSquare,
  Paperclip,
  Image,
  Upload,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  MapPin,
  Filter,
  X,
} from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import DataTable, { type Column } from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAppStore, type RectificationOrder } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

type OrderStatus = RectificationOrder['status']

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; border: string; headerBg: string }> = {
  pending: {
    label: '待整改',
    color: 'text-danger-700',
    bg: 'bg-danger-50',
    border: 'border-danger-200',
    headerBg: 'from-danger-500 to-red-500',
  },
  processing: {
    label: '整改中',
    color: 'text-warning-700',
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    headerBg: 'from-warning-500 to-orange-500',
  },
  reviewing: {
    label: '待复查',
    color: 'text-brand-700',
    bg: 'bg-brand-50',
    border: 'border-brand-200',
    headerBg: 'from-brand-500 to-indigo-500',
  },
  passed: {
    label: '已通过',
    color: 'text-success-700',
    bg: 'bg-success-50',
    border: 'border-success-200',
    headerBg: 'from-success-500 to-emerald-500',
  },
  rejected: {
    label: '已驳回',
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    headerBg: 'from-slate-500 to-slate-600',
  },
}

const priorityConfig = {
  high: { label: '高', bg: 'bg-danger-100 text-danger-700 border-danger-200' },
  medium: { label: '中', bg: 'bg-warning-100 text-warning-700 border-warning-200' },
  low: { label: '低', bg: 'bg-slate-100 text-slate-600 border-slate-200' },
}

const issueTypeLabels: Record<string, string> = {
  promotion: '促销陈列',
  price_tag: '价签问题',
  out_of_stock: '缺货问题',
  display: '陈列问题',
  cleanliness: '清洁问题',
}

const kanbanColumns: { key: OrderStatus; title: string }[] = [
  { key: 'pending', title: '待整改' },
  { key: 'processing', title: '整改中' },
  { key: 'reviewing', title: '待复查' },
  { key: 'passed', title: '已完成' },
]

const sampleImages = [
  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&h=300&fit=crop',
]

function daysUntil(deadline: string): number {
  const now = new Date()
  const d = new Date(deadline)
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

interface TimelineEvent {
  status: string
  label: string
  time: string
  user: string
}

function RectificationPage() {
  const { orders, stores, currentUser, updateOrderStatus } = useAppStore()
  const isSupervisor = currentUser.role === 'supervisor'

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [selectedOrder, setSelectedOrder] = useState<RectificationOrder | null>(null)
  const [detailImageIndex, setDetailImageIndex] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [reviewOpinion, setReviewOpinion] = useState('')

  const total = orders.length
  const counts = useMemo(() => {
    const c = { pending: 0, processing: 0, reviewing: 0, passed: 0, rejected: 0, overdue: 0 }
    orders.forEach((o) => {
      c[o.status]++
      if (daysUntil(o.deadline) < 0 && o.status !== 'passed' && o.status !== 'rejected') {
        c.overdue++
      }
    })
    return c
  }, [orders])

  const pct = (n: number) => (total === 0 ? 0 : ((n / total) * 100).toFixed(1))

  const groupedByStatus = useMemo(() => {
    const g: Record<OrderStatus, RectificationOrder[]> = {
      pending: [],
      processing: [],
      reviewing: [],
      passed: [],
      rejected: [],
    }
    orders.forEach((o) => {
      if (o.status === 'rejected') {
        g.pending.push(o)
      } else {
        g[o.status].push(o)
      }
    })
    return g
  }, [orders])

  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status)
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status })
    }
  }

  const timeline: TimelineEvent[] = useMemo(() => {
    if (!selectedOrder) return []
    return [
      { status: 'created', label: '工单创建', time: selectedOrder.createdAt, user: selectedOrder.assignorName },
      { status: 'assigned', label: '已指派', time: selectedOrder.createdAt, user: selectedOrder.assignorName },
      ...(selectedOrder.status !== 'pending'
        ? [{ status: 'started', label: '开始整改', time: '2026-06-10 09:15', user: selectedOrder.assigneeName }]
        : []),
      ...(selectedOrder.status === 'reviewing' || selectedOrder.status === 'passed' || selectedOrder.status === 'rejected'
        ? [{ status: 'submitted', label: '提交整改', time: '2026-06-11 14:30', user: selectedOrder.assigneeName }]
        : []),
      ...(selectedOrder.status === 'passed'
        ? [{ status: 'passed', label: '复查通过', time: '2026-06-12 10:00', user: selectedOrder.assignorName }]
        : []),
      ...(selectedOrder.status === 'rejected'
        ? [{ status: 'rejected', label: '复查驳回', time: '2026-06-12 10:00', user: selectedOrder.assignorName }]
        : []),
    ]
  }, [selectedOrder])

  const OrderCard = ({ order }: { order: RectificationOrder }) => {
    const days = daysUntil(order.deadline)
    const isOverdue = days < 0 && order.status !== 'passed' && order.status !== 'rejected'
    const pConf = priorityConfig[order.priority]
    const truncated = order.description.length > 30 ? order.description.slice(0, 30) + '...' : order.description
    const hasPhoto = Math.random() > 0.3
    const commentCount = Math.floor(Math.random() * 5)
    const attachmentCount = Math.floor(Math.random() * 3)

    return (
      <div
        onClick={() => setSelectedOrder(order)}
        className="group rounded-xl border border-slate-200 bg-white p-4 shadow-card hover:shadow-card-hover cursor-pointer transition-all hover:-translate-y-0.5"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', pConf.bg)}>
            {pConf.label}优先级
          </span>
          <span className="text-xs text-slate-400 font-mono">#{order.id.toUpperCase()}</span>
        </div>
        <p className="text-sm text-slate-800 font-medium leading-relaxed mb-3">{truncated}</p>
        <div className="space-y-1.5 mb-3">
          <span className="inline-flex items-center rounded bg-slate-50 px-2 py-0.5 text-xs text-slate-600 border border-slate-100">
            {issueTypeLabels[order.issueType] || order.issueType}
          </span>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{order.storeName}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500">
            <User className="h-3 w-3" />
            <span>{order.assigneeName}</span>
          </div>
          <div className={cn('flex items-center gap-1 font-medium', isOverdue ? 'text-danger-600' : 'text-slate-500')}>
            <Calendar className="h-3 w-3" />
            {isOverdue ? `超期${Math.abs(days)}天` : days === 0 ? '今日截止' : `剩余${days}天`}
          </div>
        </div>
        {(hasPhoto || commentCount > 0 || attachmentCount > 0) && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
            {hasPhoto && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Image className="h-3.5 w-3.5" />
                <span>照片</span>
              </div>
            )}
            {commentCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{commentCount}</span>
              </div>
            )}
            {attachmentCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Paperclip className="h-3.5 w-3.5" />
                <span>{attachmentCount}</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const listColumns: Column<RectificationOrder>[] = [
    {
      key: 'id',
      title: '工单号',
      width: 120,
      render: (row) => <span className="text-xs font-mono text-slate-500">{row.id.toUpperCase()}</span>,
    },
    {
      key: 'description',
      title: '问题描述',
      width: 260,
      render: (row) => (
        <div
          onClick={() => setSelectedOrder(row)}
          className="cursor-pointer hover:text-brand-600 transition-colors"
        >
          {row.description.length > 40 ? row.description.slice(0, 40) + '...' : row.description}
        </div>
      ),
    },
    {
      key: 'issueType',
      title: '问题类型',
      width: 100,
      align: 'center',
      render: (row) => (
        <span className="inline-flex rounded bg-slate-50 border border-slate-100 px-2 py-0.5 text-xs text-slate-600">
          {issueTypeLabels[row.issueType] || row.issueType}
        </span>
      ),
    },
    {
      key: 'storeName',
      title: '门店',
      width: 130,
      render: (row) => <span className="text-slate-700">{row.storeName}</span>,
    },
    {
      key: 'priority',
      title: '优先级',
      width: 80,
      align: 'center',
      render: (row) => {
        const pc = priorityConfig[row.priority]
        return (
          <span className={cn('inline-flex rounded-md border px-2 py-0.5 text-xs font-medium', pc.bg)}>
            {pc.label}
          </span>
        )
      },
    },
    {
      key: 'assigneeName',
      title: '负责人',
      width: 80,
      align: 'center',
      render: (row) => <span className="text-slate-700">{row.assigneeName}</span>,
    },
    {
      key: 'createdAt',
      title: '创建时间',
      width: 130,
      render: (row) => <span className="text-slate-500 text-sm">{row.createdAt}</span>,
    },
    {
      key: 'deadline',
      title: '截止日期',
      width: 110,
      render: (row) => {
        const days = daysUntil(row.deadline)
        const isOverdue = days < 0 && row.status !== 'passed'
        return (
          <div className="space-y-0.5">
            <span className="text-slate-700 text-sm">{row.deadline.split(' ')[0]}</span>
            <div className={cn('text-xs font-medium', isOverdue ? 'text-danger-600' : 'text-slate-400')}>
              {isOverdue ? `超期${Math.abs(days)}天` : days === 0 ? '今日截止' : `剩余${days}天`}
            </div>
          </div>
        )
      },
    },
    {
      key: 'status',
      title: '状态',
      width: 80,
      align: 'center',
      render: (row) => {
        const st = statusConfig[row.status]
        let type: 'success' | 'pending' | 'warning' | 'danger' | 'info' | 'neutral' = 'neutral'
        if (row.status === 'pending') type = 'danger'
        else if (row.status === 'processing') type = 'warning'
        else if (row.status === 'reviewing') type = 'info'
        else if (row.status === 'passed') type = 'success'
        return <StatusBadge type={type} label={st.label} />
      },
    },
    {
      key: 'actions',
      title: '操作',
      width: 200,
      align: 'center',
      render: (row) => {
        return (
          <div className="flex items-center justify-center gap-1 flex-wrap">
            <button
              onClick={() => setSelectedOrder(row)}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              详情
            </button>
            {isSupervisor && (
              <>
                <button className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors">
                  <UserPlus className="h-3.5 w-3.5" />
                  指派
                </button>
                <button className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-warning-50 text-warning-700 hover:bg-warning-100 transition-colors">
                  <Bell className="h-3.5 w-3.5" />
                  催办
                </button>
              </>
            )}
            {!isSupervisor && row.status === 'pending' && (
              <button
                onClick={() => handleStatusUpdate(row.id, 'processing')}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-success-50 text-success-700 hover:bg-success-100 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                开始整改
              </button>
            )}
            {isSupervisor && row.status === 'reviewing' && (
              <>
                <button
                  onClick={() => handleStatusUpdate(row.id, 'passed')}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-success-50 text-success-700 hover:bg-success-100 transition-colors"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  通过
                </button>
                <button
                  onClick={() => handleStatusUpdate(row.id, 'pending')}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-danger-50 text-danger-700 hover:bg-danger-100 transition-colors"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                  驳回
                </button>
              </>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-5 pb-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title="总工单数"
          value={total}
          icon={<ClipboardList className="h-5 w-5" />}
          className="border-l-4 border-l-slate-300"
        />
        <StatCard
          title="待整改"
          value={counts.pending}
          change={Number(pct(counts.pending))}
          icon={<Clock className="h-5 w-5 text-danger-500" />}
          className="border-l-4 border-l-danger-400"
        />
        <StatCard
          title="整改中"
          value={counts.processing}
          change={Number(pct(counts.processing))}
          icon={<AlertCircle className="h-5 w-5 text-warning-500" />}
          className="border-l-4 border-l-warning-400"
        />
        <StatCard
          title="待复查"
          value={counts.reviewing}
          change={Number(pct(counts.reviewing))}
          icon={<CheckCircle className="h-5 w-5 text-brand-500" />}
          className="border-l-4 border-l-brand-400"
        />
        <StatCard
          title="已通过"
          value={counts.passed}
          change={Number(pct(counts.passed))}
          icon={<CheckCircle2 className="h-5 w-5 text-success-500" />}
          className="border-l-4 border-l-success-400"
        />
        <StatCard
          title="超期未处理"
          value={counts.overdue}
          change={Number(pct(counts.overdue))}
          icon={<XCircle className="h-5 w-5 text-danger-700" />}
          className="border-l-4 border-l-danger-600"
        />
      </div>

      <div className="rounded-[10px] bg-white shadow-card p-3 flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setViewMode('kanban')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
              viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            看板视图
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <List className="h-4 w-4" />
            列表视图
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="h-4 w-4" />
            筛选
          </button>
          {isSupervisor && (
            <button className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600 transition-colors">
              <Plus className="h-4 w-4" />
              新建工单
            </button>
          )}
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kanbanColumns.map((col) => {
            const st = statusConfig[col.key]
            const items = groupedByStatus[col.key]
            return (
              <div
                key={col.key}
                className={cn(
                  'rounded-[10px] border overflow-hidden flex flex-col',
                  st.bg,
                  st.border
                )}
                style={{ minHeight: 500 }}
              >
                <div className={cn('relative px-4 py-3 bg-gradient-to-r', st.headerBg)}>
                  <div className="absolute inset-0 bg-white/10" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{col.title}</span>
                      <span className="inline-flex items-center justify-center rounded-full bg-white/25 backdrop-blur-sm px-2 py-0.5 text-xs font-medium text-white">
                        {items.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {isSupervisor && (
                        <button className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                      <button className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                        <Filter className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                  {items.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                  {items.length === 0 && (
                    <div className="py-16 text-center text-sm text-slate-400">暂无工单</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <DataTable columns={listColumns} data={orders} rowKey="id" emptyText="暂无整改工单" />
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setSelectedOrder(null)
            setDetailImageIndex(0)
            setFeedbackText('')
            setReviewOpinion('')
          }}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white shadow-popover overflow-hidden animate-scale-in flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                  <ClipboardList className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">工单详情</div>
                  <div className="text-xs text-slate-400 font-mono">{selectedOrder.id.toUpperCase()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {(() => {
                  let type: 'success' | 'pending' | 'warning' | 'danger' | 'info' | 'neutral' = 'neutral'
                  if (selectedOrder.status === 'pending') type = 'danger'
                  else if (selectedOrder.status === 'processing') type = 'warning'
                  else if (selectedOrder.status === 'reviewing') type = 'info'
                  else if (selectedOrder.status === 'passed') type = 'success'
                  return <StatusBadge type={type} label={statusConfig[selectedOrder.status].label} />
                })()}
                <span
                  className={cn(
                    'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium',
                    priorityConfig[selectedOrder.priority].bg
                  )}
                >
                  {priorityConfig[selectedOrder.priority].label}优先级
                </span>
                <button
                  onClick={() => {
                    setSelectedOrder(null)
                    setDetailImageIndex(0)
                  }}
                  className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-100">
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-2">问题描述</div>
                    <p className="text-slate-800 leading-relaxed">{selectedOrder.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">问题类型</div>
                      <div className="font-medium text-slate-700">
                        {issueTypeLabels[selectedOrder.issueType] || selectedOrder.issueType}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">所属门店</div>
                      <div className="font-medium text-slate-700">{selectedOrder.storeName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">指派人</div>
                      <div className="font-medium text-slate-700">{selectedOrder.assignorName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">负责人</div>
                      <div className="font-medium text-slate-700">{selectedOrder.assigneeName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">创建时间</div>
                      <div className="font-medium text-slate-700">{selectedOrder.createdAt}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">截止日期</div>
                      <div
                        className={cn(
                          'font-medium',
                          daysUntil(selectedOrder.deadline) < 0 ? 'text-danger-600' : 'text-slate-700'
                        )}
                      >
                        {selectedOrder.deadline}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-3">问题照片</div>
                    <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-[4/3]">
                      <img
                        src={sampleImages[detailImageIndex % sampleImages.length]}
                        alt="问题照片"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-white text-xs font-medium">
                          {detailImageIndex + 1} / {sampleImages.length}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDetailImageIndex((i) => (i - 1 + sampleImages.length) % sampleImages.length)}
                            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDetailImageIndex((i) => (i + 1) % sampleImages.length)}
                            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {sampleImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setDetailImageIndex(i)}
                          className={cn(
                            'flex-1 h-14 rounded-lg overflow-hidden border-2 transition-all',
                            i === detailImageIndex ? 'border-brand-500 ring-2 ring-brand-200' : 'border-transparent opacity-60 hover:opacity-100'
                          )}
                        >
                          <img src={sampleImages[i]} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {!isSupervisor && selectedOrder.status === 'processing' && (
                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                      <div className="text-sm font-semibold text-slate-900 mb-3">整改反馈</div>
                      <div className="space-y-3">
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="请填写整改说明..."
                          rows={3}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                        />
                        <div className="flex items-center gap-2 flex-wrap">
                          <button className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-2 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600 transition-colors">
                            <Upload className="h-4 w-4" />
                            上传整改照片
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(selectedOrder.id, 'reviewing')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors ml-auto"
                          >
                            <Send className="h-4 w-4" />
                            提交整改
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {isSupervisor && selectedOrder.status === 'reviewing' && (
                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                      <div className="text-sm font-semibold text-slate-900 mb-3">复查意见</div>
                      <div className="space-y-3">
                        <textarea
                          value={reviewOpinion}
                          onChange={(e) => setReviewOpinion(e.target.value)}
                          placeholder="请填写复查意见..."
                          rows={3}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleStatusUpdate(selectedOrder.id, 'pending')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-danger-50 px-4 py-2 text-sm font-medium text-danger-700 hover:bg-danger-100 transition-colors"
                          >
                            <ThumbsDown className="h-4 w-4" />
                            驳回
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(selectedOrder.id, 'passed')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600 transition-colors"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            通过
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="text-xs font-medium text-slate-500 mb-4">整改时间线</div>
                  <div className="relative pl-6 space-y-5">
                    <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200" />
                    {timeline.map((event, index) => {
                      const isLast = index === timeline.length - 1
                      const iconBg =
                        event.status === 'passed'
                          ? 'bg-success-500'
                          : event.status === 'rejected'
                          ? 'bg-danger-500'
                          : event.status === 'submitted'
                          ? 'bg-brand-500'
                          : event.status === 'started'
                          ? 'bg-warning-500'
                          : 'bg-slate-400'
                      return (
                        <div key={index} className="relative">
                          <div
                            className={cn(
                              'absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full text-white shadow-sm',
                              iconBg
                            )}
                          >
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </div>
                          <div
                            className={cn(
                              'rounded-xl p-3 -mt-0.5',
                              isLast ? 'bg-brand-50 border border-brand-100' : 'bg-slate-50'
                            )}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-slate-900">{event.label}</span>
                              <span className="text-xs text-slate-400">{event.time}</span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <User className="h-3 w-3" />
                              操作人：{event.user}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                    <div className="text-xs font-medium text-slate-500">快捷操作</div>
                    <div className="flex flex-wrap gap-2">
                      {!isSupervisor && selectedOrder.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedOrder.id, 'processing')}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600 transition-colors"
                        >
                          <Send className="h-4 w-4" />
                          开始整改
                        </button>
                      )}
                      {!isSupervisor && selectedOrder.status === 'processing' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedOrder.id, 'reviewing')}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                        >
                          <Send className="h-4 w-4" />
                          提交复查
                        </button>
                      )}
                      {isSupervisor && selectedOrder.status === 'reviewing' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(selectedOrder.id, 'passed')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600 transition-colors"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            复查通过
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(selectedOrder.id, 'pending')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-danger-500 px-4 py-2 text-sm font-medium text-white hover:bg-danger-600 transition-colors"
                          >
                            <ThumbsDown className="h-4 w-4" />
                            复查驳回
                          </button>
                        </>
                      )}
                      {isSupervisor && (
                        <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                          <Bell className="h-4 w-4" />
                          发送催办
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RectificationPage
