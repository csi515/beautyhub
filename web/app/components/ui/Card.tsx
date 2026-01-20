'use client'

import type { ReactNode, MouseEvent } from 'react'
import Paper from '@mui/material/Paper'
import { useTheme, Theme, SxProps } from '@mui/material/styles'

type Props = {
  children: ReactNode
  className?: string
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
  clickable?: boolean
  hover?: boolean
  divider?: boolean
  compact?: boolean
  sx?: SxProps<Theme>
}

export default function Card({
  children,
  className = '',
  onClick,
  clickable = false,
  hover = true,
  divider = false,
  compact = false,
  sx = {},
}: Props) {
  const isClickable = clickable || !!onClick
  const theme = useTheme()

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      className={className}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick?.(e as unknown as MouseEvent<HTMLDivElement>)
        }
      }}
      sx={{
        p: compact ? { xs: 2, sm: 2.5 } : { xs: 2.5, sm: 3 }, // 모바일에서 패딩 축소
        borderRadius: 3, // rounded-xl (12px)
        border: `1px solid ${theme.palette.divider}`, // border-neutral-200
        boxShadow: 'var(--shadow-card)',
        transition: 'all 200ms ease-out',
        cursor: isClickable ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        touchAction: isClickable ? 'manipulation' : 'auto',
        WebkitTapHighlightColor: 'transparent',
        '&:hover': hover && isClickable ? {
          boxShadow: { xs: 'var(--shadow-card)', md: 'var(--shadow-card-hover)' },
          borderColor: { xs: theme.palette.divider, md: theme.palette.primary.light },
          transform: { xs: 'none', md: 'translateY(-2px)' },
        } : {},
        '&:active': isClickable ? {
          transform: { xs: 'scale(0.98)', md: 'scale(0.99) translateY(0)' },
          boxShadow: { xs: 'var(--shadow-sm)', md: 'var(--shadow-sm)' },
        } : {},
        '&:focus-visible': isClickable ? {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
          boxShadow: 'var(--shadow-card-hover)',
        } : {},
        ...(divider && {
          '& > :not(style) ~ :not(style)': {
            borderTop: `1px solid ${theme.palette.divider}`,
          }
        }),
        ...(sx as any)
      }}
    >
      {children}
    </Paper>
  )
}
