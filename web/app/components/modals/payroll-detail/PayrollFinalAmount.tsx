'use client'

import { Box, Typography } from '@mui/material'

interface PayrollFinalAmountProps {
  netSalary: number
}

export default function PayrollFinalAmount({ netSalary }: PayrollFinalAmountProps) {
  return (
    <Box className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <Box className="flex justify-between items-center">
        <Typography variant="h6" fontWeight={700}>실지급액</Typography>
        <Typography variant="h5" fontWeight={700} color="primary.main">
          ₩{netSalary.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  )
}
