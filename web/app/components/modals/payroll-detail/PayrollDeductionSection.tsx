'use client'

import { Box, Typography, Divider } from '@mui/material'
import type { PayrollRecord } from '@/types/entities'

interface PayrollDeductionSectionProps {
  record: PayrollRecord
  totalDeductions: number
}

export default function PayrollDeductionSection({
  record,
  totalDeductions,
}: PayrollDeductionSectionProps) {
  return (
    <Box className="bg-red-50 p-4 rounded-lg border border-red-200">
      <Typography variant="subtitle1" fontWeight={600} color="error.main" className="mb-3">
        공제 항목
      </Typography>

      <Box className="space-y-2">
        <Box className="flex justify-between items-center">
          <Typography variant="body2">국민연금</Typography>
          <Typography variant="body2" color="error.main">
            -₩{record.national_pension.toLocaleString()}
          </Typography>
        </Box>

        <Box className="flex justify-between items-center">
          <Typography variant="body2">건강보험</Typography>
          <Typography variant="body2" color="error.main">
            -₩{record.health_insurance.toLocaleString()}
          </Typography>
        </Box>

        <Box className="flex justify-between items-center">
          <Typography variant="body2">고용보험</Typography>
          <Typography variant="body2" color="error.main">
            -₩{record.employment_insurance.toLocaleString()}
          </Typography>
        </Box>

        <Box className="flex justify-between items-center">
          <Typography variant="body2">소득세</Typography>
          <Typography variant="body2" color="error.main">
            -₩{record.income_tax.toLocaleString()}
          </Typography>
        </Box>

        <Divider />

        <Box className="flex justify-between items-center">
          <Typography variant="body1" fontWeight={600}>총 공제액</Typography>
          <Typography variant="body1" fontWeight={600} color="error.main">
            -₩{totalDeductions.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
