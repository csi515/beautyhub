'use client'

import { useEffect, useState } from 'react'
import { Box, Container, Typography, Grid, Card, CardContent, Stack, FormControl, InputLabel, Select, MenuItem, useMediaQuery, Alert } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Calendar, Clock, TrendingUp, Users } from 'lucide-react'
import PageHeader, { createActionButton } from '@/app/components/common/PageHeader'
import MobileDataCard from '@/app/components/ui/MobileDataCard'
import LoadingState from '../../components/common/LoadingState'
import EmptyState from '@/app/components/ui/EmptyState'

interface AppointmentPatternData {
  summary: {
    totalAppointments: number
    period: string
  }
  hourlyAnalysis: {
    topHours: Array<{ hour: number; count: number }>
    hourlyData: Array<{ hour: number; label: string; count: number }>
  }
  dayOfWeekAnalysis: {
    topDays: Array<{ day: number; count: number }>
    dayOfWeekData: Array<{ day: number; label: string; count: number }>
  }
  serviceAnalysis: {
    topServices: Array<{ name: string; count: number }>
    totalServices: number
  }
  staffAnalysis: {
    topStaff: Array<{ name: string; count: number }>
    totalStaff: number
  }
  monthlyTrends: Array<{ month: string; count: number }>
}

export default function AppointmentAnalyticsPage() {
  const [data, setData] = useState<AppointmentPatternData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [months, setMonths] = useState(3)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    fetchData()
  }, [months])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/analytics/appointments?months=${months}`)

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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="예약 패턴 분석"
          description="예약 데이터를 분석하여 운영 최적화 인사이트를 제공합니다"
          icon={<Calendar />}
          actions={[]}
        />
        <Box sx={{ mb: 4 }}>
          <LoadingState variant="card" rows={3} />
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="예약 패턴 분석"
          description="예약 데이터를 분석하여 운영 최적화 인사이트를 제공합니다"
          icon={<Calendar />}
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
          title="예약 패턴 분석"
          description="예약 데이터를 분석하여 운영 최적화 인사이트를 제공합니다"
          icon={<Calendar />}
          actions={[]}
        />
        <EmptyState
          icon={Calendar}
          title="데이터가 없습니다"
          description="분석할 예약 데이터가 없습니다."
        />
      </Container>
    )
  }

  const dayLabels: Record<number, string> = {
    0: '일요일',
    1: '월요일',
    2: '화요일',
    3: '수요일',
    4: '목요일',
    5: '금요일',
    6: '토요일',
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="예약 패턴 분석"
        description="예약 데이터를 분석하여 운영 최적화 인사이트를 제공합니다"
        icon={<Calendar />}
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
        {/* 요약 카드 */}
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
                  {data.summary.totalAppointments.toLocaleString()}건
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  최근 {data.summary.period}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Clock size={20} color="#4facfe" />
                  <Typography variant="body2" color="text.secondary">
                    인기 시간대
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {data.hourlyAnalysis.topHours[0]?.hour || 0}시
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {data.hourlyAnalysis.topHours[0]?.count || 0}건
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingUp size={20} color="#f093fb" />
                  <Typography variant="body2" color="text.secondary">
                    인기 요일
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {dayLabels[data.dayOfWeekAnalysis.topDays[0]?.day || 0] || '-'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {data.dayOfWeekAnalysis.topDays[0]?.count || 0}건
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Users size={20} color="#4ecdc4" />
                  <Typography variant="body2" color="text.secondary">
                    활성 시술
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {data.serviceAnalysis.totalServices}개
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  시술 종류
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 시간대별 인기 분석 */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              시간대별 예약 분포
            </Typography>
            <Box sx={{ mt: 3, width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.hourlyAnalysis.hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#667eea" name="예약 수" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* 요일별 인기 분석 */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              요일별 예약 분포
            </Typography>
            <Box sx={{ mt: 3, width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dayOfWeekAnalysis.dayOfWeekData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#4facfe" name="예약 수" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* 월별 트렌드 */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              월별 예약 트렌드
            </Typography>
            <Box sx={{ mt: 3, width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#f093fb" name="예약 수" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* 인기 시술 Top 10 */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              인기 시술 Top 10
            </Typography>
            <Box sx={{ mt: 3 }}>
              {isMobile ? (
                <Stack spacing={2}>
                  {data.serviceAnalysis.topServices.map((service, index) => (
                    <MobileDataCard
                      key={service.name}
                      title={`${index + 1}. ${service.name}`}
                      subtitle={`${service.count}건`}
                      status={{ label: `${service.count}건`, color: 'primary' }}
                    />
                  ))}
                </Stack>
              ) : (
                <Box sx={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.serviceAnalysis.topServices}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#4ecdc4" name="예약 수" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* 직원별 효율성 Top 10 */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              직원별 예약 수 Top 10
            </Typography>
            <Box sx={{ mt: 3 }}>
              {isMobile ? (
                <Stack spacing={2}>
                  {data.staffAnalysis.topStaff.map((staff, index) => (
                    <MobileDataCard
                      key={staff.name}
                      title={`${index + 1}. ${staff.name}`}
                      subtitle={`${staff.count}건`}
                      status={{ label: `${staff.count}건`, color: 'primary' }}
                    />
                  ))}
                </Stack>
              ) : (
                <Box sx={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.staffAnalysis.topStaff}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#f093fb" name="예약 수" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  )
}
