'use client'

import { TrendingUp, TrendingDown, Plus } from 'lucide-react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Pagination
} from '@mui/material'
import Button from '@/app/components/ui/Button'
import { CardSkeleton } from '@/app/components/ui/SkeletonLoader'
import EmptyState from '@/app/components/ui/EmptyState'
import { FinanceCombinedRow } from '@/types/finance'
import { formatCurrency } from '@/app/lib/utils/format'

interface FinanceMobileCardsProps {
  loading: boolean
  pagedCombined: FinanceCombinedRow[]
  combined: FinanceCombinedRow[]
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onItemClick: (row: FinanceCombinedRow) => void
  onCreateNew?: () => void
}

export default function FinanceMobileCards({
  loading,
  pagedCombined,
  combined,
  page,
  pageSize,
  onPageChange,
  onItemClick,
  onCreateNew
}: FinanceMobileCardsProps) {
  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography fontWeight="bold">수입/지출 내역</Typography>
        {onCreateNew && (
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreateNew}>
            수입/지출 입력
          </Button>
        )}
      </Box>
      {loading && <CardSkeleton count={4} />}
      {!loading && pagedCombined.length === 0 && (
        <EmptyState
          title="데이터가 없습니다."
          description="수입 또는 지출 내역을 추가해보세요."
          {...(onCreateNew && { actionLabel: "수입/지출 추가", onAction: onCreateNew })}
        />
      )}
      {!loading && (
        <Grid container spacing={1.5}>
          {pagedCombined.map(row => (
            <Grid item xs={12} sm={6} key={`${row.type}-${row.id}`}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  height: '100%'
                }}
                onClick={() => onItemClick(row)}
              >
                <CardContent sx={{ pb: 1.5, px: 2, pt: 1.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Chip
                      label={row.type === 'income' ? '수입' : '지출'}
                      size="small"
                      color={row.type === 'income' ? 'success' : 'error'}
                      variant="filled"
                      sx={{ fontSize: '0.75rem', height: 24 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {row.date}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{
                      color: row.type === 'income' ? '#059669' : '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      lineHeight: 1.2
                    }}
                  >
                    {row.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {row.type === 'income' ? '+' : '-'}{formatCurrency(row.amount)}
                  </Typography>
                  {row.note && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {row.note}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {/* 페이지네이션 */}
      {!loading && combined.length > 0 && (
        <Stack direction="row" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(combined.length / pageSize)}
            page={page}
            onChange={(_, p) => onPageChange(p)}
            color="primary"
            size="small"
            siblingCount={0}
          />
        </Stack>
      )}
    </Box>
  )
}
