'use client'

import { Box, Stack, Typography, IconButton, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { useTheme } from '@mui/material'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import type { CalendarView } from '../types'

interface CalendarHeaderProps {
    view: CalendarView
    rangeLabel: string
    onChangeView: (view: CalendarView) => void
    onToday: () => void
    onPrev: () => void
    onNext: () => void
}

export default function CalendarHeader({
    view,
    rangeLabel,
    onChangeView,
    onToday,
    onPrev,
    onNext,
}: CalendarHeaderProps) {
    const theme = useTheme()

    return (
        <Card sx={{ p: { xs: 2, md: 1.5 }, overflow: 'auto' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} flexWrap="nowrap" sx={{ minWidth: 0 }}>
                {/* 날짜 표시 & 모바일 네비게이션 */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 0, flexShrink: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="nowrap" sx={{ minWidth: 0 }}>
                        <CalendarIcon size={20} color={theme.palette.primary.main} />
                        <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }}>
                            {rangeLabel || '로딩 중...'}
                        </Typography>
                    </Stack>

                    {/* 모바일 네비게이션 */}
                    <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton onClick={onPrev} size="small" sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                            <ChevronLeft size={16} />
                        </IconButton>
                        <Button variant="outline" size="sm" onClick={onToday} style={{ height: 32 }}>오늘</Button>
                        <IconButton onClick={onNext} size="small" sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                            <ChevronRight size={16} />
                        </IconButton>
                    </Stack>
                </Box>

                {/* 데스크톱 컨트롤 */}
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="nowrap"
                    sx={{ display: { xs: 'none', md: 'flex' }, flexShrink: 0 }}
                >
                        <ToggleButtonGroup
                            value={view}
                            exclusive
                            onChange={(_, nextView) => nextView && onChangeView(nextView)}
                            size="small"
                            aria-label="달력 보기 모드"
                        >
                            <ToggleButton value="month" sx={{ whiteSpace: 'nowrap' }}>월</ToggleButton>
                            <ToggleButton value="week" sx={{ whiteSpace: 'nowrap' }}>주</ToggleButton>
                            <ToggleButton value="day" sx={{ whiteSpace: 'nowrap' }}>일</ToggleButton>
                        </ToggleButtonGroup>
                    <Stack direction="row" spacing={0.5}>
                        <IconButton onClick={onPrev} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                            <ChevronLeft size={18} />
                        </IconButton>
                        <Button variant="outline" onClick={onToday} sx={{ height: 36, borderColor: theme.palette.divider }}>오늘</Button>
                        <IconButton onClick={onNext} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                            <ChevronRight size={18} />
                        </IconButton>
                    </Stack>
                </Stack>
            </Stack>
        </Card>
    )
}
