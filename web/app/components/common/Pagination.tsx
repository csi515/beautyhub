import { ChevronLeft, ChevronRight } from 'lucide-react'
import MuiPagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import PaginationInfo from './PaginationInfo'

type PaginationProps = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
  showInfo?: boolean
}

/**
 * 통합 페이지네이션 컴포넌트
 * MUI Pagination 및 Select 사용
 */
export default function Pagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = '',
  showInfo = true,
}: PaginationProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-neutral-200 bg-neutral-50 ${className}`}>
      {/* 정보 표시 */}
      {showInfo && (
        <PaginationInfo
          totalItems={totalItems}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          format="detailed"
          itemLabel="개"
        />
      )}

      {/* 컨트롤 */}
      <div className="flex items-center gap-4">
        {/* 페이지 크기 선택 */}
        {onPageSizeChange && (
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

