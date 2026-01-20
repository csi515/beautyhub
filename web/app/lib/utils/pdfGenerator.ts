/**
 * PDF 생성 유틸리티
 * 텍스트 기반 PDF 생성 (jsPDF 대신 클라이언트 측 PDF 생성)
 */

/**
 * 간단한 PDF 생성 (브라우저 인쇄 기능 활용)
 * 실제 PDF 라이브러리는 필요 시 추가 설치 필요
 */
export function generatePDFFromHTML(html: string, filename: string): void {
  if (typeof window === 'undefined') return

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    console.error('팝업이 차단되었습니다.')
    return
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          @media print {
            @page { margin: 20mm; }
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
          }
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  
  // 인쇄 대화상자 열기
  setTimeout(() => {
    printWindow.print()
    // PDF로 저장 옵션 제공 (브라우저 기능)
  }, 250)
}

/**
 * 재무 리포트 HTML 생성
 */
export function generateFinancialReportHTML(data: {
  title: string
  period: string
  revenue: number
  expenses: number
  profit: number
  vat: number
  details?: Array<{ category: string; amount: number }>
}): string {
  const { title, period, revenue, expenses, profit, vat, details = [] } = data

  let detailsHTML = ''
  if (details.length > 0) {
    detailsHTML = `
      <h3>상세 내역</h3>
      <table>
        <thead>
          <tr>
            <th>카테고리</th>
            <th>금액</th>
          </tr>
        </thead>
        <tbody>
          ${details.map((d) => `<tr><td>${d.category}</td><td>${d.amount.toLocaleString()}원</td></tr>`).join('')}
        </tbody>
      </table>
    `
  }

  return `
    <div class="header">
      <h1>${title}</h1>
      <p>기간: ${period}</p>
      <p>작성일: ${new Date().toLocaleDateString('ko-KR')}</p>
    </div>

    <div class="summary">
      <h2>요약</h2>
      <table>
        <tr>
          <th>매출</th>
          <td>${revenue.toLocaleString()}원</td>
        </tr>
        <tr>
          <th>지출</th>
          <td>${expenses.toLocaleString()}원</td>
        </tr>
        <tr>
          <th>순이익</th>
          <td><strong>${profit.toLocaleString()}원</strong></td>
        </tr>
        <tr>
          <th>부가세 (10%)</th>
          <td>${vat.toLocaleString()}원</td>
        </tr>
      </table>
    </div>

    ${detailsHTML}
  `
}
