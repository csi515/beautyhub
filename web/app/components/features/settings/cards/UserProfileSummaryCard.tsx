'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { Pencil, User } from 'lucide-react'
import { Box, Typography, Stack } from '@mui/material'
import { type UserProfile } from '@/types/settings'

type Props = {
    data: UserProfile
    onEdit: () => void
}

export default function UserProfileSummaryCard({ data, onEdit }: Props) {
    return (
        <Card>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
                        개인 정보
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        이름, 연락처, 프로필 정보를 관리하세요
                    </Typography>
                </Box>
                <Button variant="outline" size="sm" onClick={onEdit} leftIcon={<Pencil size={16} />}>
                    편집
                </Button>
            </Stack>

            <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'action.hover',
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <User size={20} />
                    </Box>
                    <Box>
                        <Typography variant="body1" fontWeight={500} sx={{ color: 'text.primary' }}>
                            {data.name || '이름 미설정'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {data.email}
                        </Typography>
                    </Box>
                </Stack>

                {data.phone && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        <Box component="span" fontWeight={600}>
                            전화번호:
                        </Box>{' '}
                        {data.phone}
                    </Typography>
                )}

                {data.birthdate && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        <Box component="span" fontWeight={600}>
                            생년월일:
                        </Box>{' '}
                        {new Date(data.birthdate).toLocaleDateString('ko-KR')}
                    </Typography>
                )}
            </Stack>
        </Card>
    )
}
