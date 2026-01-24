'use client'

import { useState, useEffect } from 'react'
import { Box, Grid, Typography, Divider } from '@mui/material'
import { Edit, Save } from 'lucide-react'
import SwipeableModal, { SwipeableModalBody, SwipeableModalFooter, SwipeableModalHeader } from '../ui/SwipeableModal'
import Button from '../ui/Button'
import Textarea from '../ui/Textarea'
import { useAppToast } from '../../lib/ui/toast'
import PayrollBasicInfo from './payroll-detail/PayrollBasicInfo'
import PayrollPaymentSection from './payroll-detail/PayrollPaymentSection'
import PayrollDeductionSection from './payroll-detail/PayrollDeductionSection'
import PayrollFinalAmount from './payroll-detail/PayrollFinalAmount'
import type { PayrollRecord } from '@/types/entities'

interface PayrollDetailModalProps {
    open: boolean
    onClose: () => void
    record: PayrollRecord | null
    staffName?: string | undefined
    onSaved: () => void
}

interface EditableFields {
    base_salary: number
    overtime_pay: number
    incentive_pay: number
    memo: string
}

export default function PayrollDetailModal({
    open,
    onClose,
    record,
    staffName,
    onSaved
}: PayrollDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<EditableFields>({
        base_salary: 0,
        overtime_pay: 0,
        incentive_pay: 0,
        memo: ''
    })
    const toast = useAppToast()

    // 모달이 열리거나 record가 변경될 때 폼 데이터 초기화
    useEffect(() => {
        if (record && open) {
            setFormData({
                base_salary: record.base_salary || 0,
                overtime_pay: record.overtime_pay || 0,
                incentive_pay: record.incentive_pay || 0,
                memo: record.memo || ''
            })
            setIsEditing(false)
        }
    }, [record, open])

    const handleSave = async () => {
        if (!record) return

        try {
            setSaving(true)

            // 총 지급액 재계산
            const totalGross = formData.base_salary + formData.overtime_pay + formData.incentive_pay

            // 공제액 재계산 (기존 비율 유지)
            const deductions = record.total_deductions || 0
            const netSalary = totalGross - deductions

            const updateData = {
                base_salary: formData.base_salary,
                overtime_pay: formData.overtime_pay,
                incentive_pay: formData.incentive_pay,
                total_gross: totalGross,
                total_deductions: deductions,
                net_salary: netSalary,
                memo: formData.memo
            }

            const response = await fetch('/api/payroll/records', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    staff_id: record.staff_id,
                    month: record.month,
                    ...updateData
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || '급여 수정에 실패했습니다')
            }

            toast.success('급여 정보가 수정되었습니다')
            setIsEditing(false)
            onSaved()
        } catch (error) {
            console.error('Error updating payroll:', error)
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
            toast.error(`급여 수정 실패: ${errorMessage}`)
        } finally {
            setSaving(false)
        }
    }

    const handleFieldChange = (field: keyof EditableFields, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === 'memo' ? value : Number(value) || 0
        }))
    }

    if (!record) return null

    const totalGross = formData.base_salary + formData.overtime_pay + formData.incentive_pay
    const totalDeductions = record.total_deductions || 0
    const netSalary = totalGross - totalDeductions

    return (
        <SwipeableModal open={open} onClose={onClose} size="fullscreen">
            <SwipeableModalHeader title={`${staffName || '직원'} 급여 상세`} onClose={onClose} />

            <SwipeableModalBody>
                <Box className="space-y-6">
                    <PayrollBasicInfo staffName={staffName} record={record} />

                    {/* 수정 모드 토글 */}
                    <Box className="flex justify-between items-center">
                        <Typography variant="h6" fontWeight={600}>급여 내역</Typography>
                        <Button
                            variant={isEditing ? "secondary" : "primary"}
                            size="sm"
                            leftIcon={isEditing ? <Save size={16} /> : <Edit size={16} />}
                            onClick={() => {
                                if (isEditing) {
                                    handleSave()
                                } else {
                                    setIsEditing(true)
                                }
                            }}
                            loading={saving}
                        >
                            {isEditing ? '저장' : '수정'}
                        </Button>
                    </Box>

                    <Divider />

                    {/* 급여 항목 */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <PayrollPaymentSection
                                record={record}
                                formData={formData}
                                isEditing={isEditing}
                                totalGross={totalGross}
                                onFieldChange={handleFieldChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <PayrollDeductionSection
                                record={record}
                                totalDeductions={totalDeductions}
                            />
                        </Grid>
                    </Grid>

                    <PayrollFinalAmount netSalary={netSalary} />

                    {/* 메모 */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight={600} className="mb-2">메모</Typography>
                        {isEditing ? (
                            <Textarea
                                value={formData.memo}
                                onChange={(e) => handleFieldChange('memo', e.target.value)}
                                placeholder="급여 관련 메모를 입력하세요"
                                rows={3}
                            />
                        ) : (
                            <Box className="bg-gray-50 p-3 rounded border min-h-[80px]">
                                <Typography variant="body2" color={record.memo ? 'text.primary' : 'text.secondary'}>
                                    {record.memo || '메모가 없습니다'}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </SwipeableModalBody>

            <SwipeableModalFooter>
                <Button variant="secondary" onClick={onClose} fullWidth sx={{ minHeight: '44px' }}>닫기</Button>
                {isEditing && (
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        loading={saving}
                        leftIcon={<Save size={18} />}
                        fullWidth
                        sx={{ minHeight: '44px' }}
                    >
                        저장하기
                    </Button>
                )}
            </SwipeableModalFooter>
        </SwipeableModal>
    )
}
