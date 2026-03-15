import * as XLSX from 'xlsx'

/**
 * 여러 시트를 포함한 Excel 파일로 내보내기
 */
export function exportToExcelMultiSheet(
    sheets: { name: string; data: Record<string, unknown>[] }[],
    filename: string
) {
    const wb = XLSX.utils.book_new()
    for (const { name, data } of sheets) {
        if (data.length === 0) continue
        const headers = Object.keys(data[0]!)
        const rows = data.map(row => headers.map(h => row[h] ?? ''))
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
        XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31))
    }
    if (wb.SheetNames.length > 0) {
        XLSX.writeFile(wb, filename)
    }
}

/**
 * 배열 데이터를 Excel(.xlsx) 파일로 내보내기
 */
export function exportToExcel(data: Record<string, unknown>[], filename: string) {
    if (data.length === 0) return
    const baseName = filename.replace(/\.(csv|xlsx)$/i, '')
    const xlsxFilename = `${baseName}.xlsx`
    const headers = Object.keys(data[0]!)
    const rows = data.map(row => headers.map(h => row[h] ?? ''))
    const sheetData = [headers, ...rows]
    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, xlsxFilename)
}

/** @deprecated CSV 대신 exportToExcel 사용 */
export function exportToCSV(data: Record<string, unknown>[], filename: string) {
    if (data.length === 0) {
        return
    }

    // Get headers from first object
    const first = data[0]
    if (!first) return
    const headers = Object.keys(first)

    // Create CSV content
    const csvContent = [
        // Header row
        headers.join(','),
        // Data rows
        ...data.map(row =>
            headers.map(header => {
                const value = row[header]
                // Escape values containing commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`
                }
                return value ?? ''
            }).join(',')
        )
    ].join('\n')

    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

export function prepareInventoryDataForExport(products: { name: string; stock_count?: number; safety_stock?: number; inventory_status?: string; price?: number }[]) {
    return products.map(product => ({
        '상품명': product.name,
        '현재 재고': product.stock_count ?? 0,
        '안전 재고': product.safety_stock ?? 5,
        '재고 상태': product.inventory_status === 'out_of_stock' ? '품절'
            : product.inventory_status === 'low_stock' ? '재고 부족'
                : '정상',
        '가격': product.price ?? 0,
    }))
}

export function prepareCustomerDataForExport(customers: { name: string; phone?: string | null; email?: string | null; address?: string | null; created_at?: string }[]) {
    return customers.map(customer => ({
        '이름': customer.name,
        '전화번호': customer.phone || '-',
        '이메일': customer.email || '-',
        '주소': customer.address || '-',
        '등록일': customer.created_at ? new Date(customer.created_at).toLocaleDateString('ko-KR') : '-',
    }))
}

export function prepareProductDataForExport(products: { name: string; price?: number; description?: string | null; active?: boolean; stock_count?: number; created_at?: string }[]) {
    return products.map(product => ({
        '상품명': product.name,
        '가격': product.price ?? 0,
        '설명': product.description || '-',
        '상태': product.active ? '활성' : '비활성',
        '재고': product.stock_count ?? '-',
        '등록일': product.created_at ? new Date(product.created_at).toLocaleDateString('ko-KR') : '-',
    }))
}
