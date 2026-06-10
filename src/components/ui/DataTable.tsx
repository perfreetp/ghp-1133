import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: keyof T | string
  title: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  className?: string
  render?: (row: T, index: number) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey?: keyof T | ((row: T, index: number) => string | number)
  emptyText?: string
  className?: string
}

export default function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  emptyText = '暂无数据',
  className,
}: DataTableProps<T>) {
  const getRowKey = (row: T, index: number): string | number => {
    if (!rowKey) return index
    if (typeof rowKey === 'function') return rowKey(row, index)
    return String(row[rowKey])
  }

  const getCellValue = (row: T, key: keyof T | string): unknown => {
    if (typeof key === 'string' && key in row) {
      return row[key as keyof T]
    }
    return row[key as keyof T]
  }

  return (
    <div className={cn('w-full overflow-hidden rounded-[10px] border border-slate-200 bg-white', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-700 text-white">
              {columns.map((column, colIndex) => (
                <th
                  key={colIndex}
                  className={cn(
                    'whitespace-nowrap px-4 py-3 font-semibold',
                    column.align === 'left' && 'text-left',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    !column.align && 'text-left',
                    column.className
                  )}
                  style={column.width ? { width: typeof column.width === 'number' ? `${column.width}px` : column.width } : undefined}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-slate-400"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={getRowKey(row, rowIndex)}
                  className={cn(
                    'border-b border-slate-100 transition-colors duration-150 hover:bg-slate-50',
                    rowIndex % 2 === 1 && 'bg-slate-50/50'
                  )}
                >
                  {columns.map((column, colIndex) => {
                    const content = column.render
                      ? column.render(row, rowIndex)
                      : getCellValue(row, column.key)
                    return (
                      <td
                        key={colIndex}
                        className={cn(
                          'px-4 py-3 text-slate-700',
                          column.align === 'left' && 'text-left',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          !column.align && 'text-left',
                          column.className
                        )}
                      >
                        {content as ReactNode}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
