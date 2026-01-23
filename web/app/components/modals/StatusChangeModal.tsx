'use client'

import { Staff } from '@/types/entities'
import {
    Stack,
    Typography,
    Box,
    useTheme
} from '@mui/material'
import Button from '../ui/Button'
import SwipeableModal, { SwipeableModalBody, SwipeableModalFooter, SwipeableModalHeader } from '../ui/SwipeableModal'
import { Clock, LogOut, Sun } from 'lucide-react'

interface StatusChangeModalProps {
    open: boolean
    staff: Staff | null
    onClose: () => void
    onSave: (status: string) => void
}

/**
 * 직원의 근태 상태를 간편하게 변경하는 모달
 */
export default function StatusChangeModal({ open, staff, onClose, onSave }: StatusChangeModalProps) {
    const theme = useTheme()

    if (!staff) return null

    const options = [
        { value: 'office', label: '출근', icon: <Clock size={20} />, color: theme.palette.success.main, desc: '샵에 도착하여 업무 대기 중' },
        { value: 'away', label: '휴무', icon: <Sun size={20} />, color: theme.palette.warning.main, desc: '오늘 근무가 없는 날' },
        { value: 'out', label: '퇴근', icon: <LogOut size={20} />, color: theme.palette.text.disabled, desc: '업무 종료 및 귀가' },
    ]

    return (
        <SwipeableModal open={open} onClose={onClose} size="lg">
            <SwipeableModalHeader
                title={`${staff.name}님 상태 변경`}
                description={`현재 상태: ${staff.status === 'office' ? '출근' : staff.status === 'away' ? '휴무' : '퇴근'}`}
                onClose={onClose}
            />
            <SwipeableModalBody>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {options.map((opt) => (
                        <Box
                            key={opt.value}
                            onClick={() => onSave(opt.value)}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                border: `1px solid ${staff.status === opt.value ? opt.color : theme.palette.divider}`,
                                bgcolor: staff.status === opt.value ? `${opt.color}10` : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: `${opt.color}05`,
                                    borderColor: opt.color
                                },
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}
                        >
                            <Box sx={{ color: opt.color }}>{opt.icon}</Box>
                            <Box>
                                <Typography variant="body1" fontWeight="bold" sx={{ color: staff.status === opt.value ? opt.color : 'text.primary' }}>
                                    {opt.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {opt.desc}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Stack>
            </SwipeableModalBody>
            <SwipeableModalFooter>
                <Button onClick={onClose} variant="secondary" fullWidth sx={{ minHeight: '44px' }}>닫기</Button>
            </SwipeableModalFooter>
        </SwipeableModal>
    )
}
