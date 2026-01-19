'use client'

import MuiSkeleton from '@mui/material/Skeleton'
import type { SkeletonProps } from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

type Props = SkeletonProps & {
  className?: string // For compatibility
}

export function Skeleton({ className, animation = 'pulse', ...props }: Props) {
  return (
    <MuiSkeleton
      animation={animation}
      {...(className ? { className } : {})}
      sx={{
        borderRadius: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        '&::after': {
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
        },
        ...props.sx
      }}
      {...props}
    />
  )
}

export function CardSkeleton() {
  return (
    <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper' }}>
      <Box sx={{ mb: 2 }}>
        <Skeleton variant="text" sx={{ width: '40%', height: 28 }} />
      </Box>
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="rectangular" sx={{ width: '100%', height: 40, borderRadius: 1 }} />
      </Box>
      <Box>
        <Skeleton variant="rectangular" sx={{ width: '100%', height: 120, borderRadius: 1 }} />
      </Box>
    </Box>
  )
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          sx={{
            width: i === lines - 1 ? '75%' : '100%',
            height: 20
          }}
        />
      ))}
    </Box>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <Grid container spacing={2} key={rowIdx}>
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Grid xs={12 / cols} key={colIdx}>
              <Skeleton variant="rectangular" sx={{ height: 40, borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      ))}
    </Box>
  )
}

export default Skeleton


