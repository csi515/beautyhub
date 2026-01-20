'use client'

import React, { useState, useRef, Suspense } from 'react'
import ReservationCreateModal from '../components/modals/ReservationCreateModal'
import ReservationDetailModal from '../components/modals/ReservationDetailModal'
import MobileTimelineView, { type MobileTimelineViewRef } from '../components/appointments/MobileTimelineView'
import CalendarHeader from '../components/appointments/CalendarHeader'
import AppointmentSearchFilters from '../components/appointments/AppointmentSearchFilters'
import DesktopCalendarView from '../components/appointments/DesktopCalendarView'
import MobileCalendarView from '../components/appointments/MobileCalendarView'
import StandardPageLayout from '../components/common/StandardPageLayout'
import { Skeleton } from '../components/ui/Skeleton'
import { format, addMonths, addWeeks, addDays, subMonths, subWeeks, subDays } from 'date-fns'
import { useSearch } from '../lib/hooks/useSearch'
import { useMemo } from 'react'
import { exportToCSV } from '../lib/utils/export'
import { useAppToast } from '../lib/ui/toast'
import { useAppointments } from '../lib/hooks/useAppointments'
import { formatRangeLabel, getDateRange, type AppointmentEvent, type CalendarView } from '../lib/utils/appointmentUtils'

import Paper from '@mui/material/Paper'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

type SelectedAppointment = {
  id: string
  date: string
  start: string
  end: string
  status: string
  notes: string
  service_id?: string
  customer_id?: string
  staff_id?: string
}


export default function AppointmentsPage() {
  const [view, setView] = useState<CalendarView>('month')
  const [currentDate, setCurrentDate] = useState<Date | null>(new Date())
  const [rangeLabel, setRangeLabel] = useState<string>('')
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [draft, setDraft] = useState<{ date: string; start: string; end: string; status: string; notes: string }>({
    date: '',
    start: '10:00',
    end: '11:00',
    status: 'scheduled',
    notes: '',
  })
  const [selected, setSelected] = useState<SelectedAppointment | null>(null)
  const calendarRef = useRef<any>(null)
  const timelineRef = useRef<MobileTimelineViewRef>(null)
  const [mobileViewMode, setMobileViewMode] = useState<'timeline' | 'calendar'>('calendar')
  const toast = useAppToast()

  // Search & Filter
  const { query, debouncedQuery, setQuery } = useSearch({ debounceMs: 300 })
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Appointments data
  const { events, reloadCalendar } = useAppointments()

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search
      if (debouncedQuery.trim()) {
        const q = debouncedQuery.toLowerCase()
        const titleMatch = event.title.toLowerCase().includes(q)
        const noteMatch = (event.extendedProps?.notes || '').toLowerCase().includes(q)
        const productMatch = (event.extendedProps?.product_name || '').toLowerCase().includes(q)
        if (!titleMatch && !noteMatch && !productMatch) return false
      }
      // Status
      if (statusFilter !== 'all' && event.extendedProps?.status !== statusFilter) return false
      return true
    })
  }, [events, debouncedQuery, statusFilter])

  const handleExport = () => {
    const dataToExport = filteredEvents.map(event => ({
      '예약일시': format(event.start, 'yyyy-MM-dd HH:mm'),
      '제목': event.title.split(' · ')[0] || event.title,
      '서비스': event.extendedProps?.product_name || '-',
      '상태': event.extendedProps?.status === 'scheduled' ? '예약됨' :
        event.extendedProps?.status === 'completed' ? '완료' :
          event.extendedProps?.status === 'cancelled' ? '취소' : event.extendedProps?.status,
      '메모': event.extendedProps?.notes || '-'
    }))
    exportToCSV(dataToExport, `예약목록_${new Date().toISOString().slice(0, 10)}.csv`)
    toast.success('예약 목록이 다운로드되었습니다')
  }



  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate)
    updateRangeAndLabel(newDate, view)
  }

  const updateRangeAndLabel = (date: Date, viewType: CalendarView) => {
    const { start, end } = getDateRange(date, viewType)
    setRangeLabel(formatRangeLabel(start, end, viewType))
    reloadCalendar(date, viewType)
  }

  const handlePrev = () => {
    if (!currentDate) return
    const newDate = view === 'month'
      ? subMonths(currentDate, 1)
      : view === 'week'
        ? subWeeks(currentDate, 1)
        : subDays(currentDate, 1)
    handleNavigate(newDate)
  }

  const handleNext = () => {
    if (!currentDate) return
    const newDate = view === 'month'
      ? addMonths(currentDate, 1)
      : view === 'week'
        ? addWeeks(currentDate, 1)
        : addDays(currentDate, 1)
    handleNavigate(newDate)
  }

  const handleToday = () => {
    handleNavigate(new Date())
  }

  const handleChangeView = (nextView: CalendarView) => {
    if (!currentDate) return
    setView(nextView)
    updateRangeAndLabel(currentDate, nextView)
  }

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    setDraft({
      date: start.toISOString().slice(0, 10),
      start: '10:00',
      end: '11:00',
      status: 'scheduled',
      notes: '',
    })
    setCreateOpen(true)
  }

  const handleSelectEvent = (event: AppointmentEvent) => {
    const startDate = typeof event.start === 'string' ? new Date(event.start) : event.start
    setSelected({
      id: event.id,
      date: startDate.toISOString().slice(0, 10),
      start: format(startDate, 'HH:mm'),
      end: format(startDate, 'HH:mm'),
      status: event.extendedProps?.status || 'scheduled',
      notes: event.extendedProps?.notes || '',
      service_id: event.extendedProps?.service_id || '',
      customer_id: event.extendedProps?.customer_id || '',
      staff_id: event.extendedProps?.staff_id || '',
    })
    setDetailOpen(true)
  }

  const handleMobileEventClick = (event: AppointmentEvent) => {
    handleSelectEvent(event)
  }

  const handleMobileDateClick = (date: Date) => {
    setDraft({
      date: date.toISOString().slice(0, 10),
      start: '10:00',
      end: '11:00',
      status: 'scheduled',
      notes: '',
    })
    setCreateOpen(true)
  }

  React.useEffect(() => {
    // view가 변경될 때 range와 label 업데이트
    if (currentDate) {
      updateRangeAndLabel(currentDate, view)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  React.useEffect(() => {
    // 초기 로딩 시 오늘 날짜로 range와 label 설정
    if (currentDate && !rangeLabel) {
      updateRangeAndLabel(currentDate, view)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, rangeLabel])

  if (!currentDate || !rangeLabel) {
    return (
      <StandardPageLayout loading={true}>
        <div />
      </StandardPageLayout>
    )
  }

  return (
    <StandardPageLayout>
      <CalendarHeader
        view={view}
        rangeLabel={rangeLabel}
        onChangeView={handleChangeView}
        onToday={handleToday}
        onPrev={handlePrev}
        onNext={handleNext}
        actions={
          <AppointmentSearchFilters
            query={query}
            onQueryChange={setQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onExport={handleExport}
            onCreateClick={() => {
              setDraft({
                date: new Date().toISOString().slice(0, 10),
                start: '10:00',
                end: '11:00',
                status: 'scheduled',
                notes: '',
              })
              setCreateOpen(true)
            }}
          />
        }
      />

      {/* 모바일 뷰 전환 버튼 */}
      <Paper sx={{ display: { md: 'none' }, p: { xs: 1, sm: 1.5 }, borderRadius: 3 }}>
        <ToggleButtonGroup
          value={mobileViewMode}
          exclusive
          onChange={(_, next) => {
            if (!next) return;
            setMobileViewMode(next);
            if (next === 'timeline') {
              setTimeout(() => timelineRef.current?.scrollToToday(), 100)
            }
          }}
          fullWidth
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              minHeight: '44px',
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            },
          }}
        >
          <ToggleButton value="timeline">타임라인</ToggleButton>
          <ToggleButton value="calendar">달력</ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* 모바일 타임라인 뷰 */}
      {mobileViewMode === 'timeline' && (
        <Paper sx={{ display: { md: 'none' }, p: 2, borderRadius: 3 }}>
          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
            <MobileTimelineView
              ref={timelineRef}
              events={filteredEvents}
              selectedDate={currentDate}
              onEventClick={handleMobileEventClick}
              onDateClick={handleMobileDateClick}
            />
          </Suspense>
        </Paper>
      )}

      {/* 모바일 달력 뷰 */}
      {mobileViewMode === 'calendar' && currentDate && (
        <MobileCalendarView
          events={filteredEvents}
          view={view}
          currentDate={currentDate}
          onNavigate={handleNavigate}
          onViewChange={setView}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          calendarRef={calendarRef}
        />
      )}

      {/* 데스크톱 캘린더 뷰 */}
      {currentDate && (
        <DesktopCalendarView
          events={filteredEvents}
          view={view}
          currentDate={currentDate}
          onNavigate={handleNavigate}
          onViewChange={setView}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          calendarRef={calendarRef}
        />
      )}


      <ReservationCreateModal
        open={createOpen}
        draft={draft}
        onClose={() => setCreateOpen(false)}
        onSaved={async () => {
          if (currentDate) {
            await reloadCalendar(currentDate, view)
          }
        }}
      />
      <ReservationDetailModal
        open={detailOpen}
        item={selected}
        onClose={() => setDetailOpen(false)}
        onSaved={async () => {
          if (currentDate) {
            await reloadCalendar(currentDate, view)
          }
        }}
        onDeleted={async () => {
          if (currentDate) {
            await reloadCalendar(currentDate, view)
          }
        }}
      />
    </StandardPageLayout>
  )
}
