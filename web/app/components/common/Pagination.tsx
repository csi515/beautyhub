'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import MuiPagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Box from '@mui/material/Box'

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
  showInfo?: boolean
  simple?: boolean
}

/**
 * 통합 페이지네이션 컴포넌트
 * MUI Pagination 및 Select 사용
 * 
 * @param simple - true일 경우 간단한 페이지네이션만 표시 (info 및 pageSize 선택 숨김)
 */
export default function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = '',
  showInfo = true,
  simple = false,
}: PaginationProps) {
  if (totalPages <= 1 && !simple) return null

  const showingFrom = totalItems && pageSize ? (totalItems === 0 ? 0 : (page - 1) * pageSize + 1) : undefined
  const showingTo = totalItems && pageSize ? Math.min(page * pageSize, totalItems) : undefined

  // 간단한 모드
  if (simple) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }} className={className}>
        <MuiPagination
          count={totalPages}
          page={page}
          onChange={(_, p) => onPageChange(p)}
          color="primary"
          shape="rounded"
          variant="text"
          size="medium"
          showFirstButton
          showLastButton
          sx={{
            '& .MuiPaginationItem-root': {
              borderRadius: 1.5,
              fontWeight: 600,
              transition: 'all 200ms ease-in-out',
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }
            }
          }}
        />
      </Box>
    )
  }

  // 전체 기능 모드
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-neutral-200 bg-neutral-50 ${className}`}>
      {/* 정보 표시 */}
      {showInfo && showingFrom !== undefined && showingTo !== undefined && (
        <div className="text-sm text-neutral-600">
          총 {totalItems!.toLocaleString()}개 · {showingFrom.toLocaleString()}-{showingTo.toLocaleString()} 표시
        </div>
      )}

      {/* 컨트롤 */}
      <div className="flex items-center gap-4">
        {/* 페이지 크기 선택 */}
        {onPageSizeChange && pageSize && (
          <FormControl size="small">
            <Select
              value={pageSize}
              onChange={(e: SelectChangeEvent<number>) => {
                onPageSizeChange(Number(e.target.value))
                onPageChange(1)
              }}
              displayEmpty
              inputProps={{ 'aria-label': '페이지당 항목 수' }}
              sx={{ minWidth: 100, bgcolor: 'background.paper' }}
            >
              {pageSizeOptions.map((size) => (
                <MenuItem key={size} value={size}>
                  {size} / 페이지
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* MUI 페이지네이션 */}
        <MuiPagination
          count={totalPages}
          page={page}
          onChange={(_, p) => onPageChange(p)}
          color="primary"
          shape="rounded"
          size="medium"
          showFirstButton
          showLastButton
          renderItem={(item) => (
            <PaginationItem
              slots={{ previous: ChevronLeft, next: ChevronRight }}
              color="primary"
              page={item.page}
              type={item.type}
              selected={item.selected}
              disabled={item.disabled}
              onClick={item.onClick}
            />
          )}
        />
      </div>
    </div>
  )
}
