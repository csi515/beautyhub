'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { Pencil } from 'lucide-react'
import { Box, Typography, Stack, Chip } from '@mui/material'
import { type BookingSettings } from '@/types/settings'
import { DAY_LABELS } from '@/types/settings'

type Props = {
    data: BookingSettings
    onEdit: () => void
}

export default function BookingSettingsSummaryCard({ data, onEdit }: Props) {
    return (
        <Card>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
                        예약 및 스케줄 정책
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        예약 시간 정책 및 리마인드 알림
                    </Typography>
                </Box>
                <Button variant="outline" size="sm" onClick={onEdit} leftIcon={<Pencil size={16} />}>
                    편집
                </Button>
            </Stack>

            <Stack spacing={1.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ gap: 2 }}>
                    <Box>
                        <Typography
                            variant="caption"
                            fontWeight={600}
                            sx={{ color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 0.5 }}
                        >
                            최소 예약 간격
                        </Typography>
                        <Typography variant="h6" fontWeight={500} sx={{ color: 'text.primary' }}>
                            {data.minBookingInterval}분
                        </Typography>
                    </Box>
                    <Box>
                        <Typography
                            variant="caption"
                            fontWeight={600}
                            sx={{ color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 0.5 }}
                        >
                            최대 예약 시간
                        </Typography>
                        <Typography variant="h6" fontWeight={500} sx={{ color: 'text.primary' }}>
                            {data.maxBookingHoursPerDay}시간/일
                        </Typography>
                    </Box>
                </Stack>

                <Box>
                    <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{ color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 1 }}
                    >
                        예약 가능 요일
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        {data.availableDays.map((day) => (
                            <Chip
                                key={day}
                                label={DAY_LABELS[day]}
                                size="small"
                                sx={{
                                    bgcolor: 'primary.light',
                                    border: '1px solid',
                                    borderColor: 'primary.main',
                                    color: 'primary.dark',
                                }}
                            />
                        ))}
                    </Stack>
                </Box>

                <Box>
                    <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{ color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 1 }}
                    >
                        리마인드 알림
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        {data.reminderTimings.map((hours) => (
                            <Chip
                                key={hours}
                                label={`${hours}시간 전`}
                                size="small"
                                sx={{
                                    bgcolor: 'secondary.light',
                                    border: '1px solid',
                                    borderColor: 'secondary.main',
                                    color: 'secondary.dark',
                                }}
                            />
                        ))}
                    </Stack>
                </Box>
            </Stack>
        </Card>
    )
}
