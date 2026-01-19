/**
 * 내보내기 유틸리티 (레거시 호환성)
 * @deprecated 각 기능별 파일로 분할되었습니다. 직접 import하세요.
 * - csvExport.ts: exportToCSV
 * - dataFormatters.ts: prepare* 함수들
 */

export { exportToCSV } from './csvExport'
export {
  prepareInventoryDataForExport,
  prepareCustomerDataForExport,
  prepareProductDataForExport,
  preparePayrollDataForExport,
} from './dataFormatters'
