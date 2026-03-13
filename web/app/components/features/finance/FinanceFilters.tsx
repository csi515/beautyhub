'use client'

import { Download } from 'lucide-react'
import {
  Box,
  Stack,
  TextField,
  Typography,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material'
import Button from '@/app/components/ui/Button'
import FilterCard from '@/app/components/common/FilterCard'

interface FinanceFiltersProps {
  dateRange: { from: string; to: string }
  onUpdateRange: (range: { from?: string; to?: string }) => void
  filterType: ('income' | 'expense')[]
  onFilterTypeChange: (types: ('income' | 'expense')[]) => void
  showFilters: boolean
  onToggleShowFilters: () => void
  onExportExcel: () => void
  onGenerateTaxReport?: () => void
}

export default function FinanceFilters({
  dateRange,
  onUpdateRange,
  filterType,
  onFilterTypeChange,
  showFilters,
  onToggleShowFilters,
  onExportExcel,
  onGenerateTaxReport
}: FinanceFiltersProps) {
  return (
    <FilterCard>
      {/* 모바일용 세로 배치 버튼들 */}
        <Stack spacing={1} sx={{ display: { xs: 'flex', md: 'none' } }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleShowFilters}
              sx={{ flex: 1 }}
            >
              {showFilters ? '숨기기' : '필터'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={onExportExcel}
              sx={{ flex: 1, fontSize: '0.875rem', display: { xs: 'none', lg: 'inline-flex' } }}
            >
              엑셀
            </Button>
          </Box>
      </Stack>
      <Box sx={{ display: { xs: showFilters ? 'block' : 'none', md: 'block' } }}>
        <Stack spacing={1}>
            {/* 기간: 이번달/지난달/3개월 버튼 + 시작일~종료일 */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              flexWrap="wrap"
              useFlexGap
            >
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const now = new Date()
                    const start = new Date(now.getFullYear(), now.getMonth(), 1)
                    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                    onUpdateRange({
                      from: start.toISOString().split('T')[0]!,
                      to: end.toISOString().split('T')[0]!
                    })
                  }}
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 0.5, px: 1 }}
                >
                  이번달
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const now = new Date()
                    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                    const end = new Date(now.getFullYear(), now.getMonth(), 0)
                    onUpdateRange({
                      from: start.toISOString().split('T')[0]!,
                      to: end.toISOString().split('T')[0]!
                    })
                  }}
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 0.5, px: 1 }}
                >
                  지난달
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const now = new Date()
                    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
                    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                    onUpdateRange({
                      from: start.toISOString().split('T')[0]!,
                      to: end.toISOString().split('T')[0]!
                    })
                  }}
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 0.5, px: 1 }}
                >
                  3개월
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' }, minWidth: 0 }}>
                <TextField
                  type="date"
                  label="시작일"
                  size="small"
                  value={dateRange.from}
                  onChange={e => onUpdateRange({ from: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 120 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>~</Typography>
                <TextField
                  type="date"
                  label="종료일"
                  size="small"
                  value={dateRange.to}
                  onChange={e => onUpdateRange({ to: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 120 }}
                />
              </Stack>
              <ToggleButtonGroup
                value={filterType}
                onChange={(_, newFilters) => onFilterTypeChange(newFilters as ('income' | 'expense')[])}
                size="small"
                color="primary"
                sx={{ flexShrink: 0 }}
              >
                <ToggleButton value="income">수입</ToggleButton>
                <ToggleButton value="expense">지출</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {/* 액션 버튼 */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="flex-end">
              <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' }, display: { xs: 'none', lg: 'flex' } }}>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={onExportExcel}
                >
                  엑셀
                </Button>
                {onGenerateTaxReport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onGenerateTaxReport}
                  >
                    세무 리포트
                  </Button>
                )}
              </Stack>
            </Stack>
        </Stack>
      </Box>
    </FilterCard>
  )
}
