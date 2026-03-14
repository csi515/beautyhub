'use client'

import { Box } from '@mui/material'
import { Skeleton } from '../ui/Skeleton'

type LoadingStateProps = {
  rows?: number
  columns?: number
  variant?: 'table' | 'card' | 'list'
  className?: string
}

/**
 * 로딩 상태 컴포넌트
 * 다양한 레이아웃에 맞는 스켈레톤 UI 제공
 */
export default function LoadingState({
  rows = 5,
  columns = 3,
  variant = 'list',
  className = '',
}: LoadingStateProps) {
  if (variant === 'table') {
    return (
      <Box className={className} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} sx={{ flex: 1, height: 20 }} />
            ))}
          </Box>
        ))}
      </Box>
    )
  }

  if (variant === 'card') {
    return (
      <Box
        className={className}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <Box
            key={i}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              p: { xs: 2, sm: 2.5 },
            }}
          >
            <Skeleton width="50%" height={24} sx={{ mb: 1.5 }} />
            <Skeleton width="75%" height={20} sx={{ mb: 1 }} />
            <Skeleton width="50%" height={20} />
          </Box>
        ))}
      </Box>
    )
  }

  // list variant (default)
  return (
    <Box className={className} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Box
          key={i}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            p: 2,
          }}
        >
          <Skeleton width="33%" height={24} sx={{ mb: 1 }} />
          <Skeleton width="100%" height={20} sx={{ mb: 0.5 }} />
          <Skeleton width="66%" height={20} />
        </Box>
      ))}
    </Box>
  )
}

