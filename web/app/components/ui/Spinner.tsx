'use client'

import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

type Props = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  color?: 'primary' | 'secondary' | 'inherit' | 'success' | 'error' | 'info' | 'warning'
}

export default function Spinner({ size = 'md', className, color = 'primary' }: Props) {
  const sizeMap = {
    sm: 20,
    md: 32,
    lg: 48,
  }

  return (
    <Box
      className={className}
      sx={{
        display: 'inline-flex',
        verticalAlign: 'middle',
        '& .MuiCircularProgress-root': {
          animation: 'spin 0.8s linear infinite',
        },
        '@keyframes spin': {
          from: {
            transform: 'rotate(0deg)',
          },
          to: {
            transform: 'rotate(360deg)',
          },
        },
      }}
      role="status"
      aria-label="로딩 중"
    >
      <CircularProgress
        size={sizeMap[size]}
        color={color}
        thickness={4}
        sx={{
          transition: 'opacity 0.2s ease-out',
        }}
      />
    </Box>
  )
}
