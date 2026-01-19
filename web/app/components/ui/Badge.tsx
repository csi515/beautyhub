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
        borderRadius: 'var(--radius-full)',
        fontWeight: 600,
        height: 24,
        fontSize: '0.75rem',
        padding: '0 0.625rem',
        boxShadow: 'var(--shadow-xs)',
        transition: 'all 0.15s ease-out',
        '&:hover': {
          transform: 'scale(1.05)',
        },
        ...(tone === 'neutral' && {
          bgcolor: 'var(--neutral-100)',
          color: 'var(--neutral-700)',
          border: '1px solid',
          borderColor: 'var(--neutral-200)',
        })
      }}
    />
  )
}
