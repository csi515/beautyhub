'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Box, Container, Typography, Grid, Card, CardContent, Stack, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { User, Calendar, DollarSign, TrendingUp, Clock, Award } from 'lucide-react'
import PageHeader, { createActionButton } from '@/app/components/common/PageHeader'
import { CardSkeleton } from '@/app/components/ui/SkeletonLoader'
import EmptyState from '@/app/components/ui/EmptyState'

interface StaffPerformanceData {
  staff: {
    id: string
    name: string
    role?: string | null
    incentive_rate?: number | null
  }
  performance: {
    appointmentCount: number
    completedCount: number
    totalRevenue: number
    avgRevenue: number
    totalWorkHours: number
    revenuePerHour: number
    incentivePay: number
    avgAppointmentsPerMonth: number
    avgRevenuePerMonth: number
  }
  monthlyTrends: Array<{ month: string; appointments: number; revenue: number }>
  period: string
}

export default function StaffPerformancePage() {
  const params = useParams()
  const router = useRouter()
  const staffId = params?.id as string

  const [data, setData] = useState<StaffPerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [months, setMonths] = useState(3)

  useEffect(() => {
    if (staffId) {
      fetchData()
    }
  }, [staffId, months])

  async function fetchData() {
    if (!staffId) return

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/staff/${staffId}/performance?months=${months}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('직원을 찾을 수 없습니다.')
        }
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="직원 성과 분석"
          description="직원별 예약, 매출, 고객 만족도 통계"
          icon={<User />}
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
          title="직원 성과 분석"
          description="직원별 예약, 매출, 고객 만족도 통계"
          icon={<User />}
          actions={[
            createActionButton('직원 목록으로', () => router.push('/staff'), 'secondary'),
          ]}
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
          title="직원 성과 분석"
          description="직원별 예약, 매출, 고객 만족도 통계"
          icon={<User />}
          actions={[]}
        />
        <EmptyState
          icon={User}
          title="데이터가 없습니다"
          description="분석할 성과 데이터가 없습니다."
        />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <PageHeader
        title={`${data.staff.name}님의 성과 분석`}
        description={data.staff.role ? `역할: ${data.staff.role}` : '직원별 예약, 매출 통계'}
        icon={<User />}
        actions={[
          createActionButton('직원 목록으로', () => router.push('/staff'), 'secondary'),
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
                <MenuItem value={1}>1개월</MenuItem>
                <MenuItem value={3}>3개월</MenuItem>
                <MenuItem value={6}>6개월</MenuItem>
                <MenuItem value={12}>12개월</MenuItem>
              </Select>
            </FormControl>
          ),
        ]}
      />

      <Stack spacing={4} sx={{ mt: 4 }}>
        {/* 성과 요약 카드 */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Calendar size={20} color="#667eea" />
                  <Typography variant="body2" color="text.secondary">
                    총 예약 수
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {data.performance.appointmentCount}건
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  완료: {data.performance.completedCount}건
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
                    총 매출
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {data.performance.totalRevenue.toLocaleString()}원
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  평균: {Math.round(data.performance.avgRevenue).toLocaleString()}원
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Clock size={20} color="#f093fb" />
                  <Typography variant="body2" color="text.secondary">
                    총 근무 시간
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {data.performance.totalWorkHours}시간
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  시간당: {data.performance.revenuePerHour.toLocaleString()}원
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Award size={20} color="#4ecdc4" />
                  <Typography variant="body2" color="text.secondary">
                    예상 인센티브
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {data.performance.incentivePay.toLocaleString()}원
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  인센티브율: {data.staff.incentive_rate || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 월별 트렌드 */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              월별 성과 추이
            </Typography>
            <Box sx={{ mt: 3, width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="appointments"
                    stroke="#667eea"
                    name="예약 수"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4facfe"
                    name="매출 (원)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* 월별 상세 */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              월별 상세 성과
            </Typography>
            <Box sx={{ mt: 3, width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue') {
                        return `${value.toLocaleString()}원`
                      }
                      return value
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="appointments"
                    fill="#667eea"
                    name="예약 수"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="revenue"
                    fill="#4facfe"
                    name="매출 (원)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* 평균 성과 */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUp size={20} color="#667eea" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    월평균 예약 수
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  {data.performance.avgAppointmentsPerMonth.toFixed(1)}건
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  최근 {data.period} 기준
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <DollarSign size={20} color="#4facfe" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    월평균 매출
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  {data.performance.avgRevenuePerMonth.toLocaleString()}원
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  최근 {data.period} 기준
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  )
}
