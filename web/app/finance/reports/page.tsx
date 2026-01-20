'use client'

import { useEffect, useState } from 'react'
import { Box, Container, Typography, Grid, Card, CardContent, Stack, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import { FileText, Download } from 'lucide-react'
import PageHeader, { createActionButton } from '@/app/components/common/PageHeader'
import LoadingState from '../../components/common/LoadingState'
import EmptyState from '@/app/components/ui/EmptyState'
import { useAppToast } from '@/app/lib/ui/toast'
import { generatePDFFromHTML, generateFinancialReportHTML } from '@/app/lib/utils/pdfGenerator'
import { exportToCSV } from '@/app/lib/utils/export'

interface FinancialReportData {
  period: string
  type: string
  year: number
  month: number | null
  quarter: number | null
  summary: {
    revenue: number
    expenses: number
    profit: number
    vat: number
  }
  revenueDetails: Array<{ category: string; amount: number }>
  expenseDetails: Array<{ category: string; amount: number }>
  transactionCount: number
  expenseCount: number
}

export default function FinanceReportsPage() {
  const [data, setData] = useState<FinancialReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportType, setReportType] = useState<'monthly' | 'quarterly'>('monthly')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [quarter, setQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3))
  const toast = useAppToast()

  useEffect(() => {
    fetchReport()
  }, [reportType, year, month, quarter])

  async function fetchReport() {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        type: reportType,
        year: String(year),
      })
      
      if (reportType === 'monthly') {
        params.append('month', String(month))
      } else {
        params.append('quarter', String(quarter))
      }

      const response = await fetch(`/api/finance/reports?${params.toString()}`)

      if (!response.ok) {
        throw new Error('리포트를 불러오는데 실패했습니다')
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

  const handleExportPDF = () => {
    if (!data) return

    const html = generateFinancialReportHTML({
      title: `${data.period} 재무 리포트`,
      period: data.period,
      revenue: data.summary.revenue,
      expenses: data.summary.expenses,
      profit: data.summary.profit,
      vat: data.summary.vat,
      details: [
        ...data.revenueDetails.map((d) => ({ category: `매출 - ${d.category}`, amount: d.amount })),
        ...data.expenseDetails.map((d) => ({ category: `지출 - ${d.category}`, amount: d.amount })),
      ],
    })

    generatePDFFromHTML(html, `${data.period}_재무리포트.pdf`)
    toast.success('PDF 생성이 시작되었습니다. 인쇄 대화상자에서 PDF로 저장하세요.')
  }

  const handleExportCSV = () => {
    if (!data) return

    const csvData = [
      {
        기간: data.period,
        매출: data.summary.revenue,
        지출: data.summary.expenses,
        순이익: data.summary.profit,
        부가세: data.summary.vat,
        거래건수: data.transactionCount,
        지출건수: data.expenseCount,
      },
    ]

    exportToCSV(csvData, `${data.period}_재무리포트.csv`)
    toast.success('CSV 파일이 다운로드되었습니다')
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  if (loading && !data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="세무 보고서"
          description="월별/분기별 재무 리포트 자동 생성"
          icon={<FileText />}
          actions={[]}
        />
        <Box sx={{ mb: 4 }}>
          <LoadingState variant="card" rows={3} />
        </Box>
      </Container>
    )
  }

  if (error && !data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="세무 보고서"
          description="월별/분기별 재무 리포트 자동 생성"
          icon={<FileText />}
          actions={[]}
        />
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="세무 보고서"
        description="월별/분기별 재무 리포트 자동 생성"
        icon={<FileText />}
        actions={[
          data && createActionButton('PDF 다운로드', handleExportPDF, 'primary', <Download size={18} />),
          data && createActionButton('CSV 다운로드', handleExportCSV, 'secondary', <Download size={18} />),
        ]}
      />

      <Stack spacing={4} sx={{ mt: 4 }}>
        {/* 리포트 옵션 */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              리포트 옵션
            </Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>리포트 유형</InputLabel>
                  <Select
                    value={reportType}
                    label="리포트 유형"
                    onChange={(e) => setReportType(e.target.value as 'monthly' | 'quarterly')}
                  >
                    <MenuItem value="monthly">월별</MenuItem>
                    <MenuItem value="quarterly">분기별</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>연도</InputLabel>
                  <Select
                    value={year}
                    label="연도"
                    onChange={(e) => setYear(Number(e.target.value))}
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}년
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {reportType === 'monthly' ? (
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>월</InputLabel>
                    <Select
                      value={month}
                      label="월"
                      onChange={(e) => setMonth(Number(e.target.value))}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <MenuItem key={m} value={m}>
                          {m}월
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              ) : (
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>분기</InputLabel>
                    <Select
                      value={quarter}
                      label="분기"
                      onChange={(e) => setQuarter(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4].map((q) => (
                        <MenuItem key={q} value={q}>
                          {q}분기
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {loading && data && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && data && (
          <Alert severity="error">{error}</Alert>
        )}

        {data && (
          <>
            {/* 요약 카드 */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      총 매출
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {data.summary.revenue.toLocaleString()}원
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {data.transactionCount}건
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
                      {data.summary.expenses.toLocaleString()}원
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {data.expenseCount}건
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
                    <Typography variant="h4" fontWeight={700} color={data.summary.profit >= 0 ? 'success.main' : 'error.main'}>
                      {data.summary.profit.toLocaleString()}원
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
                      {data.summary.vat.toLocaleString()}원
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      예상 부가세
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 매출 상세 */}
            {data.revenueDetails.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    매출 상세 내역
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>카테고리</TableCell>
                          <TableCell align="right">금액</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.revenueDetails.map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell>{detail.category}</TableCell>
                            <TableCell align="right">{detail.amount.toLocaleString()}원</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}

            {/* 지출 상세 */}
            {data.expenseDetails.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    지출 상세 내역
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>카테고리</TableCell>
                          <TableCell align="right">금액</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.expenseDetails.map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell>{detail.category}</TableCell>
                            <TableCell align="right">{detail.amount.toLocaleString()}원</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!data && !loading && (
          <EmptyState
            icon={FileText}
            title="리포트 데이터가 없습니다"
            description="리포트 옵션을 선택하고 데이터를 불러오세요."
          />
        )}
      </Stack>
    </Container>
  )
}
