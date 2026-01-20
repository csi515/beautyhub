'use client'

import { useMemo, useRef, forwardRef, useImperativeHandle } from 'react'
import { Clock, User, Package } from 'lucide-react'
import type { AppointmentEvent } from './types'

type MobileTimelineViewProps = {
  events: AppointmentEvent[]
  selectedDate: Date
  onEventClick: (event: AppointmentEvent) => void
  onDateClick: (date: Date) => void
}

export type MobileTimelineViewRef = {
  scrollToToday: () => void
}

// 시간대별로 이벤트 그룹화
const groupEventsByDate = (events: AppointmentEvent[]) => {
  const grouped: Record<string, AppointmentEvent[]> = {}

  events.forEach(event => {
    // event.start가 Date인 경우와 string인 경우 모두 처리
    const startStr = typeof event.start === 'string' ? event.start : event.start.toISOString()
    const dateStr = startStr.slice(0, 10) // YYYY-MM-DD
    if (!grouped[dateStr]) {
      grouped[dateStr] = []
    }
    grouped[dateStr].push(event)
  })

  // 각 날짜의 이벤트를 시간순으로 정렬
  Object.keys(grouped).forEach(dateStr => {
    const events = grouped[dateStr]
    if (events) {
      events.sort((a, b) => {
        const startStrA = typeof a.start === 'string' ? a.start : a.start.toISOString()
        const startStrB = typeof b.start === 'string' ? b.start : b.start.toISOString()
        const timeA = startStrA.slice(11, 16) // HH:mm
        const timeB = startStrB.slice(11, 16)
        return timeA.localeCompare(timeB)
      })
    }
  })

  return grouped
}

// 시간 포맷팅 (오전/오후)
const formatTime = (timeStr: string): string => {
  const parts = timeStr.split(':').map(Number)
  const hours = parts[0]
  const minutes = parts[1] || 0
  if (hours === undefined || isNaN(hours)) return timeStr
  const isAM = hours < 12
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${isAM ? '오전' : '오후'} ${displayHour}:${String(minutes).padStart(2, '0')}`
}

// 날짜 포맷팅
const formatDate = (dateStr: string): { day: string; weekday: string; full: string } => {
  const date = new Date(dateStr)
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekdayIndex = date.getDay()
  const weekday = weekdays[weekdayIndex] || '?'
  const month = date.getMonth() + 1
  const day = date.getDate()
  const year = date.getFullYear()

  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  const isTomorrow = date.toDateString() === new Date(today.getTime() + 86400000).toDateString()

  let dayLabel = `${month}월 ${day}일`
  if (isToday) dayLabel = '오늘'
  else if (isTomorrow) dayLabel = '내일'

  return {
    day: dayLabel,
    weekday,
    full: `${year}년 ${month}월 ${day}일 (${weekday})`
  }
}

// 상태별 색상
const getStatusColor = (status?: string) => {
  switch (status) {
    case 'complete':
      return { bg: 'bg-emerald-50', border: 'border-emerald-300', dot: 'bg-emerald-500', text: 'text-emerald-700' }
    case 'cancelled':
      return { bg: 'bg-neutral-100', border: 'border-neutral-300', dot: 'bg-neutral-400', text: 'text-neutral-600' }
    case 'pending':
      return { bg: 'bg-amber-50', border: 'border-amber-300', dot: 'bg-amber-500', text: 'text-amber-700' }
    default: // scheduled
      return { bg: 'bg-blue-50', border: 'border-blue-300', dot: 'bg-blue-500', text: 'text-blue-700' }
  }
}

const MobileTimelineView = forwardRef<MobileTimelineViewRef, MobileTimelineViewProps>(({
  events,
  selectedDate,
  onEventClick,
  onDateClick,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const todayRef = useRef<HTMLDivElement>(null)

  const groupedEvents = useMemo(() => groupEventsByDate(events), [events])
  const sortedDates = useMemo(() => {
    return Object.keys(groupedEvents).sort((a, b) => a.localeCompare(b))
  }, [groupedEvents])

  useImperativeHandle(ref, () => ({
    scrollToToday: () => {
      if (todayRef.current) {
        // 부모 컨테이너 찾기 (스크롤 가능한 요소)
        let scrollContainer: HTMLElement | null = todayRef.current.parentElement
        while (scrollContainer && scrollContainer !== document.body) {
          const style = window.getComputedStyle(scrollContainer)
          if (style.overflowY === 'auto' || style.overflowY === 'scroll' ||
            scrollContainer.scrollHeight > scrollContainer.clientHeight) {
            break
          }
          scrollContainer = scrollContainer.parentElement
        }

        // 스크롤 컨테이너를 찾지 못하면 window를 사용
        if (scrollContainer && scrollContainer !== document.body) {
          const containerRect = scrollContainer.getBoundingClientRect()
          const todayRect = todayRef.current.getBoundingClientRect()
          const scrollOffset = todayRect.top - containerRect.top - 20 // 20px 여백

          scrollContainer.scrollTo({
            top: scrollContainer.scrollTop + scrollOffset,
            behavior: 'smooth'
          })
        } else {
          // window 스크롤 사용
          const todayRect = todayRef.current.getBoundingClientRect()
          const scrollOffset = todayRect.top + window.scrollY - 20 // 20px 여백

          window.scrollTo({
            top: scrollOffset,
            behavior: 'smooth'
          })
        }
      }
    }
  }))

  if (sortedDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center space-y-2">
          <Clock className="h-12 w-12 text-neutral-300 mx-auto" />
          <p className="text-neutral-500 text-sm">예약이 없습니다</p>
          <button
            onClick={() => onDateClick(selectedDate)}
            className="mt-4 px-4 py-2.5 text-sm text-blue-600 font-medium hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[120px]"
            aria-label="새 예약 추가하기"
          >
            새 예약 추가하기
          </button>
        </div>
      </div>
    )
  }

  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div ref={containerRef} className="space-y-6 pb-4">
      {sortedDates.map(dateStr => {
        const dateInfo = formatDate(dateStr)
        const dayEvents = groupedEvents[dateStr] || []
        const isToday = dateStr === todayStr

        return (
          <div key={dateStr} ref={isToday ? todayRef : null} className="relative">
            {/* 날짜 헤더 */}
            <div className="sticky top-0 z-10 bg-white pb-2 pt-1 mb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-neutral-900">
                    {dateInfo.day}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {dateInfo.weekday}요일
                  </span>
                </div>
                <div className="ml-auto text-xs text-neutral-400">
                  {dayEvents.length}개 예약
                </div>
              </div>
            </div>

            {/* 이벤트 리스트 */}
            <div className="space-y-2 pl-4 border-l-2 border-neutral-200">
              {dayEvents.map((event, idx) => {
                const startStr = typeof event.start === 'string' ? event.start : event.start.toISOString()
                const timeStr = startStr.slice(11, 16)
                const statusColor = getStatusColor(event.extendedProps?.status)
                const isLast = idx === dayEvents.length - 1

                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`relative -ml-4 cursor-pointer touch-manipulation transition-all duration-200 active:scale-[0.98] ${isLast ? 'pb-0' : 'pb-2'
                      }`}
                  >
                    {/* 타임라인 점 */}
                    <div className="absolute left-0 top-3 -translate-x-1/2">
                      <div className={`h-3 w-3 rounded-full ${statusColor.dot} border-2 border-white shadow-sm`} />
                    </div>

                    {/* 이벤트 카드 */}
                    <div
                      className={`ml-6 rounded-xl border-2 ${statusColor.border} ${statusColor.bg} p-3 shadow-sm hover:shadow-md transition-all duration-200 touch-feedback active:scale-[0.98] min-h-[80px]`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {/* 시간 */}
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Clock className={`h-3.5 w-3.5 ${statusColor.text} flex-shrink-0`} />
                            <span className={`text-sm font-semibold ${statusColor.text}`}>
                              {formatTime(timeStr)}
                            </span>
                          </div>

                          {/* 제목 */}
                          <div className="mb-1.5">
                            <h3 className="text-base font-semibold text-neutral-900 line-clamp-2">
                              {event.extendedProps?.product_name || '예약'}
                            </h3>
                            {event.extendedProps?.notes && (
                              <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                                {event.extendedProps.notes}
                              </p>
                            )}
                          </div>

                          {/* 메타 정보 */}
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-500">
                            {event.extendedProps?.customer_id && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>고객</span>
                              </div>
                            )}
                            {event.extendedProps?.service_id && (
                              <div className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                <span>{event.extendedProps.product_name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 상태 배지 */}
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor.text} ${statusColor.bg} border ${statusColor.border}`}>
                            {event.extendedProps?.status === 'complete' ? '완료' :
                              event.extendedProps?.status === 'cancelled' ? '취소' :
                                event.extendedProps?.status === 'pending' ? '대기' : '예약확정'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
})

MobileTimelineView.displayName = 'MobileTimelineView'

export default MobileTimelineView

