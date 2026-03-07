'use client'

import React, { useState, useRef } from 'react'
import { Stack, Card, ToggleButtonGroup, ToggleButton, Box } from '@mui/material'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { format } from 'date-fns'
import ReservationCreateModal from '@/app/components/modals/ReservationCreateModal'
import ReservationDetailModal from '@/app/components/modals/ReservationDetailModal'
import MobileTimelineView, { type MobileTimelineViewRef } from '@/app/components/features/appointments/MobileTimelineView'
import { exportToCSV } from '@/app/lib/utils/export'
import { useAppToast } from '@/app/lib/ui/toast'

import { useAppointmentsData } from './hooks/useAppointmentsData'
import { useAppointmentsNavigation } from './hooks/useAppointmentsNavigation'
import { mapAppointments } from './utils/appointmentUtils'
import type { AppointmentRow, Product } from './utils/appointmentUtils'
import type { SelectedAppointment } from './types'
import CalendarHeader from './components/CalendarHeader'
import AppointmentsCalendar from './components/AppointmentsCalendar'
import PageContainer from '@/app/components/layout/PageContainer'

export default function AppointmentsPage() {
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
    const timelineRef = useRef<MobileTimelineViewRef>(null)
    const [mobileViewMode, setMobileViewMode] = useState<'timeline' | 'calendar'>('calendar')
    const toast = useAppToast()

    const { setEvents, filteredEvents, query, setQuery, statusFilter, setStatusFilter } = useAppointmentsData()
    const {
        view,
        range,
        currentDate,
        rangeLabel,
        handleNavigate,
        handlePrev,
        handleNext,
        handleToday,
        handleChangeView,
        updateRangeAndLabel,
    } = useAppointmentsNavigation()

    const reloadCalendar = async (opt?: { from?: string; to?: string }): Promise<void> => {
        try {
            const from = opt?.from ?? range.from
            const to = opt?.to ?? range.to

            const { appointmentsApi } = await import('@/app/lib/api/appointments')
            const { productsApi } = await import('@/app/lib/api/products')
            const options: Parameters<typeof appointmentsApi.list>[0] = {}
            if (from) {
                options.from = from
            }
            if (to) {
                options.to = to
            }
            const [rows, products] = await Promise.all([
                appointmentsApi.list(options),
                productsApi.list({ limit: 1000 }),
            ])
            const rowsArray = Array.isArray(rows) ? (rows as AppointmentRow[]) : []
            const productsArray = Array.isArray(products) ? (products as Product[]) : []
            setEvents(mapAppointments(rowsArray, productsArray))
        } catch (error) {
            if (typeof window !== 'undefined') {
                const { logger } = await import('@/app/lib/utils/logger')
                logger.error('예약 캘린더 로딩 실패', error, 'AppointmentsPage')
            } else {
                console.error('예약 캘린더 로딩 실패', error)
            }
        }
    }

    const handleRangeChange = (newRange: { from?: string; to?: string }) => {
        reloadCalendar(newRange)
    }

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

    const handleSelectEvent = (event: typeof filteredEvents[0]) => {
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
            no_show: event.extendedProps?.no_show || false,
        })
        setDetailOpen(true)
    }

    const handleMobileEventClick = (event: typeof filteredEvents[0]) => {
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

    const handleCreateNew = () => {
        setDraft({
            date: new Date().toISOString().slice(0, 10),
            start: '10:00',
            end: '11:00',
            status: 'scheduled',
            notes: '',
        })
        setCreateOpen(true)
    }

    React.useEffect(() => {
        if (currentDate) {
            updateRangeAndLabel(currentDate, view, handleRangeChange)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view])

    React.useEffect(() => {
        if (currentDate && !rangeLabel) {
            updateRangeAndLabel(currentDate, view, handleRangeChange)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDate, rangeLabel])

    if (!currentDate || !rangeLabel) {
        return <Skeleton className="h-[600px] w-full" />
    }

    return (
        <PageContainer maxWidth="lg">
        <Stack spacing={3}>
            <CalendarHeader
                view={view}
                rangeLabel={rangeLabel}
                onChangeView={(nextView) => handleChangeView(nextView, handleRangeChange)}
                onToday={() => handleToday(handleRangeChange)}
                onPrev={() => handlePrev(handleRangeChange)}
                onNext={() => handleNext(handleRangeChange)}
                query={query}
                onQueryChange={setQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onExport={handleExport}
                onCreateNew={handleCreateNew}
            />

            {/* 모바일 뷰 전환 버튼 */}
            <Card sx={{ display: { md: 'none' }, p: 1.5 }}>
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
                >
                    <ToggleButton value="timeline">타임라인</ToggleButton>
                    <ToggleButton value="calendar">달력</ToggleButton>
                </ToggleButtonGroup>
            </Card>

            {/* 모바일 타임라인 뷰 */}
            {mobileViewMode === 'timeline' && (
                <Card sx={{ display: { md: 'none' }, p: 2 }}>
                    <Box sx={{ minHeight: 400 }}>
                        <MobileTimelineView
                            ref={timelineRef}
                            events={filteredEvents}
                            selectedDate={currentDate}
                            onEventClick={handleMobileEventClick}
                            onDateClick={handleMobileDateClick}
                        />
                    </Box>
                </Card>
            )}

            {/* 모바일 달력 뷰 */}
            {mobileViewMode === 'calendar' && (
                <AppointmentsCalendar
                    events={filteredEvents}
                    view={view}
                    currentDate={currentDate}
                    onNavigate={(date) => handleNavigate(date, handleRangeChange)}
                    onViewChange={(nextView) => handleChangeView(nextView, handleRangeChange)}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    isMobile={true}
                />
            )}

            {/* 데스크톱 캘린더 뷰 */}
            <AppointmentsCalendar
                events={filteredEvents}
                view={view}
                currentDate={currentDate}
                onNavigate={(date) => handleNavigate(date, handleRangeChange)}
                onViewChange={(nextView) => handleChangeView(nextView, handleRangeChange)}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                isMobile={false}
            />

            <ReservationCreateModal
                open={createOpen}
                draft={draft}
                onClose={() => setCreateOpen(false)}
                onSaved={async () => {
                    await reloadCalendar()
                }}
            />
            <ReservationDetailModal
                open={detailOpen}
                item={selected}
                onClose={() => setDetailOpen(false)}
                onSaved={async () => {
                    await reloadCalendar()
                }}
                onDeleted={async () => {
                    await reloadCalendar()
                }}
            />
        </Stack>
        </PageContainer>
    )
}
