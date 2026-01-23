'use client'

import { Stack, FormControl, Select, MenuItem, Pagination as MuiPagination } from '@mui/material'
import { useAppToast } from '../../lib/ui/toast'
import { useResponsivePaginationSize } from '../../lib/hooks/useResponsivePaginationSize'
import BulkActionBar from '../common/BulkActionBar'
import PaginationInfo from '../common/PaginationInfo'

interface CustomerPaginationProps {
  loading: boolean
  filteredCount: number
  page: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  selectedCustomerIds: string[]
  onClearSelection: () => void
}

export default function CustomerPagination({
  loading,
  filteredCount,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  selectedCustomerIds,
  onClearSelection
}: CustomerPaginationProps) {
  const toast = useAppToast()
  const paginationSize = useResponsivePaginationSize()

  const handleBulkAction = () => {
    // TODO: 일괄 상태 변경 기능 구현
    toast.info('일괄 상태 변경 기능은 곧 추가됩니다')
  }

  if (loading || filteredCount === 0) return null

  return (
    <>
      {/* 선택된 고객 표시 및 일괄 작업 */}
      <BulkActionBar
        selectedCount={selectedCustomerIds.length}
        selectedLabel="명의 고객이 선택되었습니다"
        variant="inline"
        onClearSelection={onClearSelection}
        actions={[
          {
            label: '상태 변경',
            onClick: handleBulkAction,
            variant: 'primary',
          },
        ]}
      />

      {/* 페이지네이션 */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 2 }} justifyContent="space-between" alignItems="center">
        <PaginationInfo
          totalItems={filteredCount}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          format="pages"
          itemLabel="명"
        />
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={{ xs: 2, sm: 2 }} 
          alignItems="center"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <FormControl size="small" sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { xs: '100%', sm: 100 } }}>
            <Select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              sx={{ 
                minWidth: { xs: '100%', sm: 100 }, 
                bgcolor: 'background.paper',
                minHeight: { xs: '44px', sm: 'auto' }
              }}
            >
              <MenuItem value={10}>10개씩</MenuItem>
              <MenuItem value={20}>20개씩</MenuItem>
              <MenuItem value={50}>50개씩</MenuItem>
            </Select>
          </FormControl>
          <MuiPagination
            count={totalPages}
            page={page}
            onChange={(_, p) => onPageChange(p)}
            color="primary"
            shape="rounded"
            size={paginationSize}
            siblingCount={0}
            boundaryCount={1}
            showFirstButton={false}
            showLastButton={false}
            sx={{
              '& .MuiPagination-ul': {
                flexWrap: 'wrap',
                justifyContent: 'center',
              },
              '& .MuiPaginationItem-root': {
                minWidth: { xs: '44px', sm: '44px' },
                minHeight: { xs: '44px', sm: '44px' },
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              },
            }}
          />
        </Stack>
      </Stack>
    </>
  )
}
