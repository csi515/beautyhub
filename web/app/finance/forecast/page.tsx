'use client'

import { useEffect, useState } from 'react'
import { Box, Container, Typography, Grid, Card, CardContent, Stack, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material'
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts'
import { TrendingUp, DollarSign, TrendingDown, AlertCircle } from 'lucide-react'
import PageHeader, { createActionButton } from '@/app/components/common/PageHeader'
import { CardSkeleton } from '@/app/components/ui/SkeletonLoader'
import EmptyState from '@/app/components/ui/EmptyState'
import { format, addMonths } from 'date-fns'

interface ForecastData {
  revenue: {
    historical: Array<{ date: string; revenue: number }>
    forecast: {
      data: Array<{ date: string; actual: number; predicted?: number }>
      trend: number
      predictedNextMonth: number
      predictedNextQuarter: number[]
      confidence: number
    }
    seasonality: Record<number, number>
  }
  expenses: {
    historical: Array<{ date: string; revenue: number }>
    forecast: {
      data: Array<{ date: string; actual: number; predicted?: number }>
      trend: number
      predictedNextMonth: number
      predictedNextQuarter: number[]
      confidence: number
    }
    seasonality: Record<number, number>
  }
  profit: {
    predictedNextMonth: number
    predictedNextQuarter: number[]
  }
  summary: {
    avgRecentRevenue: number
    trend: number
    confidence: number
    period: string
  }
}

export default function FinanceForecastPage() {
  const [data, setData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [months, setMonths] = useState(12)

  useEffect(() => {
    fetchData()
  }, [months])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/finance/forecast?months=${months}`)

      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 차트 데이터 준비 (실제 + 예측)
  const chartData = data ? [
    ...data.revenue.forecast.data.map((d) => ({
      date: format(new Date(d.date), 'M월'),
      revenue: d.actual,
      predictedRevenue: d.predicted,
    })),
    ...data.revenue.forecast.predictedNextQuarter.map((rev, index) => {
      const nextMonth = addMonths(new Date(data.revenue.historical[data.revenue.historical.length - 1]?.date || new Date()), index + 1)
      return {
        date: format(nextMonth, 'M월'),
        revenue: null,
        predictedRevenue: rev,
      }
    }),
  ] : []

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="재무 예측 분석"
          description="매출 예측 및 목표 추적"
          icon={<TrendingUp />}
          actions={[]}
        />
        <Box sx={{ mb: 4 }}>
          <CardSkeleton count={3} />
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="재무 예측 분석"
          description="매출 예측 및 목표 추적"
          icon={<TrendingUp />}
          actions={[]}
        />
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  if (!data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="재무 예측 분석"
          description="매출 예측 및 목표 추적"
          icon={<TrendingUp />}
          actions={[]}
        />
        <EmptyState
          icon={TrendingUp}
          title="데이터가 없습니다"
          description="분석할 재무 데이터가 없습니다."
        />
      </Container>
    )
  }

  const trendDirection = data.summary.trend > 0 ? '증가' : data.summary.trend < 0 ? '감소' : '유지'
  const trendColor = data.summary.trend > 0 ? 'success' : data.summary.trend < 0 ? 'error' : 'warning'

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="재무 예측 분석"
        description="매출 예측 및 목표 추적"
        icon={<TrendingUp />}
        actions={[
          createActionButton(
            '기간 선택',
            () => {},
            'secondary',
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>기간</InputLabel>
              <Select
                value={months}
                label="기간"
                onChange={(e) => setMonths(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
              >
                <MenuItem value={6}>6개월</MenuItem>
                <MenuItem value={12}>12개월</MenuItem>
                <MenuItem value={24}>24개월</MenuItem>
              </Select>
            </FormControl>
          ),
        ]}
      />

      <Stack spacing={4} sx={{ mt: 4 }}>
        {/* 요약 카드 */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingUp size={20} color="#667eea" />
                  <Typography variant="body2" color="text.secondary">
                    예측 다음달 매출
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {Math.round(data.revenue.forecast.predictedNextMonth).toLocaleString()}원
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  신뢰도: {(data.revenue.forecast.confidence * 100).toFixed(0)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DollarSign size={20} color="#4facfe" />
                  <Typography variant="body2" color="text.secondary">
                    예측 다음달 순이익
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color={data.profit.predictedNextMonth > 0 ? 'success.main' : 'error.main'}>
                  {Math.round(data.profit.predictedNextMonth).toLocaleString()}원
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  예상 순이익
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingDown size={20} color={trendColor === 'success' ? '#10b981' : trendColor === 'error' ? '#ef4444' : '#f59e0b'} />
                  <Typography variant="body2" color="text.secondary">
                    매출 추세
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {trendDirection}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  월평균 {Math.abs(Math.round(data.summary.trend)).toLocaleString()}원
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AlertCircle size={20} color="#4ecdc4" />
                  <Typography variant="body2" color="text.secondary">
                    최근 3개월 평균
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {Math.round(data.summary.avgRecentRevenue).toLocaleString()}원
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  기준 매출
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 매출 예측 차트 */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              매출 예측 (실제 vs 예측)
            </Typography>
            <Box sx={{ mt: 3, width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value ? Math.round(value).toLocaleString() : '-'}원`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#667eea" name="실제 매출" />
                  <Line
                    type="monotone"
                    dataKey="predictedRevenue"
                    stroke="#f093fb"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="예측 매출"
                    dot={{ fill: '#f093fb' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* 다음 분기 예측 */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              다음 3개월 예측
            </Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {data.profit.predictedNextQuarter.map((profit, index) => {
                const nextMonth = addMonths(new Date(), index + 1)
                return (
                  <Grid item xs={12} sm={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {format(nextMonth, 'yyyy년 M월')}
                        </Typography>
                        <Typography variant="h5" fontWeight={700} color={profit > 0 ? 'success.main' : 'error.main'}>
                          {Math.round(profit).toLocaleString()}원
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          예상 순이익
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  )
}
