'use client'

import { Box, Grid, Card, CardContent } from '@mui/material'
import { Skeleton } from '../ui/Skeleton'

type LoadingStateProps = {
  rows?: number
  columns?: number
  variant?: 'table' | 'card' | 'list'
  className?: string
}

/**
 * 로딩 상태 컴포넌트 (통합)
 * 다양한 레이아웃에 맞는 스켈레톤 UI 제공
 * SkeletonLoader의 기능을 통합
 */
export default function LoadingState({
  rows = 5,
  columns = 3,
  variant = 'list',
  className = '',
}: LoadingStateProps) {
  if (variant === 'table') {
    return (
      <Box className={className}>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
        {Array.from({ length: rows }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} variant="rectangular" height={30} width={`${100 / columns}%`} />
            ))}
          </Box>
        ))}
      </Box>
    )
  }

  if (variant === 'card') {
    return (
      <Grid 
        container 
        spacing={{ xs: 0.75, sm: 1.5, md: 2 }} 
        className={className}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 1 }} />
                <Skeleton variant="text" width="40%" height={20} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  // list variant (default)
  return (
    <Box className={className}>
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Box sx={{ width: '100%' }}>
            <Skeleton width="40%" height={24} />
            <Skeleton width="80%" height={20} />
          </Box>
        </Box>
      ))}
    </Box>
  )
}

/**
 * @deprecated Use LoadingState with variant="list" instead
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return <LoadingState variant="list" rows={count} />
}

/**
 * @deprecated Use LoadingState with variant="card" instead
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return <LoadingState variant="card" rows={count} />
}

/**
 * @deprecated Use LoadingState with variant="table" instead
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return <LoadingState variant="table" rows={rows} columns={cols} />
}
