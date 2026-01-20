'use client'

import { Stack, TextField, InputAdornment, FormControl, Select, MenuItem } from '@mui/material'
import Button from '../ui/Button'
import { Search, Download, Plus } from 'lucide-react'

type Props = {
  query: string
  onQueryChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  onExport: () => void
  onCreateClick: () => void
}

export default function AppointmentSearchFilters({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  onExport,
  onCreateClick,
}: Props) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <TextField
        placeholder="예약 검색"
        size="small"
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            const input = e.target as HTMLInputElement
            input.blur()
          }
        }}
        sx={{ width: 200 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment>
        }}
        inputProps={{
          type: 'search',
          enterKeyHint: 'search',
        }}
      />
      <FormControl size="small" sx={{ width: 120 }}>
        <Select
          value={statusFilter}
          onChange={e => onStatusFilterChange(e.target.value)}
          displayEmpty
        >
          <MenuItem value="all">전체 상태</MenuItem>
          <MenuItem value="scheduled">예약됨</MenuItem>
          <MenuItem value="completed">완료</MenuItem>
          <MenuItem value="cancelled">취소</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="secondary"
        leftIcon={<Download size={16} />}
        onClick={onExport}
        sx={{ whiteSpace: 'nowrap' }}
      >
        내보내기
      </Button>
      <Button
        variant="primary"
        size="md"
        leftIcon={<Plus size={16} />}
        onClick={onCreateClick}
      >
        예약 추가
      </Button>
    </Stack>
  )
}
