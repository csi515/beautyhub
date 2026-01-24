'use client'

import { useState } from 'react'
import { Search, Download, Plus, Filter } from 'lucide-react'
import { Paper, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import Button from '../ui/Button'
import { useExportVisibility } from '@/app/lib/hooks/useExportVisibility'
import { BottomSheet } from '../ui/BottomSheet'
import { type CustomerFilters } from '@/types/customer'

interface CustomerFiltersProps {
  query: string
  onQueryChange: (query: string) => void
  filters: CustomerFilters
  onFiltersChange: (filters: Partial<CustomerFilters>) => void
  onResetFilters: () => void
  onExport: () => void
  onCreateCustomer: () => void
  filteredCount: number
  totalCount: number
}

export default function CustomerFilters({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  onResetFilters,
  onExport,
  onCreateCustomer,
  filteredCount,
  totalCount
}: CustomerFiltersProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { showExport } = useExportVisibility()
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // 활성 필터 개수 계산
  const activeFilterCount = [
    filters.statusFilter !== 'all',
    filters.vipFilter !== 'all',
    filters.minPoints !== '',
    filters.maxPoints !== '',
  ].filter(Boolean).length

  const FilterContent = () => (
    <Stack spacing={3} sx={{ p: { xs: 2, md: 0 } }}>
      <FormControl fullWidth size="small">
        <InputLabel>상태</InputLabel>
        <Select
          value={filters.statusFilter}
          onChange={(e) => onFiltersChange({ statusFilter: e.target.value as any })}
          label="상태"
        >
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="active">활성</MenuItem>
          <MenuItem value="inactive">비활성</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>VIP 등급</InputLabel>
        <Select
          value={filters.vipFilter}
          onChange={(e) => onFiltersChange({ vipFilter: e.target.value as any })}
          label="VIP 등급"
        >
          <MenuItem value="all">전체</MenuItem>
          <MenuItem value="vip">VIP (1000P 이상)</MenuItem>
          <MenuItem value="normal">일반</MenuItem>
        </Select>
      </FormControl>

      <Stack direction="row" spacing={2}>
        <TextField
          label="최소 포인트"
          type="number"
          size="small"
          value={filters.minPoints}
          onChange={(e) => onFiltersChange({ minPoints: e.target.value })}
          fullWidth
        />
        <TextField
          label="최대 포인트"
          type="number"
          size="small"
          value={filters.maxPoints}
          onChange={(e) => onFiltersChange({ maxPoints: e.target.value })}
          fullWidth
        />
      </Stack>

      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="ghost"
          onClick={() => {
            onResetFilters()
            if (isMobile) setFilterSheetOpen(false)
          }}
          size="sm"
          fullWidth
        >
          초기화
        </Button>
        {isMobile && (
          <Button
            variant="primary"
            onClick={() => setFilterSheetOpen(false)}
            size="sm"
            fullWidth
          >
            적용
          </Button>
        )}
      </Stack>

      {/* 필터 상태 표시 */}
      {activeFilterCount > 0 && (
        <Chip
          label={`${filteredCount}/${totalCount}명 표시`}
          size="small"
          color="info"
          variant="outlined"
          sx={{ alignSelf: 'center' }}
        />
      )}
    </Stack>
  )

  return (
    <>
      <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0} variant="outlined">
        <Stack spacing={3}>
          {/* 검색 및 기본 액션 */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <TextField
              placeholder="이름, 이메일 또는 전화번호로 검색"
              value={query}
              onChange={e => onQueryChange(e.target.value ?? '')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const input = e.target as HTMLInputElement
                  input.blur()
                }
              }}
              size="small"
              fullWidth
              sx={{
                maxWidth: { sm: 400 },
                '& .MuiOutlinedInput-root': {
                  fontSize: { xs: '16px', md: '14px' },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <Search className="h-4 w-4 text-neutral-400" />
                  ),
                },
              }}
              inputProps={{
                type: 'search',
                autoComplete: 'off',
                autoCorrect: 'off',
                autoCapitalize: 'off',
                enterKeyHint: 'search',
              }}
            />
            <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              {/* 모바일: 필터 버튼 */}
              {isMobile && (
                <Button
                  variant="secondary"
                  leftIcon={<Filter className="h-4 w-4" />}
                  onClick={() => setFilterSheetOpen(true)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  필터 {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
              )}
              {showExport && (
                <Button
                  variant="secondary"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={onExport}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  CSV 내보내기
                </Button>
              )}
              <Button
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={onCreateCustomer}
                fullWidth={isMobile}
                sx={{ whiteSpace: 'nowrap' }}
              >
                새 고객
              </Button>
            </Stack>
          </Stack>

          {/* 데스크톱 인라인 필터 */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              필터:
            </Typography>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>상태</InputLabel>
              <Select
                value={filters.statusFilter}
                onChange={(e) => onFiltersChange({ statusFilter: e.target.value as any })}
                label="상태"
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="active">활성</MenuItem>
                <MenuItem value="inactive">비활성</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>VIP 등급</InputLabel>
              <Select
                value={filters.vipFilter}
                onChange={(e) => onFiltersChange({ vipFilter: e.target.value as any })}
                label="VIP 등급"
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="vip">VIP (1000P 이상)</MenuItem>
                <MenuItem value="normal">일반</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="최소 포인트"
              type="number"
              size="small"
              value={filters.minPoints}
              onChange={(e) => onFiltersChange({ minPoints: e.target.value })}
              sx={{ width: 120 }}
            />

            <TextField
              label="최대 포인트"
              type="number"
              size="small"
              value={filters.maxPoints}
              onChange={(e) => onFiltersChange({ maxPoints: e.target.value })}
              sx={{ width: 120 }}
            />

            {activeFilterCount > 0 && (
              <>
                <Button
                  variant="ghost"
                  onClick={onResetFilters}
                  size="sm"
                  sx={{ ml: 1 }}
                >
                  초기화
                </Button>
                <Chip
                  label={`${filteredCount}/${totalCount}명 표시`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              </>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* 모바일 필터 BottomSheet */}
      {isMobile && (
        <BottomSheet
          open={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          title="필터"
          description="고객 목록을 필터링하세요"
          maxHeight={80}
        >
          <FilterContent />
        </BottomSheet>
      )}
    </>
  )
}
