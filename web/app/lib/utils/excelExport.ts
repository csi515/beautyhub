import * as XLSX from 'xlsx'

export interface FinanceExportData {
  date: string
  type: '수입' | '지출'
  amount: number
  category?: string
  memo?: string
}

export interface FinanceSummary {
  totalIncome: number
  totalExpense: number
  profit: number
  period: { from: string; to: string }
}

/**
 * 재무 데이터를 Excel 파일로 내보내기
 */
export function exportFinanceToExcel(
  data: FinanceExportData[],
  summary: FinanceSummary
): void {
  // 워크북 생성
  const wb = XLSX.utils.book_new()

  // 요약 시트 데이터
  const summaryData = [
    ['재무 요약'],
    [''],
    ['기간', `${summary.period.from} ~ ${summary.period.to}`],
    [''],
    ['총 수입', `₩${summary.totalIncome.toLocaleString()}`],
    ['총 지출', `₩${summary.totalExpense.toLocaleString()}`],
    ['순이익', `₩${summary.profit.toLocaleString()}`],
  ]

  // 상세 내역 시트 데이터
  const detailData = [
    ['일자', '유형', '금액', '카테고리', '메모'],
    ...data.map((item) => [
      item.date,
      item.type,
      item.amount,
      item.category || '',
      item.memo || '',
    ]),
  ]

  // 시트 생성
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  const detailSheet = XLSX.utils.aoa_to_sheet(detailData)

  // 컬럼 너비 설정
  summarySheet['!cols'] = [{ wch: 15 }, { wch: 25 }]
  detailSheet['!cols'] = [
    { wch: 12 }, // 일자
    { wch: 8 },  // 유형
    { wch: 15 }, // 금액
    { wch: 15 }, // 카테고리
    { wch: 30 }, // 메모
  ]

  // 시트 추가
  XLSX.utils.book_append_sheet(wb, summarySheet, '요약')
  XLSX.utils.book_append_sheet(wb, detailSheet, '상세내역')

  // 파일명 생성 (Finance-YYYY-MM-DD.xlsx)
  const today = new Date()
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const filename = `Finance-${dateStr}.xlsx`

  // 파일 다운로드
  XLSX.writeFile(wb, filename)
}

