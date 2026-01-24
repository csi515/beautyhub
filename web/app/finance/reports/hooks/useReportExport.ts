'use client'

import { useAppToast } from '@/app/lib/ui/toast'
import { generatePDFFromHTML, generateFinancialReportHTML } from '@/app/lib/utils/pdfGenerator'
import { exportToCSV } from '@/app/lib/utils/export'

interface FinancialReportData {
  period: string
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

export function useReportExport() {
  const toast = useAppToast()

  const handleExportPDF = (data: FinancialReportData) => {
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

  const handleExportCSV = (data: FinancialReportData) => {
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

  return {
    handleExportPDF,
    handleExportCSV,
  }
}
