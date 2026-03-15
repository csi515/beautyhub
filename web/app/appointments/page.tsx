'use client'

import React, { useState, useRef } from 'react'
import { Stack, Card, ToggleButtonGroup, ToggleButton, Box, CircularProgress } from '@mui/material'
import AppointmentsSkeleton from '@/app/components/skeletons/AppointmentsSkeleton'
import { format } from 'date-fns'
import ReservationCreateModal from '@/app/components/modals/ReservationCreateModal'
import ReservationDetailModal from '@/app/components/modals/ReservationDetailModal'
import MobileTimelineView, { type MobileTimelineViewRef } from '@/app/components/features/appointments/MobileTimelineView'

import { useAppointmentsData } from './hooks/useAppointmentsData'
import { useAppointmentsNavigation } from './hooks/useAppointmentsNavigation'
import { mapAppointments } from './utils/appointmentUtils'
import type { AppointmentRow, Product } from './utils/appointmentUtils'
import type { SelectedAppointment } from './types'
import CalendarHeader from './components/CalendarHeader'
import AppointmentsCalendar from './components/AppointmentsCalendar'
import PageContainer from '@/app/components/layout/PageContainer'
import PageIntro from '@/app/components/common/PageIntro'
import { useAppToast } from '@/app/lib/ui/toast'
import { getLocalizedErrorMessage } from '@/app/lib/utils/messages'

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
    const [isReloading, setIsReloading] = useState(false)
    const toast = useAppToast()

    const { setEvents, filteredEvents } = useAppointmentsData()
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
            setIsReloading(true)
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
            const { logger } = await import('@/app/lib/utils/logger')
            logger.error('예약 캘린더 로딩 실패', error, 'AppointmentsPage')
            toast.error(getLocalizedErrorMessage(error, '예약 일정을 불러오는데 실패했습니다.'))
        } finally {
            setIsReloading(false)
        }
    }

    const handleRangeChange = (newRange: { from?: string; to?: string }) => {
        reloadCalendar(newRange)
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

    React.useEffect(() => {
        if (currentDate) {
            updateRangeAndLabel(currentDate, view, handleRangeChange)
        }
        // view 변경 시에만 range/label 갱신 (updateRangeAndLabel은 navigation 훅 내부 안정화됨)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view])

    React.useEffect(() => {
        if (currentDate && !rangeLabel) {
            updateRangeAndLabel(currentDate, view, handleRangeChange)
        }
        // currentDate/rangeLabel 변경 시 초기화 (의도적 1회 실행)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDate, rangeLabel])

    if (!currentDate || !rangeLabel) {
        return (
            <PageContainer maxWidth="xl" fullScreenOnTablet>
                <AppointmentsSkeleton />
            </PageContainer>
        )
    }

    return (
        <PageContainer maxWidth="xl" fullScreenOnTablet>
        <Stack spacing={2} sx={{ flex: 1, minHeight: { xs: 0, md: 600 }, overflow: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <PageIntro description="예약 일정을 확인하고 관리합니다" count={filteredEvents.length} />
            <Box sx={{ flexShrink: 0 }}>
            <CalendarHeader
                view={view}
                rangeLabel={rangeLabel}
                onChangeView={(nextView) => handleChangeView(nextView, handleRangeChange)}
                onToday={() => handleToday(handleRangeChange)}
                onPrev={() => handlePrev(handleRangeChange)}
                onNext={() => handleNext(handleRangeChange)}
            />
            </Box>

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
                    <ToggleButton value="timeline" sx={{ whiteSpace: 'nowrap' }}>타임라인</ToggleButton>
                    <ToggleButton value="calendar" sx={{ whiteSpace: 'nowrap' }}>달력</ToggleButton>
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

            {/* 로딩 오버레이 */}
            {isReloading && (
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.7)', zIndex: 10, borderRadius: 2 }}>
                    <CircularProgress size={40} />
                </Box>
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
            <Box sx={{ flex: '1 1 0', minHeight: 500, minWidth: 0, overflow: 'hidden', display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}>
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
            </Box>

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
