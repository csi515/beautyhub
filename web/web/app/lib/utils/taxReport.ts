import * as XLSX from 'xlsx'

export interface TaxReportData {
  period: { from: string; to: string }
  income: Array<{
    date: string
    amount: number
    customer?: string
    notes?: string
  }>
  expense: Array<{
    date: string
    amount: number
    category: string
    memo?: string
  }>
}

/**
 * 세무 자료 생성 (매입/매출 합산표)
 */
export function generateTaxReport(data: TaxReportData): void {
  const wb = XLSX.utils.book_new()

  // 매출 합산표
  const incomeSummary = [
    ['매출 합산표'],
    ['기간', `${data.period.from} ~ ${data.period.to}`],
    [''],
    ['일자', '금액', '고객', '비고'],
    ...data.income.map(item => [
      item.date,
      item.amount,
      item.customer || '',
      item.notes || '',
    ]),
    [''],
    ['합계', data.income.reduce((sum, item) => sum + item.amount, 0)],
  ]

  // 매입 합산표
  const expenseSummary = [
    ['매입 합산표'],
    ['기간', `${data.period.from} ~ ${data.period.to}`],
    [''],
    ['일자', '금액', '카테고리', '비고'],
    ...data.expense.map(item => [
      item.date,
      item.amount,
      item.category,
      item.memo || '',
    ]),
    [''],
    ['합계', data.expense.reduce((sum, item) => sum + item.amount, 0)],
  ]

  // 부가세 신고 대비표
  const vatReport = [
    ['부가세 신고 대비표'],
    ['기간', `${data.period.from} ~ ${data.period.to}`],
    [''],
    ['구분', '공급가액', '부가세', '합계'],
    [
      '매출',
      Math.floor(data.income.reduce((sum, item) => sum + item.amount, 0) / 1.1),
      Math.floor(data.income.reduce((sum, item) => sum + item.amount, 0) / 11),
      data.income.reduce((sum, item) => sum + item.amount, 0),
    ],
    [
      '매입',
      Math.floor(data.expense.reduce((sum, item) => sum + item.amount, 0) / 1.1),
      Math.floor(data.expense.reduce((sum, item) => sum + item.amount, 0) / 11),
      data.expense.reduce((sum, item) => sum + item.amount, 0),
    ],
    [''],
    [
      '납부할 세액',
      '',
      Math.floor(data.income.reduce((sum, item) => sum + item.amount, 0) / 11) - 
      Math.floor(data.expense.reduce((sum, item) => sum + item.amount, 0) / 11),
      '',
    ],
  ]

  // 시트 생성
  const incomeSheet = XLSX.utils.aoa_to_sheet(incomeSummary)
  const expenseSheet = XLSX.utils.aoa_to_sheet(expenseSummary)
  const vatSheet = XLSX.utils.aoa_to_sheet(vatReport)

  // 컬럼 너비 설정
  incomeSheet['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 30 }]
  expenseSheet['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 30 }]
  vatSheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }]

  // 시트 추가
  XLSX.utils.book_append_sheet(wb, incomeSheet, '매출')
  XLSX.utils.book_append_sheet(wb, expenseSheet, '매입')
  XLSX.utils.book_append_sheet(wb, vatSheet, '부가세신고')

  // 파일명 생성
  const today = new Date()
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const filename = `TaxReport-${dateStr}.xlsx`

  // 파일 다운로드
  XLSX.writeFile(wb, filename)
}

