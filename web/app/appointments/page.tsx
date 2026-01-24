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
import { useModalWithData } from '../lib/hooks/useModalWithData'
import { formatRangeLabel, getDateRange, type AppointmentEvent, type CalendarView } from '../lib/utils/appointmentUtils'
import { AppointmentsService } from '../lib/services/appointments.service'

import Paper from '@mui/material/Paper'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme, useMediaQuery } from '@mui/material'
import { Filter, Plus } from 'lucide-react'
import MobileFAB from '../components/common/MobileFAB'
import FilterBottomSheet from '../components/common/FilterBottomSheet'
import { useExportVisibility } from '../lib/hooks/useExportVisibility'

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
  const createModal = useModalWithData<{ date: string; start: string; end: string; status: string; notes: string }>()
  const detailModal = useModalWithData<SelectedAppointment>()
  const calendarRef = useRef<any>(null)
  const timelineRef = useRef<MobileTimelineViewRef>(null)
  const [mobileViewMode, setMobileViewMode] = useState<'timeline' | 'calendar'>('calendar')
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const toast = useAppToast()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { showExport } = useExportVisibility()

  // Search & Filter
  const { query, debouncedQuery, setQuery } = useSearch({ debounceMs: 300 })
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const activeFilterCount = (query !== '' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)

  // Appointments data
  const { events, reloadCalendar } = useAppointments()

  // Service 레이어를 사용한 필터링
  const filteredEvents = useMemo(() => {
    return AppointmentsService.filterAppointments(events, {
      search: debouncedQuery,
      status: statusFilter
    })
  }, [events, debouncedQuery, statusFilter])

  const handleExport = () => {
    // Service 레이어를 사용한 데이터 변환
    const dataToExport = AppointmentsService.prepareAppointmentsForExport(filteredEvents)
    exportToCSV(dataToExport, `예약목록_${new Date().toISOString().slice(0, 10)}.csv`)
    toast.success('예약 목록이 다운로드되었습니다')
  }



  const handleNavigate = (newDate: Date) => {
    // 날짜 객체를 명시적으로 복사하여 참조 문제 방지
    const normalizedDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())
    setCurrentDate(normalizedDate)
    updateRangeAndLabel(normalizedDate, view)
  }

  const updateRangeAndLabel = (date: Date, viewType: CalendarView) => {
    const { start, end } = getDateRange(date, viewType)
    setRangeLabel(formatRangeLabel(date, start, end, viewType))
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
    // 오늘 날짜를 명시적으로 생성 (시간은 0으로 초기화하여 날짜만 사용)
    const today = new Date()
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    handleNavigate(todayNormalized)
  }

  const handleChangeView = (nextView: CalendarView) => {
    if (!currentDate) return
    setView(nextView)
    updateRangeAndLabel(currentDate, nextView)
  }

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    createModal.openModal({
      date: start.toISOString().slice(0, 10),
      start: '10:00',
      end: '11:00',
      status: 'scheduled',
      notes: '',
    })
  }

  const handleSelectEvent = (event: AppointmentEvent) => {
    const startDate = typeof event.start === 'string' ? new Date(event.start) : event.start
    detailModal.openModal({
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
  }

  const handleMobileEventClick = (event: AppointmentEvent) => {
    handleSelectEvent(event)
  }

  const handleMobileDateClick = (date: Date) => {
    createModal.openModal({
      date: date.toISOString().slice(0, 10),
      start: '10:00',
      end: '11:00',
      status: 'scheduled',
      notes: '',
    })
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
            variant="toolbar"
            showExport={showExport}
            showCreate
            query={query}
            onQueryChange={setQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onExport={handleExport}
            onCreateClick={() => {
              createModal.openModal({
                date: new Date().toISOString().slice(0, 10),
                start: '10:00',
                end: '11:00',
                status: 'scheduled',
                notes: '',
              })
            }}
          />
        }
      />

      {/* 모바일: 검색·필터 시트 */}
      {isMobile && (
        <FilterBottomSheet
          open={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          title="검색·필터"
          description="예약 검색 및 상태 필터"
          activeFilterCount={activeFilterCount}
          onReset={() => {
            setQuery('')
            setStatusFilter('all')
            setFilterSheetOpen(false)
          }}
        >
          <AppointmentSearchFilters
            variant="sheet"
            showExport={false}
            showCreate={false}
            query={query}
            onQueryChange={setQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </FilterBottomSheet>
      )}

      {/* 모바일 뷰 전환 + 필터 트리거 */}
      <Paper sx={{ display: { md: 'none' }, p: { xs: 1, sm: 1.5 }, borderRadius: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
          <IconButton
            onClick={() => setFilterSheetOpen(true)}
            aria-label="검색·필터"
            sx={{ minWidth: 44, minHeight: 44, flexShrink: 0 }}
          >
            <Filter size={20} />
          </IconButton>
          <ToggleButtonGroup
            value={mobileViewMode}
            exclusive
            onChange={(_, next) => {
              if (!next) return
              setMobileViewMode(next)
              if (next === 'timeline') {
                setTimeout(() => timelineRef.current?.scrollToToday(), 100)
              }
            }}
            size="small"
            sx={{
              flex: 1,
              '& .MuiToggleButton-root': {
                minHeight: '44px',
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              },
            }}
          >
            <ToggleButton value="timeline">타임라인</ToggleButton>
            <ToggleButton value="calendar">달력</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
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


      {createModal.open && createModal.data && (
        <ReservationCreateModal
          open={createModal.open}
          draft={createModal.data}
          onClose={createModal.closeModal}
          onSaved={async () => {
            if (currentDate) {
              await reloadCalendar(currentDate, view)
            }
            createModal.closeModal()
          }}
        />
      )}
      {detailModal.open && detailModal.data && (
        <ReservationDetailModal
          open={detailModal.open}
          item={detailModal.data}
          onClose={detailModal.closeModal}
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
      )}

      {isMobile && (
        <MobileFAB
          icon={<Plus size={24} />}
          label="예약 추가"
          onClick={() =>
            createModal.openModal({
              date: new Date().toISOString().slice(0, 10),
              start: '10:00',
              end: '11:00',
              status: 'scheduled',
              notes: '',
            })
          }
        />
      )}
    </StandardPageLayout>
  )
}
