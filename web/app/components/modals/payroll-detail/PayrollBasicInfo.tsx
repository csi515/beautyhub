'use client'

import { Box, Grid, Typography } from '@mui/material'
import { User, Calendar } from 'lucide-react'
import type { PayrollRecord } from '@/types/entities'

interface PayrollBasicInfoProps {
  staffName?: string
  record: PayrollRecord
}

export default function PayrollBasicInfo({ staffName, record }: PayrollBasicInfoProps) {
  return (
    <Box className="bg-gray-50 p-4 rounded-lg">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Box className="flex items-center gap-2 mb-2">
            <User size={16} className="text-gray-500" />
            <Typography variant="body2" color="text.secondary">직원</Typography>
          </Box>
          <Typography variant="body1" fontWeight={600}>
            {staffName || '직원'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-gray-500" />
            <Typography variant="body2" color="text.secondary">급여 월</Typography>
          </Box>
          <Typography variant="body1" fontWeight={600}>
            {record.month}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  )
}
