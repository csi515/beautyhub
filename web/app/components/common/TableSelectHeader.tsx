'use client'

import { Checkbox, TableCell } from '@mui/material'

interface TableSelectHeaderProps {
  selectedCount: number
  totalCount: number
  onSelectPage: () => void // 현재 페이지의 모든 항목 선택
  onDeselectAll: () => void // 전체 선택 해제
  disabled?: boolean
}

/**
 * 테이블 선택 헤더 컴포넌트
 * 전체 선택/해제 및 페이지 선택 기능 제공
 */
export default function TableSelectHeader({
  selectedCount,
  totalCount,
  onSelectPage,
  onDeselectAll,
  disabled = false,
}: TableSelectHeaderProps) {
  const isAllSelected = selectedCount === totalCount && totalCount > 0
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // 체크박스 클릭 시 현재 페이지 선택
      onSelectPage()
    } else {
      // 체크박스 해제 시 전체 해제
      onDeselectAll()
    }
  }

  return (
    <TableCell padding="checkbox">
      <Checkbox
        checked={isAllSelected}
        indeterminate={isIndeterminate}
        onChange={handleChange}
        disabled={disabled || totalCount === 0}
        inputProps={{
          'aria-label': isAllSelected ? '전체 선택 해제' : '페이지 선택',
        }}
      />
    </TableCell>
  )
}
