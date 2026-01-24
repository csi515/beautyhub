'use client'

import { Stack, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import Button from '../ui/Button'
import { Search, Download, Plus } from 'lucide-react'

type Props = {
  query: string
  onQueryChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  onExport?: () => void
  onCreateClick?: () => void
  variant?: 'toolbar' | 'sheet'
  showExport?: boolean
  showCreate?: boolean
}

export default function AppointmentSearchFilters({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  onExport,
  onCreateClick,
  variant = 'toolbar',
  showExport = true,
  showCreate = true,
}: Props) {
  const isSheet = variant === 'sheet'
  return (
    <Stack
      direction={isSheet ? 'column' : 'row'}
      spacing={isSheet ? 2 : 1}
      alignItems={isSheet ? 'stretch' : 'center'}
    >
      <TextField
        placeholder="예약 검색"
        size="small"
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            ;(e.target as HTMLInputElement).blur()
          }
        }}
        sx={{ width: isSheet ? '100%' : { xs: '100%', sm: 200 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={16} />
            </InputAdornment>
          ),
        }}
        inputProps={{
          type: 'search',
          enterKeyHint: 'search',
        }}
      />
      <FormControl size="small" sx={{ width: isSheet ? '100%' : { xs: '100%', sm: 120 } }}>
        <InputLabel>상태</InputLabel>
        <Select
          value={statusFilter}
          onChange={e => onStatusFilterChange(e.target.value)}
          displayEmpty
          label="상태"
        >
          <MenuItem value="all">전체 상태</MenuItem>
          <MenuItem value="scheduled">예약됨</MenuItem>
          <MenuItem value="completed">완료</MenuItem>
          <MenuItem value="cancelled">취소</MenuItem>
        </Select>
      </FormControl>
      {showExport && onExport && (
        <Button
          variant="secondary"
          leftIcon={<Download size={16} />}
          onClick={onExport}
          sx={{ whiteSpace: 'nowrap' }}
        >
          내보내기
        </Button>
      )}
      {showCreate && onCreateClick && (
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus size={16} />}
          onClick={onCreateClick}
        >
          예약 추가
        </Button>
      )}
    </Stack>
  )
}
