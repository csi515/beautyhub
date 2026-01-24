'use client'

import { Stack, TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material'
import { Search } from 'lucide-react'

export interface StaffListFiltersState {
  query: string
  roleFilter: string
  activeFilter: 'all' | 'active' | 'inactive'
}

interface StaffListFiltersProps {
  filters: StaffListFiltersState
  onQueryChange: (value: string) => void
  onRoleFilterChange: (value: string) => void
  onActiveFilterChange: (value: 'all' | 'active' | 'inactive') => void
  roleOptions: string[]
}

export default function StaffListFilters({
  filters,
  onQueryChange,
  onRoleFilterChange,
  onActiveFilterChange,
  roleOptions,
}: StaffListFiltersProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 1.5, sm: 2 }}
      alignItems={{ sm: 'center' }}
      sx={{ mb: 2 }}
    >
      <TextField
        placeholder="직원명 검색"
        value={filters.query}
        onChange={(e) => onQueryChange(e.target.value)}
        size="small"
        sx={{
          flexGrow: 1,
          minWidth: { xs: '100%', sm: 200 },
          '& .MuiOutlinedInput-root': { minHeight: 40 },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} className="text-gray-400" />
            </InputAdornment>
          ),
        }}
      />
      <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
        <InputLabel>직급</InputLabel>
        <Select
          value={filters.roleFilter}
          label="직급"
          onChange={(e) => onRoleFilterChange(e.target.value)}
          sx={{ minHeight: 40 }}
        >
          <MenuItem value="all">전체</MenuItem>
          {roleOptions.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
        <InputLabel>재직 상태</InputLabel>
        <Select
          value={filters.activeFilter}
          label="재직 상태"
          onChange={(e) => onActiveFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
          sx={{ minHeight: 40 }}
        >
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="active">재직</MenuItem>
          <MenuItem value="inactive">퇴사</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  )
}
