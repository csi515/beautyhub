'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { Pencil } from 'lucide-react'
import { Box, Typography, Stack, Chip } from '@mui/material'
import { type FinancialSettings } from '@/types/settings'

type Props = {
    data: FinancialSettings
    onEdit: () => void
}

export default function FinancialSettingsSummaryCard({ data, onEdit }: Props) {
    return (
        <Card>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
                        재무 및 정산 설정
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        수입 및 지출 항목 관리
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
                        수입 항목
                    </Typography>
                    {data.incomeCategories.length > 0 ? (
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {data.incomeCategories.map((category) => (
                                <Chip
                                    key={category}
                                    label={category}
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
                    ) : (
                        <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                            등록된 수입 항목이 없습니다
                        </Typography>
                    )}
                </Box>

                <Box>
                    <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{ color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 1 }}
                    >
                        지출 항목
                    </Typography>
                    {data.expenseCategories.length > 0 ? (
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {data.expenseCategories.map((category) => (
                                <Chip
                                    key={category}
                                    label={category}
                                    size="small"
                                    sx={{
                                        bgcolor: 'success.light',
                                        border: '1px solid',
                                        borderColor: 'success.main',
                                        color: 'success.dark',
                                    }}
                                />
                            ))}
                        </Stack>
                    ) : (
                        <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                            등록된 지출 항목이 없습니다
                        </Typography>
                    )}
                </Box>
            </Stack>
        </Card>
    )
}
