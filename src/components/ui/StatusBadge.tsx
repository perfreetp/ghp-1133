import { cn } from '@/lib/utils'

type StatusType = 'success' | 'pending' | 'warning' | 'danger' | 'info' | 'neutral'

interface StatusBadgeProps {
  type: StatusType
  label: string
  className?: string
}

const statusConfig: Record<StatusType, { dot: string; bg: string; text: string; border: string }> = {
  success: {
    dot: 'bg-success-500',
    bg: 'bg-success-50',
    text: 'text-success-700',
    border: 'border-success-100',
  },
  pending: {
    dot: 'bg-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-100',
  },
  warning: {
    dot: 'bg-warning-500',
    bg: 'bg-warning-50',
    text: 'text-warning-600',
    border: 'border-warning-100',
  },
  danger: {
    dot: 'bg-danger-500',
    bg: 'bg-danger-50',
    text: 'text-danger-700',
    border: 'border-danger-100',
  },
  info: {
    dot: 'bg-brand-500',
    bg: 'bg-brand-50',
    text: 'text-brand-700',
    border: 'border-brand-100',
  },
  neutral: {
    dot: 'bg-slate-400',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
}

export default function StatusBadge({ type, label, className }: StatusBadgeProps) {
  const config = statusConfig[type]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {label}
    </span>
  )
}
