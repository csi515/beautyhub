'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { Pencil, Store, Phone, MapPin } from 'lucide-react'
import { Box, Typography, Stack } from '@mui/material'
import { type BusinessProfile } from '@/types/settings'

type Props = {
    data: BusinessProfile
    onEdit: () => void
}

export default function BusinessProfileSummaryCard({ data, onEdit }: Props) {
    const hasBasicInfo = data.storeName || data.phone || data.address

    return (
        <Card>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
                        가게 기본 정보
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        상호명, 주소, 영업시간
                    </Typography>
                </Box>
                <Button variant="outline" size="sm" onClick={onEdit} leftIcon={<Pencil size={16} />}>
                    편집
                </Button>
            </Stack>

            {hasBasicInfo ? (
                <Stack spacing={1.5}>
                    {data.storeName && (
                        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                            <Store size={20} style={{ color: 'var(--mui-palette-text-secondary)', marginTop: 2 }} />
                            <Box>
                                <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    sx={{ color: 'text.secondary', textTransform: 'uppercase', display: 'block' }}
                                >
                                    상호명
                                </Typography>
                                <Typography variant="body1" fontWeight={500} sx={{ color: 'text.primary' }}>
                                    {data.storeName}
                                </Typography>
                            </Box>
                        </Stack>
                    )}

                    {data.phone && (
                        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                            <Phone size={20} style={{ color: 'var(--mui-palette-text-secondary)', marginTop: 2 }} />
                            <Box>
                                <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    sx={{ color: 'text.secondary', textTransform: 'uppercase', display: 'block' }}
                                >
                                    전화번호
                                </Typography>
                                <Typography variant="body1" fontWeight={500} sx={{ color: 'text.primary' }}>
                                    {data.phone}
                                </Typography>
                            </Box>
                        </Stack>
                    )}

                    {data.address && (
                        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                            <MapPin size={20} style={{ color: 'var(--mui-palette-text-secondary)', marginTop: 2 }} />
                            <Box>
                                <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    sx={{ color: 'text.secondary', textTransform: 'uppercase', display: 'block' }}
                                >
                                    주소
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'text.primary' }}>
                                    {data.address}
                                </Typography>
                            </Box>
                        </Stack>
                    )}
                </Stack>
            ) : (
                <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                    기본 정보를 등록하세요
                </Typography>
            )}
        </Card>
    )
}
