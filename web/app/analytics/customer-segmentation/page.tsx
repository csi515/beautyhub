'use client'

import { useEffect, useState, useMemo } from 'react'
import { Box, Container, Typography, Grid, Card, CardContent, Stack, FormControl, InputLabel, Select, MenuItem, useMediaQuery, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users } from 'lucide-react'
import PageHeader, { createActionButton } from '@/app/components/common/PageHeader'
import MobileDataCard from '@/app/components/ui/MobileDataCard'
import LoadingState from '../../components/common/LoadingState'
import EmptyState from '@/app/components/ui/EmptyState'
import { exportToCSV } from '@/app/lib/utils/export'
import { useAppToast } from '@/app/lib/ui/toast'
import { useExportVisibility } from '@/app/lib/hooks/useExportVisibility'
import type { RFMAnalysis } from '@/types/customer'

interface CustomerSegmentationData {
  customers: RFMAnalysis[]
  segmentStats: Record<string, { count: number; total_revenue: number; avg_revenue: number }>
  period: string
  totalCustomers: number
}

const SEGMENT_COLORS: Record<string, string> = {
  VIP: '#f59e0b',
  우수: '#3b82f6',
  일반: '#6b7280',
  휴면: '#9ca3af',
  잠재VIP: '#8b5cf6',
  이탈위험: '#ef4444',
}

export default function CustomerSegmentationPage() {
  const [data, setData] = useState<CustomerSegmentationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [periodDays, setPeriodDays] = useState(90)
  const [selectedSegment, setSelectedSegment] = useState<string>('all')
  const toast = useAppToast()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { showExport } = useExportVisibility()

  useEffect(() => {
    fetchData()
  }, [periodDays])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/analytics/customer-segmentation?period_days=${periodDays}`)

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

  const filteredCustomers = useMemo(() => {
    if (!data) return []
    if (selectedSegment === 'all') return data.customers
    return data.customers.filter((c) => c.segment === selectedSegment)
  }, [data, selectedSegment])

  const segmentChartData = useMemo(() => {
    if (!data) return []
    return Object.entries(data.segmentStats).map(([segment, stats]) => ({
      name: segment,
      value: stats.count,
      revenue: stats.total_revenue,
      avgRevenue: stats.avg_revenue,
    }))
  }, [data])

  const handleExport = () => {
    if (!data) return
    const dataToExport = filteredCustomers.map((customer) => ({
      고객명: customer.customer_name,
      전화번호: customer.customer_phone || '-',
      이메일: customer.customer_email || '-',
      세그먼트: customer.segment,
      R점수: customer.r_score,
      F점수: customer.f_score,
      M점수: customer.m_score,
      최근성: `${customer.recency}일`,
      빈도: customer.frequency,
      금액: customer.monetary.toLocaleString(),
      거래횟수: customer.transaction_count,
      방문횟수: customer.visit_count,
    }))
    exportToCSV(dataToExport, `고객세그멘테이션_${new Date().toISOString().slice(0, 10)}.csv`)
    toast.success('CSV 파일이 다운로드되었습니다')
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="고객 세그멘테이션 (RFM 분석)"
          description="고객을 행동 패턴에 따라 분류합니다"
          icon={<Users />}
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
          title="고객 세그멘테이션 (RFM 분석)"
          description="고객을 행동 패턴에 따라 분류합니다"
          icon={<Users />}
          actions={[]}
        />
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  if (!data || data.customers.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="고객 세그멘테이션 (RFM 분석)"
          description="고객을 행동 패턴에 따라 분류합니다"
          icon={<Users />}
          actions={[]}
        />
        <EmptyState
          icon={Users}
          title="데이터가 없습니다"
          description="분석할 고객 데이터가 없습니다."
        />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="고객 세그멘테이션 (RFM 분석)"
        description="고객을 행동 패턴에 따라 분류합니다"
        icon={<Users />}
        actions={showExport ? [createActionButton('CSV 내보내기', handleExport, 'secondary')] : []}
      />

      <Stack spacing={4} sx={{ mt: 4 }}>
        {/* 필터 */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>기간</InputLabel>
            <Select
              value={periodDays}
              label="기간"
              onChange={(e) => setPeriodDays(Number(e.target.value))}
            >
              <MenuItem value={30}>30일</MenuItem>
              <MenuItem value={60}>60일</MenuItem>
              <MenuItem value={90}>90일</MenuItem>
              <MenuItem value={180}>180일</MenuItem>
              <MenuItem value={365}>365일</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>세그먼트</InputLabel>
            <Select
              value={selectedSegment}
              label="세그먼트"
              onChange={(e) => setSelectedSegment(e.target.value)}
            >
              <MenuItem value="all">전체</MenuItem>
              <MenuItem value="VIP">VIP</MenuItem>
              <MenuItem value="우수">우수</MenuItem>
              <MenuItem value="일반">일반</MenuItem>
              <MenuItem value="잠재VIP">잠재VIP</MenuItem>
              <MenuItem value="이탈위험">이탈위험</MenuItem>
              <MenuItem value="휴면">휴면</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* 요약 카드 */}
        <Grid container spacing={3}>
          {Object.entries(data.segmentStats).map(([segment, stats]) => (
            <Grid item xs={12} sm={6} md={4} key={segment}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: SEGMENT_COLORS[segment] || '#6b7280',
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {segment}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700}>
                    {stats.count}명
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    평균 매출: {Math.round(stats.avg_revenue).toLocaleString()}원
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 세그먼트 분포 차트 */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              세그먼트 분포
            </Typography>
            <Box sx={{ mt: 3, width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={segmentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {segmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SEGMENT_COLORS[entry.name] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* 고객 목록 */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              고객 목록 ({filteredCustomers.length}명)
            </Typography>
            {isMobile ? (
              <Stack spacing={2} sx={{ mt: 2 }}>
                {filteredCustomers.slice(0, 20).map((customer) => (
                  <MobileDataCard
                    key={customer.customer_id}
                    title={customer.customer_name}
                    subtitle={`R:${customer.r_score} F:${customer.f_score} M:${customer.m_score}`}
                    status={{
                      label: customer.segment,
                      color: customer.segment === 'VIP' ? 'warning' : customer.segment === '이탈위험' ? 'error' : 'primary',
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>고객명</TableCell>
                      <TableCell>세그먼트</TableCell>
                      <TableCell align="right">R점수</TableCell>
                      <TableCell align="right">F점수</TableCell>
                      <TableCell align="right">M점수</TableCell>
                      <TableCell align="right">최근성</TableCell>
                      <TableCell align="right">빈도</TableCell>
                      <TableCell align="right">금액</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCustomers.slice(0, 50).map((customer) => (
                      <TableRow key={customer.customer_id}>
                        <TableCell>{customer.customer_name}</TableCell>
                        <TableCell>
                          <Chip
                            label={customer.segment}
                            size="small"
                            sx={{
                              bgcolor: SEGMENT_COLORS[customer.segment] || '#6b7280',
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">{customer.r_score}</TableCell>
                        <TableCell align="right">{customer.f_score}</TableCell>
                        <TableCell align="right">{customer.m_score}</TableCell>
                        <TableCell align="right">{customer.recency}일</TableCell>
                        <TableCell align="right">{customer.frequency}</TableCell>
                        <TableCell align="right">{customer.monetary.toLocaleString()}원</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  )
}
