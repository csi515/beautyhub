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
    <Box className={className} sx={{ display: 'inline-flex', verticalAlign: 'middle' }}>
      <CircularProgress
        size={sizeMap[size]}
        color={color}
        thickness={4}
      />
    </Box>
  )
}
