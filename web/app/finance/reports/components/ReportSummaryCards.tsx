'use client'

import { Grid, Card, CardContent, Typography } from '@mui/material'

interface ReportSummaryCardsProps {
  revenue: number
  expenses: number
  profit: number
  vat: number
  transactionCount: number
  expenseCount: number
}

export default function ReportSummaryCards({
  revenue,
  expenses,
  profit,
  vat,
  transactionCount,
  expenseCount,
}: ReportSummaryCardsProps) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              총 매출
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {revenue.toLocaleString()}원
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {transactionCount}건
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              총 지출
            </Typography>
            <Typography variant="h4" fontWeight={700} color="error.main">
              {expenses.toLocaleString()}원
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {expenseCount}건
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              순이익
            </Typography>
            <Typography variant="h4" fontWeight={700} color={profit >= 0 ? 'success.main' : 'error.main'}>
              {profit.toLocaleString()}원
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              부가세 (10%)
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {vat.toLocaleString()}원
            </Typography>
            <Typography variant="caption" color="text.secondary">
              예상 부가세
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
