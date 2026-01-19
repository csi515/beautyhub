/**
 * 재사용 가능한 데이터 리스트 컴포넌트
 */

'use client'

import { Skeleton } from './Skeleton'

export interface DataListProps<T> {
  data: T[]
  loading?: boolean
  emptyMessage?: string
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  itemClassName?: string
}

/**
 * 재사용 가능한 데이터 리스트 컴포넌트
 *
 * @example
 * <DataList
 *   data={customers}
 *   loading={loading}
 *   renderItem={(customer) => (
 *     <div>{customer.name}</div>
 *   )}
 * />
 */
export function DataList<T>({
  data,
  loading = false,
  emptyMessage = '데이터가 없습니다.',
  renderItem,
  className = '',
  itemClassName = '',
}: DataListProps<T>) {
  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className={itemClassName}>
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={`text-center py-12 text-neutral-500 ${className}`}>
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {data.map((item, index) => {
        // 고유 ID 우선 사용, 없으면 index 기반 fallback
        const itemKey = (item as any)?.id ?? (item as any)?.key ?? `item-${index}`
        return (
          <div key={itemKey} className={itemClassName}>
            {renderItem(item, index)}
          </div>
        )
      })}
    </div>
  )
}

