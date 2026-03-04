'use client'

import React, { useRef, Suspense, lazy } from 'react'
import { Box } from '@mui/material'
import Card from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { format, startOfWeek } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { AppointmentEvent } from '../utils/appointmentUtils'
import type { CalendarView } from '../types'

// React Big Calendar를 동적 import로 로드하여 번들 크기 감소
const BigCalendarWrapper = lazy(async () => {
    const { Calendar, dateFnsLocalizer } = await import('react-big-calendar')
    // @ts-expect-error - CSS import
    await import('react-big-calendar/lib/css/react-big-calendar.css')

    const localizer = dateFnsLocalizer({
        format,
        parse: (str: string) => new Date(str),
        startOfWeek: () => startOfWeek(new Date(), { locale: ko }),
        getDay: (date: Date) => date.getDay(),
        locales: { ko },
    })

    const WrappedComponent = React.forwardRef<any, any>(
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

interface AppointmentsCalendarProps {
    events: AppointmentEvent[]
    view: CalendarView
    currentDate: Date | null
    onNavigate: (date: Date) => void
    onViewChange: (view: CalendarView) => void
    onSelectSlot: (slot: { start: Date; end: Date }) => void
    onSelectEvent: (event: AppointmentEvent) => void
    isMobile?: boolean
}

export default function AppointmentsCalendar({
    events,
    view,
    currentDate,
    onNavigate,
    onViewChange,
    onSelectSlot,
    onSelectEvent,
    isMobile = false,
}: AppointmentsCalendarProps) {
    const calendarRef = useRef<any>(null)

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

    if (isMobile) {
        return (
            <Card sx={{ display: { md: 'none' }, p: 0.5, overflow: 'hidden' }}>
                <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                    <Box sx={{ height: 'calc(100vh - 280px)', minHeight: 400 }} className="rbc-mobile-calendar">
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
            </Card>
        )
    }

    return (
        <Card sx={{ display: { xs: 'none', md: 'block' }, p: 2, overflow: 'hidden' }}>
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
        </Card>
    )
}
