'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { Pencil, Shield, ShieldCheck } from 'lucide-react'
import { Box, Typography, Stack, Chip } from '@mui/material'
import { type SecuritySettings } from '@/types/settings'

type Props = {
    data: SecuritySettings
    onEdit: () => void
}

export default function SecuritySettingsSummaryCard({ data, onEdit }: Props) {
    return (
        <Card>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
                        보안 설정
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        비밀번호, 2단계 인증을 관리하세요
                    </Typography>
                </Box>
                <Button variant="outline" size="sm" onClick={onEdit} leftIcon={<Pencil size={16} />}>
                    편집
                </Button>
            </Stack>

            <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                        {data.twoFactorEnabled ? (
                            <ShieldCheck size={20} style={{ color: 'var(--mui-palette-success-main)' }} />
                        ) : (
                            <Shield size={20} style={{ color: 'var(--mui-palette-action-disabled)' }} />
                        )}
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            2단계 인증
                        </Typography>
                    </Stack>
                    <Chip
                        label={data.twoFactorEnabled ? '활성화' : '비활성화'}
                        size="small"
                        sx={{
                            ...(data.twoFactorEnabled
                                ? { bgcolor: 'success.light', color: 'success.dark' }
                                : { bgcolor: 'action.hover', color: 'text.secondary' }),
                        }}
                    />
                </Stack>

                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <Box component="span" fontWeight={600}>
                        세션 타임아웃:
                    </Box>{' '}
                    {data.sessionTimeout}분
                </Typography>

                {data.passwordLastChanged && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        <Box component="span" fontWeight={600}>
                            비밀번호 변경일:
                        </Box>{' '}
                        {new Date(data.passwordLastChanged).toLocaleDateString('ko-KR')}
                    </Typography>
                )}
            </Stack>
        </Card>
    )
}
