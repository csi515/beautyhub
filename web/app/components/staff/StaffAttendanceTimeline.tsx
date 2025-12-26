'use client'

import { Staff, StaffAttendance } from '@/types/entities'
import Timeline, { TimelineGroup, TimelineItem, SidebarHeader, TimelineHeaders, DateHeader } from 'react-calendar-timeline'
import 'react-calendar-timeline/dist/style.css'
import {
    Box,
    Paper,
    Typography,
    Stack,
    ToggleButtonGroup,
    ToggleButton,
    Tooltip,
    useTheme
} from '@mui/material'
import { useState, useMemo } from 'react'
import { startOfDay, format, differenceInMinutes, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

interface StaffAttendanceTimelineProps {
    staffList: Staff[]
    attendanceList: StaffAttendance[]
}

/**
 * 직원별 근무 예정 vs 실제 출근 현황을 보여주는 가로 타임라인 (간트 차트)
 */
export default function StaffAttendanceTimeline({ staffList, attendanceList }: StaffAttendanceTimelineProps) {
    const theme = useTheme()
    const [viewRange, setViewRange] = useState<'today' | 'week' | 'month'>('today')

    // 타임라인 범위 계산
    const { visibleTimeStart, visibleTimeEnd } = useMemo(() => {
        const now = new Date()
        if (viewRange === 'today') {
            return {
                visibleTimeStart: startOfDay(now).getTime() + (9 * 60 * 60 * 1000), // 09:00
                visibleTimeEnd: startOfDay(now).getTime() + (22 * 60 * 60 * 1000)   // 22:00
            }
        }
        if (viewRange === 'week') {
            return { visibleTimeStart: startOfWeek(now).getTime(), visibleTimeEnd: endOfWeek(now).getTime() }
        }
        return { visibleTimeStart: startOfMonth(now).getTime(), visibleTimeEnd: endOfMonth(now).getTime() }
    }, [viewRange])

    // 그룹 정의 (직원 리스트)
    const groups: TimelineGroup<any>[] = staffList.map(s => ({
        id: s.id,
        title: s.name,
        stackItems: true,
    }))

    // 아이템 정의 (근태 기록)
    const items: TimelineItem<any>[] = attendanceList.map(a => {
        const isActual = a.type === 'actual'
        const isLate = a.status === 'late'

        let bgColor = theme.palette.grey[300] // 예정 (연한 회색)
        if (isActual) {
            bgColor = isLate ? theme.palette.error.main : theme.palette.primary.main
        }

        return {
            id: a.id,
            group: a.staff_id,
            title: isActual ? (isLate ? '지각' : '출근') : '예정',
            start_time: new Date(a.start_time).getTime(),
            end_time: new Date(a.end_time).getTime(),
            itemProps: {
                style: {
                    background: bgColor,
                    borderColor: 'transparent',
                    borderRadius: '12px',
                    color: isActual ? 'white' : theme.palette.text.secondary,
                    fontSize: '10px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }
            }
        }
    })

    return (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: theme.palette.grey[50] }}>
                <Typography variant="subtitle2" fontWeight="bold">근무 현황 보드</Typography>
                <ToggleButtonGroup
                    value={viewRange}
                    exclusive
                    onChange={(_, val) => val && setViewRange(val)}
                    size="small"
                >
                    <ToggleButton value="today" sx={{ px: 2 }}>오늘</ToggleButton>
                    <ToggleButton value="week" sx={{ px: 2 }}>주간</ToggleButton>
                    <ToggleButton value="month" sx={{ px: 2 }}>월간</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Box sx={{ p: 0, '& .react-calendar-timeline': { border: 'none' } }}>
                <Timeline
                    groups={groups}
                    items={items}
                    visibleTimeStart={visibleTimeStart}
                    visibleTimeEnd={visibleTimeEnd}
                    canMove={false}
                    canResize={false}
                    lineHeight={50}
                    sidebarWidth={150}
                    itemRenderer={({ item, getItemProps }) => {
                        const att = attendanceList.find(a => a.id === item.id)
                        const duration = differenceInMinutes(new Date(item.end_time), new Date(item.start_time))
                        const hours = Math.floor(duration / 60)
                        const mins = duration % 60

                        return (
                            <Tooltip
                                title={
                                    <Box sx={{ p: 0.5 }}>
                                        <Typography variant="caption" display="block">시간: {format(item.start_time, 'HH:mm')} ~ {format(item.end_time, 'HH:mm')}</Typography>
                                        <Typography variant="caption" display="block">총 근무: {hours}시간 {mins}분</Typography>
                                        {att?.memo && <Typography variant="caption" display="block" sx={{ mt: 0.5, borderTop: '1px solid rgba(255,255,255,0.2)', pt: 0.5 }}>메모: {att.memo}</Typography>}
                                    </Box>
                                }
                                arrow
                                placement="top"
                            >
                                <div {...getItemProps(item.itemProps)}>
                                    <span>{item.title}</span>
                                </div>
                            </Tooltip>
                        )
                    }}
                >
                    <TimelineHeaders>
                        <SidebarHeader>
                            {({ getRootProps }) => (
                                <div {...getRootProps()} style={{ ...getRootProps().style, backgroundColor: theme.palette.grey[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">직원명</Typography>
                                </div>
                            )}
                        </SidebarHeader>
                        <DateHeader unit="primaryHeader" />
                        <DateHeader />
                    </TimelineHeaders>
                </Timeline>
            </Box>

            <Stack direction="row" spacing={3} sx={{ p: 2, bgcolor: theme.palette.grey[50], borderTop: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 12, height: 12, bgcolor: theme.palette.primary.main, borderRadius: '3px' }} />
                    <Typography variant="caption">출근</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 12, height: 12, bgcolor: theme.palette.error.main, borderRadius: '3px' }} />
                    <Typography variant="caption">지각</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 12, height: 12, bgcolor: theme.palette.grey[300], borderRadius: '3px' }} />
                    <Typography variant="caption">예정</Typography>
                </Stack>
            </Stack>
        </Paper>
    )
}
