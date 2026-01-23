/**
 * Finance 페이지 View 컴포넌트
 * 순수 UI만 담당, 모든 로직은 props로 받음
 */

'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useTheme, useMediaQuery } from '@mui/material'
import FinanceSummaryCards from './FinanceSummaryCards'
import FinanceFilters from './FinanceFilters'
import FinanceMobileCards from './FinanceMobileCards'
import FinanceDesktopTable from './FinanceDesktopTable'
import StandardPageLayout from '../common/StandardPageLayout'
import FilterBottomSheet from '../common/FilterBottomSheet'
import MobileFAB from '../common/MobileFAB'
import PageHeader from '../common/PageHeader'
import Button from '../ui/Button'
import { FileText, Download } from 'lucide-react'
import { IconButton } from '@mui/material'
import { usePageHeader } from '@/app/lib/contexts/PageHeaderContext'
import type { FinanceCombinedRow, FinanceDateRange, FinanceFilters as FinanceFiltersType } from '@/types/finance'

export interface FinancePageViewProps {
  // 데이터
  loading: boolean
  error: string | undefined
  
  // 날짜 범위
  dateRange: FinanceDateRange
  onUpdateRange: (range: { from?: string; to?: string }) => void
  
  // 필터
  filters: FinanceFiltersType
  onUpdateFilters: (filters: Partial<FinanceFiltersType>) => void
  onToggleSort: (key: 'date' | 'amount') => void
  
  // 페이지네이션
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  
  // 데이터 (가공된)
  combined: FinanceCombinedRow[]
  pagedCombined: FinanceCombinedRow[]
  sumIncome: number
  sumExpense: number
  profit: number
  
  // 액션
  onCreateNew: () => void
  onItemClick: (row: FinanceCombinedRow) => void
  onExportExcel: () => void
  onGenerateTaxReport: () => void
}

export default function FinancePageView({
  loading,
  error,
  dateRange,
  onUpdateRange,
  filters,
  onUpdateFilters,
  onToggleSort,
  page,
  pageSize,
  onPageChange,
  combined,
  pagedCombined,
  sumIncome,
  sumExpense,
  profit,
  onCreateNew,
  onItemClick,
  onExportExcel,
  onGenerateTaxReport,
}: FinancePageViewProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { setHeaderInfo, clearHeaderInfo } = usePageHeader()
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // 활성 필터 개수 계산
  const activeFilterCount = filters.filterType.length < 2 ? 1 : 0

  // 모바일에서 Context에 헤더 정보 설정
  useEffect(() => {
    if (isMobile) {
      setHeaderInfo({
        title: '재무 관리',
        onFilter: () => setFilterSheetOpen(true),
        filterBadge: activeFilterCount,
        actions: (
          <IconButton onClick={onExportExcel} sx={{ minWidth: '44px', minHeight: '44px' }}>
            <Download size={20} />
          </IconButton>
        ),
      })
    } else {
      clearHeaderInfo()
    }

    return () => {
      if (isMobile) {
        clearHeaderInfo()
      }
    }
  }, [isMobile, setHeaderInfo, clearHeaderInfo, activeFilterCount, onExportExcel])

  // 필터 콘텐츠
  const filterContent = (
    <FinanceFilters
      dateRange={dateRange}
      onUpdateRange={onUpdateRange}
      filterType={filters.filterType}
      onFilterTypeChange={(types) => onUpdateFilters({ filterType: types })}
      showFilters={true} // Bottom Sheet 내부에서는 항상 표시
      onToggleShowFilters={() => {}} // 사용 안 함
      onCreateNew={onCreateNew}
      onExportExcel={onExportExcel}
    />
  )

  return (
    <StandardPageLayout
      loading={loading}
      error={error || undefined}
      errorTitle="재무 데이터를 불러오는 중 오류가 발생했습니다"
      maxWidth={{ xs: '100%', md: '1200px' }}
    >
      {/* 데스크탑 헤더 */}
        {!isMobile && (
          <PageHeader
            title="재무 관리"
            useMUI
            actions={[
              <Button
                key="tax-report"
                variant="outline"
                size="sm"
                leftIcon={<FileText className="h-4 w-4" />}
                onClick={onGenerateTaxReport}
              >
                세무 자료 생성
              </Button>,
              <Button
                key="export"
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={onExportExcel}
              >
                엑셀로 내보내기
              </Button>,
            ]}
          />
        )}

        {/* 요약 카드 */}
        <FinanceSummaryCards
          sumIncome={sumIncome}
          sumExpense={sumExpense}
          profit={profit}
        />

        {/* 필터 및 기간 - 데스크탑만 표시 */}
        {!isMobile && filterContent}

        {/* 모바일 필터 Bottom Sheet */}
        {isMobile && (
          <FilterBottomSheet
            open={filterSheetOpen}
            onClose={() => setFilterSheetOpen(false)}
            title="필터"
            description="재무 데이터를 필터링하세요"
            activeFilterCount={activeFilterCount}
            onReset={() => {
              onUpdateFilters({ filterType: ['income', 'expense'] })
            }}
          >
            {filterContent}
          </FilterBottomSheet>
        )}

        {/* 모바일 카드 뷰 */}
        <FinanceMobileCards
          loading={loading}
          pagedCombined={pagedCombined}
          combined={combined}
          page={page}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onItemClick={onItemClick}
        />

        {/* 데스크톱 테이블 뷰 */}
        <FinanceDesktopTable
          loading={loading}
          pagedCombined={pagedCombined}
          combined={combined}
          sortKey={filters.sortKey}
          sortDir={filters.sortDir}
          page={page}
          pageSize={pageSize}
          onSortToggle={onToggleSort}
          onPageChange={onPageChange}
          onItemClick={onItemClick}
        />


        {/* Mobile FAB */}
        <MobileFAB
          icon={<Plus />}
          label="새 수입/지출 추가"
          onClick={onCreateNew}
        />
    </StandardPageLayout>
  )
}
