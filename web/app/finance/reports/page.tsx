'use client'

import { useEffect, useState } from 'react'
import { Box, Container, Stack, CircularProgress, Alert } from '@mui/material'
import { FileText, Download } from 'lucide-react'
import PageHeader, { createActionButton } from '@/app/components/common/PageHeader'
import LoadingState from '../../components/common/LoadingState'
import EmptyState from '@/app/components/ui/EmptyState'
import ReportOptions from './components/ReportOptions'
import ReportSummaryCards from './components/ReportSummaryCards'
import RevenueDetailsTable from './components/RevenueDetailsTable'
import ExpenseDetailsTable from './components/ExpenseDetailsTable'
import { useReportExport } from './hooks/useReportExport'
import { useExportVisibility } from '@/app/lib/hooks/useExportVisibility'

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
  
  const { handleExportPDF, handleExportCSV } = useReportExport()
  const { showExport } = useExportVisibility()

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
          ...(data ? [createActionButton('PDF 다운로드', () => handleExportPDF(data), 'primary', <Download size={18} />)] : []),
          ...(data && showExport ? [createActionButton('CSV 다운로드', () => handleExportCSV(data), 'secondary', <Download size={18} />)] : []),
        ]}
      />

      <Stack spacing={4} sx={{ mt: 4 }}>
        <ReportOptions
          reportType={reportType}
          year={year}
          month={month}
          quarter={quarter}
          onReportTypeChange={setReportType}
          onYearChange={setYear}
          onMonthChange={setMonth}
          onQuarterChange={setQuarter}
        />

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
            <ReportSummaryCards
              revenue={data.summary.revenue}
              expenses={data.summary.expenses}
              profit={data.summary.profit}
              vat={data.summary.vat}
              transactionCount={data.transactionCount}
              expenseCount={data.expenseCount}
            />

            <RevenueDetailsTable revenueDetails={data.revenueDetails} />

            <ExpenseDetailsTable expenseDetails={data.expenseDetails} />
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
