'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { LogOut, Trash2, Download } from 'lucide-react'
import { Box, Typography, Stack } from '@mui/material'

type Props = {
    onLogout: () => void
    onDeleteAccount: () => void
    onExportData: () => void
}

export default function AccountSettingsSummaryCard({ onLogout, onDeleteAccount, onExportData }: Props) {
    return (
        <Card>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
                    계정 관리
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    계정 관련 작업을 수행하세요
                </Typography>
            </Box>

            <Stack spacing={1.5}>
                <Button
                    variant="outline"
                    onClick={onExportData}
                    leftIcon={<Download size={16} />}
                    sx={{ justifyContent: 'flex-start' }}
                >
                    내 데이터 내보내기
                </Button>

                <Button
                    variant="outline"
                    onClick={onLogout}
                    leftIcon={<LogOut size={16} />}
                    sx={{ justifyContent: 'flex-start', color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                >
                    로그아웃
                </Button>

                <Box sx={{ pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                        계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 취소할 수 없습니다.
                    </Typography>
                    <Button
                        variant="danger"
                        onClick={onDeleteAccount}
                        leftIcon={<Trash2 size={16} />}
                        sx={{ justifyContent: 'flex-start' }}
                    >
                        계정 삭제
                    </Button>
                </Box>
            </Stack>
        </Card>
    )
}
