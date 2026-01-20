'use client'

import { Stack, Paper, Typography, Grid, TextField, InputAdornment, FormControl, Select, MenuItem } from '@mui/material'
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
}: Props) {
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2" fontWeight={600}>필터</Typography>
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
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              {hasActiveFilters && (
                <Button variant="ghost" onClick={onReset} size="sm">
                  필터 초기화
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  )
}
