/**
 * 필터 Bottom Sheet 상태 관리 훅
 * 
 * @deprecated useFilters를 사용하세요. 이 훅의 기능은 useFilters에 통합되었습니다.
 * 
 * @example
 * // Before
 * const filterSheet = useFilterSheet({ filters, onFiltersChange })
 * 
 * // After
 * const filters = useFilters(initialFilters, { onFilterChange })
 * // filters.sheetOpen, filters.openSheet, filters.closeSheet 사용
 */
export function useFilterSheet(
  _options: any
) {
  throw new Error('useFilterSheet is deprecated. Use useFilters instead.')
}
