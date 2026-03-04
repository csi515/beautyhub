import { useState } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, addWeeks, addDays, subMonths, subWeeks, subDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { CalendarView, DateRange } from '../types'
import { formatRangeLabel } from '../utils/appointmentUtils'

export function useAppointmentsNavigation() {
    const [view, setView] = useState<CalendarView>('month')
    const [range, setRange] = useState<DateRange>({})
    const [currentDate, setCurrentDate] = useState<Date | null>(new Date())
    const [rangeLabel, setRangeLabel] = useState<string>('')

    const updateRangeAndLabel = (date: Date, viewType: CalendarView, onRangeChange?: (range: DateRange) => void) => {
        let start: Date
        let end: Date

        if (viewType === 'month') {
            start = startOfWeek(startOfMonth(date), { locale: ko })
            end = endOfWeek(endOfMonth(date), { locale: ko })
        } else if (viewType === 'week') {
            start = startOfWeek(date, { locale: ko })
            end = endOfWeek(date, { locale: ko })
        } else {
            start = date
            end = date
        }

        const from = start.toISOString()
        const to = end.toISOString()

        const newRange = { from, to }
        setRange(newRange)
        setRangeLabel(formatRangeLabel(start, end, viewType))
        onRangeChange?.(newRange)
    }

    const handleNavigate = (newDate: Date, onRangeChange?: (range: DateRange) => void) => {
        setCurrentDate(newDate)
        updateRangeAndLabel(newDate, view, onRangeChange)
    }

    const handlePrev = (onRangeChange?: (range: DateRange) => void) => {
        if (!currentDate) return
        const newDate = view === 'month'
            ? subMonths(currentDate, 1)
            : view === 'week'
                ? subWeeks(currentDate, 1)
                : subDays(currentDate, 1)
        handleNavigate(newDate, onRangeChange)
    }

    const handleNext = (onRangeChange?: (range: DateRange) => void) => {
        if (!currentDate) return
        const newDate = view === 'month'
            ? addMonths(currentDate, 1)
            : view === 'week'
                ? addWeeks(currentDate, 1)
                : addDays(currentDate, 1)
        handleNavigate(newDate, onRangeChange)
    }

    const handleToday = (onRangeChange?: (range: DateRange) => void) => {
        handleNavigate(new Date(), onRangeChange)
    }

    const handleChangeView = (nextView: CalendarView, onRangeChange?: (range: DateRange) => void) => {
        if (!currentDate) return
        setView(nextView)
        updateRangeAndLabel(currentDate, nextView, onRangeChange)
    }

    return {
        view,
        range,
        currentDate,
        rangeLabel,
        setView,
        setCurrentDate,
        setRangeLabel,
        updateRangeAndLabel,
        handleNavigate,
        handlePrev,
        handleNext,
        handleToday,
        handleChangeView,
    }
}
