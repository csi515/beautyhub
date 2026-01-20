'use client'

import { useMemo } from 'react'
import { Grid } from '@mui/material'
import MetricCard from '../../MetricCard'

interface DashboardMetricsWidgetProps {
  todayAppointments: number
  monthlyProfit: number
  monthlyNewCustomers: number
  monthlyAppointments: number
}

export default function DashboardMetricsWidget({
  todayAppointments,
  monthlyProfit,
  monthlyNewCustomers,
  monthlyAppointments,
}: DashboardMetricsWidgetProps) {
  const formattedMonthlyProfit = useMemo(
    () => `₩${Number(monthlyProfit || 0).toLocaleString()}`,
    [monthlyProfit]
  )

  return (
    <Grid container spacing={{ xs: 0.75, sm: 1.5, md: 2.5, lg: 3 }} sx={{ width: '100%', margin: 0 }}>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          label="오늘 예약"
          value={todayAppointments}
          hint="오늘 기준"
          colorIndex={0}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          label="월간 순이익"
          value={formattedMonthlyProfit}
          hint="이번 달 기준"
          colorIndex={1}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          label="이번 달 신규 고객"
          value={monthlyNewCustomers}
          hint="이번 달 기준"
          colorIndex={2}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          label="이번 달 총 예약"
          value={monthlyAppointments}
          hint="이번 달 기준"
          colorIndex={3}
        />
      </Grid>
    </Grid>
  )
}
