'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { Pencil } from 'lucide-react'
import { Box, Typography, Stack, Chip } from '@mui/material'
import { type StaffSettings } from '@/types/settings'

type Props = {
    data: StaffSettings
    onEdit: () => void
}

export default function StaffSettingsSummaryCard({ data, onEdit }: Props) {
    return (
        <Card>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
                        직원 직책 설정
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        직원 직책 관리
                    </Typography>
                </Box>
                <Button variant="outline" size="sm" onClick={onEdit} leftIcon={<Pencil size={16} />}>
                    편집
                </Button>
            </Stack>

            <Stack spacing={1.5}>
                <Box>
                    <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{ color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 1 }}
                    >
                        등록된 직책
                    </Typography>
                    {data?.positions && data.positions.length > 0 ? (
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {data.positions.map((position) => (
                                <Chip
                                    key={position}
                                    label={position}
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
                    ) : (
                        <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                            등록된 직책이 없습니다
                        </Typography>
                    )}
                </Box>

                <Box>
                    <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{ color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 1 }}
                    >
                        기본 근무시간
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                        <Chip
                            label={data?.defaultWorkHours?.startTime || '09:00'}
                            size="small"
                            sx={{
                                bgcolor: 'primary.light',
                                border: '1px solid',
                                borderColor: 'primary.main',
                                color: 'primary.dark',
                                fontWeight: 500,
                            }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                            ~
                        </Typography>
                        <Chip
                            label={data?.defaultWorkHours?.endTime || '18:00'}
                            size="small"
                            sx={{
                                bgcolor: 'primary.light',
                                border: '1px solid',
                                borderColor: 'primary.main',
                                color: 'primary.dark',
                                fontWeight: 500,
                            }}
                        />
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        스케줄 추가 시 기본값
                    </Typography>
                </Box>
            </Stack>
        </Card>
    )
}
