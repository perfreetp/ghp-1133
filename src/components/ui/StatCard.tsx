import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon?: ReactNode
  trendData?: number[]
  className?: string
}

export default function StatCard({
  title,
  value,
  change,
  icon,
  trendData,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0

  const chartData = trendData?.map((v, i) => ({ index: i, value: v }))

  const lineColor = isPositive ? '#10B981' : '#EF4444'

  return (
    <div
      className={cn(
        'rounded-[10px] bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {value}
            </span>
            {change !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-sm font-semibold',
                  isPositive ? 'text-success-600' : 'text-danger-600'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {Math.abs(change).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
            {icon}
          </div>
        )}
      </div>
      {chartData && chartData.length > 1 && (
        <div className="mt-4 h-12 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                strokeWidth={2}
                dot={false}
                activeDot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
