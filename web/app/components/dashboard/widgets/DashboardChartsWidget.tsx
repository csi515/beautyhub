'use client'

import { Grid } from '@mui/material'
import RevenueChart from '../RevenueChart'
import TopServicesChart from '../TopServicesChart'

interface DashboardChartsWidgetProps {
  monthlyRevenueData: any[]
  recentTransactions: any[]
  chartAppointments: any[]
  recentAppointments: any[]
}

export default function DashboardChartsWidget({
  monthlyRevenueData,
  recentTransactions,
  chartAppointments,
  recentAppointments,
}: DashboardChartsWidgetProps) {
  return (
    <Grid container spacing={{ xs: 0.75, sm: 1.5, md: 2.5, lg: 3 }} sx={{ minHeight: { xs: 'auto', md: 400 }, width: '100%', margin: 0, overflowX: 'hidden' }}>
      <Grid item xs={12} lg={8}>
        <RevenueChart transactions={monthlyRevenueData || recentTransactions} />
      </Grid>
      <Grid item xs={12} lg={4}>
        <TopServicesChart recentAppointments={chartAppointments || recentAppointments} />
      </Grid>
    </Grid>
  )
}
