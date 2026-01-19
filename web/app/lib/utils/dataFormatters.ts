/**
 * 데이터 포맷팅 유틸리티
 * 내보내기용 데이터 포맷팅
 */

/**
 * 재고 데이터를 내보내기 형식으로 변환
 */
export function prepareInventoryDataForExport(products: any[]) {
  return products.map(product => ({
    '제품명': product.name,
    '현재 재고': product.stock_count ?? 0,
    '안전 재고': product.safety_stock ?? 5,
    '재고 상태': product.inventory_status === 'out_of_stock' ? '품절'
      : product.inventory_status === 'low_stock' ? '재고 부족'
        : '정상',
    '가격': product.price ?? 0,
  }))
}

/**
 * 고객 데이터를 내보내기 형식으로 변환
 */
export function prepareCustomerDataForExport(customers: any[]) {
  return customers.map(customer => ({
    '이름': customer.name,
    '전화번호': customer.phone || '-',
    '이메일': customer.email || '-',
    '주소': customer.address || '-',
    '등록일': customer.created_at ? new Date(customer.created_at).toLocaleDateString('ko-KR') : '-',
  }))
}

/**
 * 제품 데이터를 내보내기 형식으로 변환
 */
export function prepareProductDataForExport(products: any[]) {
  return products.map(product => ({
    '제품명': product.name,
    '가격': product.price ?? 0,
    '설명': product.description || '-',
    '상태': product.active ? '활성' : '비활성',
    '재고': product.stock_count ?? '-',
    '등록일': product.created_at ? new Date(product.created_at).toLocaleDateString('ko-KR') : '-',
  }))
}

/**
 * 급여 데이터를 내보내기 형식으로 변환
 */
export function preparePayrollDataForExport(records: any[]) {
  return records.map(record => ({
    '직원명': record.staff_name || '-',
    '기본급': record.base_salary ?? 0,
    '보너스': record.bonus ?? 0,
    '공제액': record.deductions ?? 0,
    '실수령액': record.net_pay ?? 0,
    '지급일': record.payment_date ? new Date(record.payment_date).toLocaleDateString('ko-KR') : '-',
  }))
}
