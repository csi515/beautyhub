'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { LogOut, Download } from 'lucide-react'
import { Box, Typography, Stack } from '@mui/material'

type Props = {
    onLogout: () => void
    onExportData: () => void
}

export default function AccountSettingsSummaryCard({ onLogout, onExportData }: Props) {
    return (
        <Card compact>
            <Box sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.primary' }}>
                    계정 관리
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block', fontSize: '0.8125rem' }}>
                    계정 관련 작업을 수행하세요
                </Typography>
            </Box>

            <Stack spacing={1}>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onExportData}
                    leftIcon={<Download size={16} />}
                    sx={{ justifyContent: 'flex-start' }}
                >
                    내 데이터 내보내기
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onLogout}
                    leftIcon={<LogOut size={16} />}
                    sx={{ justifyContent: 'flex-start', color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                >
                    로그아웃
                </Button>
            </Stack>
        </Card>
    )
}
