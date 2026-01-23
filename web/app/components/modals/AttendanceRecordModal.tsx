'use client'

import { useState, useEffect } from 'react'
import { Staff, StaffAttendance, StaffAttendanceCreateInput } from '@/types/entities'
import {
    TextField,
    Stack,
    MenuItem,
    FormControl,
    InputLabel,
    Select
} from '@mui/material'
import Button from '../ui/Button'
import SwipeableModal, { SwipeableModalBody, SwipeableModalFooter, SwipeableModalHeader } from '../ui/SwipeableModal'
import { format } from 'date-fns'

interface AttendanceRecordModalProps {
    open: boolean
    record?: StaffAttendance | null
    staffList: Staff[]
    preSelectedStaff?: Staff | null
    onClose: () => void
    onSave: (data: StaffAttendanceCreateInput) => Promise<void>
    onDelete?: (id: string) => Promise<void>
}

/**
 * 출퇴근 기록 수동 입력/수정 모달
 */
export default function AttendanceRecordModal({
    open,
    record,
    staffList,
    preSelectedStaff,
    onClose,
    onSave,
    onDelete
}: AttendanceRecordModalProps) {
    const [form, setForm] = useState<StaffAttendanceCreateInput>({
        staff_id: '',
        type: 'actual',
        start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        end_time: format(new Date(Date.now() + 9 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
        status: 'normal',
        memo: ''
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (record) {
            setForm({
                staff_id: record.staff_id,
                type: record.type,
                start_time: format(new Date(record.start_time), "yyyy-MM-dd'T'HH:mm"),
                end_time: format(new Date(record.end_time), "yyyy-MM-dd'T'HH:mm"),
                status: record.status || 'normal',
                memo: record.memo || ''
            })
        } else if (preSelectedStaff) {
            setForm(prev => ({
                ...prev,
                staff_id: preSelectedStaff.id
            }))
        } else {
            setForm({
                staff_id: '',
                type: 'actual',
                start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                end_time: format(new Date(Date.now() + 9 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
                status: 'normal',
                memo: ''
            })
        }
    }, [record, preSelectedStaff, open])

    const handleSave = async () => {
        if (!form.staff_id) {
            alert('직원을 선택해주세요.')
            return
        }

        try {
            setLoading(true)
            await onSave(form)
            onClose()
        } catch (error) {
            console.error('저장 실패:', error)
            alert('저장에 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!record?.id) return
        if (!confirm('이 기록을 삭제하시겠습니까?')) return

        try {
            setLoading(true)
            await onDelete?.(record.id)
            onClose()
        } catch (error) {
            console.error('삭제 실패:', error)
            alert('삭제에 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <SwipeableModal open={open} onClose={onClose} size="fullscreen">
            <SwipeableModalHeader
                title={record ? '근태 기록 수정' : '근태 기록 추가'}
                description="출퇴근 시간을 수동으로 입력하거나 수정합니다"
                onClose={onClose}
            />
            <SwipeableModalBody>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>직원</InputLabel>
                        <Select
                            value={form.staff_id}
                            label="직원"
                            onChange={e => setForm({ ...form, staff_id: e.target.value })}
                            disabled={!!record}
                        >
                            {staffList.filter(s => s.active !== false).map(staff => (
                                <MenuItem key={staff.id} value={staff.id}>
                                    {staff.name} ({staff.role || '직원'})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>유형</InputLabel>
                        <Select
                            value={form.type}
                            label="유형"
                            onChange={e => setForm({ ...form, type: e.target.value as 'scheduled' | 'actual' })}
                        >
                            <MenuItem value="actual">실제 근무</MenuItem>
                            <MenuItem value="scheduled">예정 근무</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="출근 시간"
                        type="datetime-local"
                        value={form.start_time}
                        onChange={e => setForm({ ...form, start_time: e.target.value })}
                        fullWidth
                        slotProps={{
                            inputLabel: { shrink: true }
                        }}
                    />

                    <TextField
                        label="퇴근 시간"
                        type="datetime-local"
                        value={form.end_time}
                        onChange={e => setForm({ ...form, end_time: e.target.value })}
                        fullWidth
                        slotProps={{
                            inputLabel: { shrink: true }
                        }}
                    />

                    <FormControl fullWidth>
                        <InputLabel>상태</InputLabel>
                        <Select
                            value={form.status || 'normal'}
                            label="상태"
                            onChange={e => setForm({ ...form, status: e.target.value })}
                        >
                            <MenuItem value="normal">정상</MenuItem>
                            <MenuItem value="late">지각</MenuItem>
                            <MenuItem value="early">조퇴</MenuItem>
                            <MenuItem value="absent">결근</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="메모"
                        multiline
                        rows={3}
                        value={form.memo || ''}
                        onChange={e => setForm({ ...form, memo: e.target.value })}
                        placeholder="특이사항이나 메모를 입력하세요"
                        fullWidth
                    />
                </Stack>
            </SwipeableModalBody>

            <SwipeableModalFooter>
                {record && onDelete && (
                    <Button
                        onClick={handleDelete}
                        disabled={loading}
                        variant="danger"
                        fullWidth
                        sx={{ minHeight: '44px' }}
                    >
                        삭제
                    </Button>
                )}
                <Button onClick={onClose} disabled={loading} variant="secondary" fullWidth sx={{ minHeight: '44px' }}>
                    취소
                </Button>
                <Button
                    onClick={handleSave}
                    variant="primary"
                    disabled={loading}
                    fullWidth
                    sx={{ minHeight: '44px' }}
                >
                    저장
                </Button>
            </SwipeableModalFooter>
        </SwipeableModal>
    )
}
