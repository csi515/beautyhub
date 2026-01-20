'use client'

import { Suspense, lazy } from 'react'
import { Box, Paper } from '@mui/material'
import { Skeleton } from '../ui/Skeleton'
import { format } from 'date-fns'
import type { AppointmentEvent } from '@/app/lib/utils/appointmentUtils'
import type { CalendarView } from '@/app/lib/utils/appointmentUtils'

// React Big Calendar를 동적 import로 로드하여 번들 크기 감소
const BigCalendarWrapper = lazy(async () => {
  const React = await import('react')
  const { Calendar, dateFnsLocalizer } = await import('react-big-calendar')
  const { format, startOfWeek } = await import('date-fns')
  const { ko } = await import('date-fns/locale')

  // CSS 임포트 추가
  // @ts-expect-error - CSS import
  await import('react-big-calendar/lib/css/react-big-calendar.css')

  // date-fns 로컬라이저 설정
  const localizer = dateFnsLocalizer({
    format,
    parse: (str: string) => new Date(str),
    startOfWeek: () => startOfWeek(new Date(), { locale: ko }),
    getDay: (date: Date) => date.getDay(),
    locales: { ko },
  })

  const WrappedComponent = React.default.forwardRef<any, any>(
    function BigCalendarWrapperComponent(props, ref) {
      return (
        <Calendar
          {...props}
          ref={ref}
          localizer={localizer}
          culture="ko"
        />
      )
    }
  )

  WrappedComponent.displayName = 'BigCalendarWrapper'

  return {
    default: WrappedComponent
  }
})

type Props = {
  events: AppointmentEvent[]
  view: CalendarView
  currentDate: Date
  onNavigate: (date: Date) => void
  onViewChange: (view: CalendarView) => void
  onSelectSlot: (slot: { start: Date; end: Date }) => void
  onSelectEvent: (event: AppointmentEvent) => void
  calendarRef: React.RefObject<any>
}

export default function DesktopCalendarView({
  events,
  view,
  currentDate,
  onNavigate,
  onViewChange,
  onSelectSlot,
  onSelectEvent,
  calendarRef,
}: Props) {
  const eventStyleGetter = (event: AppointmentEvent) => {
    const isComplete = String(event.extendedProps?.status || '') === 'complete'
    return {
      style: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        color: '#ffffff',
        opacity: isComplete ? 0.7 : 1,
        textDecoration: isComplete ? 'line-through' : 'none',
      }
    }
  }

  return (
    <Paper sx={{ display: { xs: 'none', md: 'block' }, p: 2, borderRadius: 3, overflow: 'hidden' }}>
      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <Box sx={{ height: 500, minWidth: 800 }}>
          <BigCalendarWrapper
            ref={calendarRef}
            events={events}
            view={view}
            date={currentDate}
            onNavigate={onNavigate}
            onView={onViewChange}
            onSelectSlot={onSelectSlot}
            onSelectEvent={onSelectEvent}
            eventPropGetter={eventStyleGetter}
            selectable
            toolbar={false}
            formats={{
              monthHeaderFormat: 'yyyy년 M월',
              weekdayFormat: 'eee',
              dayFormat: 'd',
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
                `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
            }}
            messages={{
              today: '오늘',
              previous: '이전',
              next: '다음',
              month: '월',
              week: '주',
              day: '일',
              agenda: '일정',
              date: '날짜',
              time: '시간',
              event: '이벤트',
              noEventsInRange: '이 범위에 이벤트가 없습니다.',
              showMore: (total: number) => `+${total} 더보기`,
            }}
          />
        </Box>
      </Suspense>
    </Paper>
  )
}
