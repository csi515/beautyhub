'use client'

import { Box, Typography, Divider } from '@mui/material'
import Input from '../../ui/Input'

interface EditableFields {
  base_salary: number
  overtime_pay: number
  incentive_pay: number
}

interface PayrollPaymentSectionProps {
  record: {
    base_salary: number
    overtime_pay: number
    incentive_pay: number
  }
  formData: EditableFields
  isEditing: boolean
  totalGross: number
  onFieldChange: (field: keyof EditableFields, value: string | number) => void
}

export default function PayrollPaymentSection({
  record,
  formData,
  isEditing,
  totalGross,
  onFieldChange,
}: PayrollPaymentSectionProps) {
  return (
    <Box className="bg-green-50 p-4 rounded-lg border border-green-200">
      <Typography variant="subtitle1" fontWeight={600} color="success.main" className="mb-3">
        지급 항목
      </Typography>

      <Box className="space-y-3">
        <Box className="flex justify-between items-center">
          <Typography variant="body2">기본급</Typography>
          {isEditing ? (
            <Input
              value={formData.base_salary}
              onChange={(e) => onFieldChange('base_salary', e.target.value)}
              className="w-32"
              rightIcon={<Typography variant="caption">원</Typography>}
            />
          ) : (
            <Typography variant="body2" fontWeight={600}>
              ₩{record.base_salary.toLocaleString()}
            </Typography>
          )}
        </Box>

        <Box className="flex justify-between items-center">
          <Typography variant="body2">연장/시급 수당</Typography>
          {isEditing ? (
            <Input
              value={formData.overtime_pay}
              onChange={(e) => onFieldChange('overtime_pay', e.target.value)}
              className="w-32"
              rightIcon={<Typography variant="caption">원</Typography>}
            />
          ) : (
            <Typography variant="body2" fontWeight={600}>
              ₩{record.overtime_pay.toLocaleString()}
            </Typography>
          )}
        </Box>

        <Box className="flex justify-between items-center">
          <Typography variant="body2">인센티브</Typography>
          {isEditing ? (
            <Input
              value={formData.incentive_pay}
              onChange={(e) => onFieldChange('incentive_pay', e.target.value)}
              className="w-32"
              rightIcon={<Typography variant="caption">원</Typography>}
            />
          ) : (
            <Typography variant="body2" fontWeight={600}>
              ₩{record.incentive_pay.toLocaleString()}
            </Typography>
          )}
        </Box>

        <Divider />

        <Box className="flex justify-between items-center">
          <Typography variant="body1" fontWeight={600}>총 지급액</Typography>
          <Typography variant="body1" fontWeight={700} color="success.main">
            ₩{totalGross.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
