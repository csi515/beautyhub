'use client'

import { Stack, Paper, Typography, Grid, TextField, InputAdornment, FormControl, Select, MenuItem, IconButton } from '@mui/material'
import { ArrowUp, ArrowDown } from 'lucide-react'
import Button from '../ui/Button'

type Props = {
  statusFilter: 'all' | 'active' | 'inactive'
  onStatusFilterChange: (value: 'all' | 'active' | 'inactive') => void
  minPrice: string
  onMinPriceChange: (value: string) => void
  maxPrice: string
  onMaxPriceChange: (value: string) => void
  hasActiveFilters: boolean
  onReset: () => void
  // 정렬 (선택적)
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
  toggleSort?: (key: string) => void
  // 필터 초기화 숨김 (모바일 시트에서 중복 제거용)
  hideReset?: boolean
}

export default function ProductFilters({
  statusFilter,
  onStatusFilterChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  hasActiveFilters,
  onReset,
  sortKey,
  sortDirection,
  toggleSort,
  hideReset = false,
}: Props) {
  const handleSortKeyChange = (key: string) => {
    if (toggleSort) {
      // 다른 키면 새 키로 설정 (기본 오름차순)
      if (sortKey !== key) {
        toggleSort(key)
      }
    }
  }
  
  const handleSortDirectionToggle = () => {
    if (toggleSort && sortKey) {
      // 같은 키로 toggleSort 호출하면 방향 토글됨
      toggleSort(sortKey)
    }
  }

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2" fontWeight={600}>필터</Typography>
        
        {/* 정렬 UI (선택적) */}
        {sortKey !== undefined && sortDirection !== undefined && toggleSort && (
          <Grid container spacing={{ xs: 1, sm: 1.5 }} alignItems="center">
            <Grid item xs={12} sm={6}>
              <FormControl size="small" fullWidth>
                <Select
                  value={sortKey}
                  onChange={(e) => handleSortKeyChange(e.target.value)}
                  sx={{
                    minHeight: { xs: '44px', sm: 'auto' },
                    '& .MuiSelect-select': {
                      fontSize: { xs: '16px', sm: '14px' },
                    },
                  }}
                >
                  <MenuItem value="name" sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>이름순</MenuItem>
                  <MenuItem value="price" sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>가격순</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <IconButton
                onClick={handleSortDirectionToggle}
                sx={{
                  minWidth: '44px',
                  minHeight: '44px',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
                aria-label={sortDirection === 'asc' ? '오름차순' : '내림차순'}
              >
                {sortDirection === 'asc' ? (
                  <ArrowUp size={20} />
                ) : (
                  <ArrowDown size={20} />
                )}
              </IconButton>
            </Grid>
          </Grid>
        )}
        
        <Grid container spacing={{ xs: 0.75, sm: 1.5, md: 2 }} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl size="small" fullWidth>
              <Select
                value={statusFilter}
                onChange={e => onStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
                displayEmpty
                sx={{
                  minHeight: { xs: '44px', sm: 'auto' },
                  '& .MuiSelect-select': {
                    fontSize: { xs: '16px', sm: '14px' },
                  },
                }}
              >
                <MenuItem value="all" sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>전체 상태</MenuItem>
                <MenuItem value="active" sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>활성</MenuItem>
                <MenuItem value="inactive" sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>비활성</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              placeholder="최소 가격"
              type="number"
              size="small"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              fullWidth
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                style: { fontSize: '16px' },
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">₩</InputAdornment>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: { xs: '44px', sm: 'auto' },
                  fontSize: { xs: '16px', sm: '14px' },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              placeholder="최대 가격"
              type="number"
              size="small"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              fullWidth
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                style: { fontSize: '16px' },
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">₩</InputAdornment>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: { xs: '44px', sm: 'auto' },
                  fontSize: { xs: '16px', sm: '14px' },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            {!hideReset && (
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                {hasActiveFilters && (
                  <Button variant="ghost" onClick={onReset} size="sm" sx={{ minHeight: { xs: '44px', sm: 'auto' } }}>
                    필터 초기화
                  </Button>
                )}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  )
}
