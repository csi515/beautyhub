'use client'

import Chip from '@mui/material/Chip'

type Props = {
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
  children: React.ReactNode
  className?: string
}

export default function Badge({ tone = 'neutral', children, className = '' }: Props) {
  const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'default'> = {
    primary: 'primary',
    success: 'success',
    warning: 'warning',
    danger: 'error',
    neutral: 'default',
  }

  return (
    <Chip
      label={children}
      size="small"
      {...(colorMap[tone] ? { color: colorMap[tone] } : {})}
      variant="filled"
      {...(className ? { className } : {})}
      sx={{
        borderRadius: 3, // 12px
        fontWeight: 600,
        height: 24,
        fontSize: '0.75rem',
        ...(tone === 'neutral' && {
          bgcolor: 'neutral.100',
          color: 'neutral.700',
          border: '1px solid',
          borderColor: 'neutral.200',
        })
      }}
    />
  )
}
