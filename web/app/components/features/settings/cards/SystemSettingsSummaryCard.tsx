'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { Pencil, Bell, BellOff } from 'lucide-react'
import { Box, Typography, Stack } from '@mui/material'
import { type SystemSettings } from '@/types/settings'

type Props = {
    data: SystemSettings
    onEdit: () => void
}

export default function SystemSettingsSummaryCard({ data, onEdit }: Props) {
    return (
        <Card>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
                        시스템 및 앱 관리 설정
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        시스템 알림 설정
                    </Typography>
                </Box>
                <Button variant="outline" size="sm" onClick={onEdit} leftIcon={<Pencil size={16} />}>
                    편집
                </Button>
            </Stack>

            <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        PUSH 알림 전체
                    </Typography>
                    {data.pushNotificationsEnabled ? (
                        <Bell size={20} style={{ color: '#F472B6' }} />
                    ) : (
                        <BellOff size={20} style={{ color: 'var(--mui-palette-action-disabled)' }} />
                    )}
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        고객 알림
                    </Typography>
                    {data.customerNotificationsEnabled ? (
                        <Bell size={20} style={{ color: '#F472B6' }} />
                    ) : (
                        <BellOff size={20} style={{ color: 'var(--mui-palette-action-disabled)' }} />
                    )}
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        내부 알림
                    </Typography>
                    {data.internalNotificationsEnabled ? (
                        <Bell size={20} style={{ color: '#F472B6' }} />
                    ) : (
                        <BellOff size={20} style={{ color: 'var(--mui-palette-action-disabled)' }} />
                    )}
                </Stack>
            </Stack>
        </Card>
    )
}
