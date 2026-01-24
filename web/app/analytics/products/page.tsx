'use client'

import { useEffect, useState } from 'react'
import { Box, Container, Typography, Grid, Card, CardContent, Stack, FormControl, InputLabel, Select, MenuItem, useMediaQuery, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Package, TrendingUp, DollarSign, TrendingDown } from 'lucide-react'
import PageHeader, { createActionButton } from '@/app/components/common/PageHeader'
import MobileDataCard from '@/app/components/ui/MobileDataCard'
import LoadingState from '../../components/common/LoadingState'
import EmptyState from '@/app/components/ui/EmptyState'
import { exportToCSV } from '@/app/lib/utils/export'
import { useAppToast } from '@/app/lib/ui/toast'
import { useExportVisibility } from '@/app/lib/hooks/useExportVisibility'

interface ProductProfitabilityData {
  product_id: string
  product_name: string
  product_price: number
  sales_count: number
  total_revenue: number
  avg_revenue: number
  turnover_rate: number
  margin_rate: number
  total_margin: number
  profitability_score: number
  stock_count: number
  safety_stock: number
  active: boolean
}

interface ProductAnalyticsData {
  products: ProductProfitabilityData[]
  topProfitability: ProductProfitabilityData[]
  topRevenue: ProductProfitabilityData[]
  topTurnover: ProductProfitabilityData[]
  lowProfitability: ProductProfitabilityData[]
  summary: {
    totalProducts: number
    activeProducts: number
    period: string
  }
}

export default function ProductProfitabilityPage() {
  const [data, setData] = useState<ProductAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [months, setMonths] = useState(3)
  const toast = useAppToast()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { showExport } = useExportVisibility()

  useEffect(() => {
    fetchData()
  }, [months])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/analytics/products?months=${months}`)

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

  const handleExport = () => {
    if (!data) return
    // Service 레이어를 사용한 데이터 변환
    const { AnalyticsService } = require('../../lib/services/analytics.service')
    const dataToExport = AnalyticsService.prepareProductProfitabilityForExport(data.products)
    exportToCSV(dataToExport, `제품수익성분석_${new Date().toISOString().slice(0, 10)}.csv`)
    toast.success('CSV 파일이 다운로드되었습니다')
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="제품 수익성 분석"
          description="제품별 마진율과 회전율 분석"
          icon={<Package />}
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
          title="제품 수익성 분석"
          description="제품별 마진율과 회전율 분석"
          icon={<Package />}
          actions={[]}
        />
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  if (!data || data.products.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="제품 수익성 분석"
          description="제품별 마진율과 회전율 분석"
          icon={<Package />}
          actions={[]}
        />
        <EmptyState
          icon={Package}
          title="데이터가 없습니다"
          description="분석할 제품 데이터가 없습니다."
        />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="제품 수익성 분석"
        description="제품별 마진율과 회전율 분석"
        icon={<Package />}
        actions={[
          ...(showExport ? [createActionButton('CSV 내보내기', handleExport, 'secondary')] : []),
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
                  <Package size={20} color="#667eea" />
                  <Typography variant="body2" color="text.secondary">
                    총 제품 수
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {data.summary.totalProducts}개
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  활성: {data.summary.activeProducts}개
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingUp size={20} color="#4facfe" />
                  <Typography variant="body2" color="text.secondary">
                    최고 수익성 제품
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {data.topProfitability[0]?.product_name || '-'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {data.topProfitability[0]?.sales_count || 0}건 판매
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DollarSign size={20} color="#f093fb" />
                  <Typography variant="body2" color="text.secondary">
                    최고 매출 제품
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {data.topRevenue[0]?.product_name || '-'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {data.topRevenue[0]?.total_revenue.toLocaleString() || 0}원
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingDown size={20} color="#ef4444" />
                  <Typography variant="body2" color="text.secondary">
                    수익성 낮은 제품
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {data.lowProfitability.length}개
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  개선 필요
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Top 10 수익성 제품 */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              수익성 높은 제품 Top 10
            </Typography>
            <Box sx={{ mt: 3, width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.topProfitability}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="product_name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="profitability_score" fill="#667eea" name="수익성 점수" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Top 10 매출 제품 */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              매출 높은 제품 Top 10
            </Typography>
            <Box sx={{ mt: 3, width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.topRevenue}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="product_name" type="category" width={150} />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString()}원`} />
                  <Legend />
                  <Bar dataKey="total_revenue" fill="#4facfe" name="총 매출" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* 수익성 낮은 제품 */}
        {data.lowProfitability.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom color="error">
                수익성 낮은 제품 ({data.lowProfitability.length}개)
              </Typography>
              {isMobile ? (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {data.lowProfitability.slice(0, 10).map((product) => (
                    <MobileDataCard
                      key={product.product_id}
                      title={product.product_name}
                      subtitle={`수익성 점수: ${Math.round(product.profitability_score).toLocaleString()}`}
                      status={{ label: '개선 필요', color: 'error' }}
                    />
                  ))}
                </Stack>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>제품명</TableCell>
                        <TableCell align="right">판매횟수</TableCell>
                        <TableCell align="right">총매출</TableCell>
                        <TableCell align="right">회전율</TableCell>
                        <TableCell align="right">마진율</TableCell>
                        <TableCell align="right">수익성 점수</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.lowProfitability.slice(0, 20).map((product) => (
                        <TableRow key={product.product_id}>
                          <TableCell>{product.product_name}</TableCell>
                          <TableCell align="right">{product.sales_count}</TableCell>
                          <TableCell align="right">{product.total_revenue.toLocaleString()}원</TableCell>
                          <TableCell align="right">{product.turnover_rate.toFixed(2)}</TableCell>
                          <TableCell align="right">{product.margin_rate.toFixed(1)}%</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={Math.round(product.profitability_score).toLocaleString()}
                              size="small"
                              color="error"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
  )
}
