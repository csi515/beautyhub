'use client'

import { useState } from 'react'
import { Stack, Typography, FormControl, Select, MenuItem, Pagination, Paper } from '@mui/material'
import Button from '@/app/components/ui/Button'
import { useAppToast } from '@/app/lib/ui/toast'
import BulkStatusModal from './BulkStatusModal'

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
  onRefresh?: () => void
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
  onClearSelection,
  onRefresh,
}: CustomerPaginationProps) {
  const toast = useAppToast()
  const [bulkModalOpen, setBulkModalOpen] = useState(false)

  const handleBulkStatusConfirm = async (active: boolean) => {
    const res = await fetch('/api/customers/bulk-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ids: selectedCustomerIds, active }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.message ?? '일괄 상태 변경에 실패했습니다.')
    }
    const { updated } = await res.json()
    toast.success(`${updated}명의 고객이 ${active ? '활성' : '비활성'}으로 변경되었습니다.`)
    onClearSelection()
    onRefresh?.()
  }

  if (loading || filteredCount === 0) return null

  return (
    <>
      {/* 선택된 고객 표시 및 일괄 작업 */}
      {selectedCustomerIds.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'primary.light', border: '1px solid', borderColor: 'primary.main' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="nowrap" sx={{ minWidth: 0, overflow: 'auto' }}>
            <Typography variant="body1" fontWeight={600} color="primary.dark" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
              {selectedCustomerIds.length}명의 고객이 선택되었습니다
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="nowrap" sx={{ flexShrink: 0 }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setBulkModalOpen(true)}
                aria-label="일괄 상태 변경"
              >
                상태 변경
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearSelection}
              >
                선택 해제
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* 페이지네이션 */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          총 {filteredCount}명 · {page} / {totalPages} 페이지
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small">
            <Select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              sx={{ minWidth: 100, bgcolor: 'background.paper' }}
            >
              <MenuItem value={10}>10개씩</MenuItem>
              <MenuItem value={20}>20개씩</MenuItem>
              <MenuItem value={50}>50개씩</MenuItem>
            </Select>
          </FormControl>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => onPageChange(p)}
            color="primary"
            shape="rounded"
            size="medium"
            siblingCount={1}
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPagination-ul': {
                flexWrap: 'nowrap',
              },
            }}
          />
        </Stack>
      </Stack>

      <BulkStatusModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        selectedCount={selectedCustomerIds.length}
        onConfirm={handleBulkStatusConfirm}
      />
    </>
  )
}
