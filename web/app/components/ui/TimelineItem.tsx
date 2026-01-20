'use client'

import { Calendar, DollarSign, Coins, Package, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { TimelineEvent } from '@/app/lib/api/customers/timeline'

interface TimelineItemProps {
  event: TimelineEvent
  isLast?: boolean
}

const eventIcons = {
  appointment: Calendar,
  transaction: DollarSign,
  points: Coins,
  product: Package,
}

const eventColors = {
  appointment: 'text-blue-600 bg-blue-50 border-blue-200',
  transaction: 'text-green-600 bg-green-50 border-green-200',
  points: 'text-purple-600 bg-purple-50 border-purple-200',
  product: 'text-orange-600 bg-orange-50 border-orange-200',
}

const eventLabels = {
  appointment: '예약',
  transaction: '거래',
  points: '포인트',
  product: '상품',
}

export default function TimelineItem({ event, isLast = false }: TimelineItemProps) {
  const Icon = eventIcons[event.type] || Clock
  const colorClass = eventColors[event.type] || 'text-neutral-600 bg-neutral-50 border-neutral-200'
  const label = eventLabels[event.type] || '이벤트'

  const eventDate = new Date(event.date)
  const dateStr = format(eventDate, 'yyyy년 M월 d일', { locale: ko })
  const timeStr = format(eventDate, 'HH:mm', { locale: ko })

  return (
    <div className="relative flex gap-3">
      {/* 타임라인 라인 */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-neutral-200" />
      )}

      {/* 아이콘 */}
      <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${colorClass}`}>
        <Icon size={18} />
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${colorClass}`}>
            {label}
          </span>
          <span className="text-xs text-neutral-500">
            {dateStr} {timeStr}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-neutral-900 mb-1">
          {event.title}
        </h4>
        {event.description && (
          <p className="text-sm text-neutral-600">
            {event.description}
          </p>
        )}
      </div>
    </div>
  )
}
