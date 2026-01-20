'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Pagination
} from '@mui/material'
import { Skeleton } from '../ui/Skeleton'
import EmptyState from '../EmptyState'
import StatusBadge from '../common/StatusBadge'
import { FinanceCombinedRow } from '@/types/finance'

// 금액 포맷팅 함수
const formatAmount = (amount: number): string => {
  if (amount >= 100000000) { // 1억 이상
    return `${(amount / 100000000).toFixed(1)}억`
  } else if (amount >= 10000) { // 1만 이상
    return `${(amount / 10000).toFixed(0)}만`
  }
  return amount.toLocaleString()
}

interface FinanceMobileCardsProps {
  loading: boolean
  pagedCombined: FinanceCombinedRow[]
  combined: FinanceCombinedRow[]
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onItemClick: (row: FinanceCombinedRow) => void
}

export default function FinanceMobileCards({
  loading,
  pagedCombined,
  combined,
  page,
  pageSize,
  onPageChange,
  onItemClick
}: FinanceMobileCardsProps) {
  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <Typography fontWeight="bold" mb={2}>수입/지출 내역</Typography>
      {loading && (
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={12} sm={6} key={i}>
              <Skeleton className="h-24 rounded-lg" />
            </Grid>
          ))}
        </Grid>
      )}
      {!loading && pagedCombined.length === 0 && (
        <EmptyState title="데이터가 없습니다." />
      )}
      {!loading && (
        <Grid container spacing={1.5}>
          {pagedCombined.map(row => (
            <Grid item xs={12} sm={6} key={`${row.type}-${row.id}`}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:active': {
                    transform: 'scale(0.98)',
                    boxShadow: 2,
                  },
                  '&:hover': { bgcolor: 'action.hover' },
                  height: '100%',
                  minHeight: { xs: '100px', sm: 'auto' }
                }}
                onClick={() => onItemClick(row)}
              >
                <CardContent sx={{ pb: { xs: 1.5, sm: 1.5 }, px: { xs: 2, sm: 2 }, pt: { xs: 1.5, sm: 1.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <StatusBadge
                      status={row.type as 'income' | 'expense'}
                      variant="filled"
                    />
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        flexShrink: 0,
                        ml: 1
                      }}
                    >
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
                      lineHeight: 1.2,
                      mb: row.memo ? 0.5 : 0
                    }}
                  >
                    {row.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    {row.type === 'income' ? '+' : '-'}₩{formatAmount(row.amount)}
                  </Typography>
                  {row.memo && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {row.memo}
                    </Typography>
                  )}
                  {row.category && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: '0.75rem',
                        mt: 0.5,
                        display: 'block'
                      }}
                    >
                      {row.category}
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
            boundaryCount={1}
            showFirstButton={false}
            showLastButton={false}
            sx={{
              '& .MuiPaginationItem-root': {
                minWidth: { xs: '36px', sm: '40px' },
                minHeight: { xs: '36px', sm: '40px' },
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              },
            }}
          />
        </Stack>
      )}
    </Box>
  )
}
