'use client'

import { useMemo } from 'react'
import { Grid } from '@mui/material'
import MetricCard from '../../MetricCard'

interface DashboardMetricsWidgetProps {
  todayAppointments: number
  monthlyProfit: number
}

export default function DashboardMetricsWidget({
  todayAppointments,
  monthlyProfit,
}: DashboardMetricsWidgetProps) {
  const formattedMonthlyProfit = useMemo(
    () => `₩${Number(monthlyProfit || 0).toLocaleString()}`,
    [monthlyProfit]
  )

  return (
    <Grid container spacing={{ xs: 0.75, sm: 1.5, md: 2.5, lg: 3 }} sx={{ width: '100%', margin: 0 }}>
      <Grid item xs={6} md={6}>
        <MetricCard
          label="오늘 예약"
          value={todayAppointments}
          hint="오늘 기준"
          colorIndex={0}
        />
      </Grid>
      <Grid item xs={6} md={6}>
        <MetricCard
          label="월간 순이익"
          value={formattedMonthlyProfit}
          hint="이번 달 기준"
          colorIndex={1}
        />
      </Grid>
    </Grid>
  )
}
