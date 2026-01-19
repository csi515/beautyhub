'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

type EnhancedTableProps = {
  children: ReactNode
  className?: string
  striped?: boolean
  hover?: boolean
  compact?: boolean
}

/**
 * 개선된 테이블 컴포넌트
 * 일관된 스타일링, 호버 효과, 스트라이프 옵션
 */
export default function EnhancedTable({
  children,
  className = '',
  striped = false,
  hover = true,
  compact = false,
}: EnhancedTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
      <table
        className={clsx(
          'w-full border-collapse',
          className
        )}
        role="table"
      >
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-200">
            {children}
          </tr>
        </thead>
        <tbody
          className={clsx(
            striped && '[&>tr:nth-child(even)]:bg-neutral-50',
            hover && '[&>tr]:transition-colors [&>tr:hover]:bg-primary-50/30',
            compact && '[&>td]:py-2 [&>th]:py-2'
          )}
        >
          {children}
        </tbody>
      </table>
    </div>
  )
}

/**
 * 개선된 테이블 헤더 셀
 */
export function TableHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={clsx(
        'px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider',
        'border-b border-neutral-200',
        className
      )}
      scope="col"
    >
      {children}
    </th>
  )
}

/**
 * 개선된 테이블 데이터 셀
 */
export function TableCell({
  children,
  className = '',
  align = 'left',
}: {
  children: ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}) {
  return (
    <td
      className={clsx(
        'px-4 py-3 text-sm text-neutral-900',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
    >
      {children}
    </td>
  )
}
