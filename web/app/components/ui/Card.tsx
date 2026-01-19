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
        p: compact ? 2.5 : 3, // p-5 : p-6 (20px : 24px)
        borderRadius: 3, // rounded-xl (12px)
        border: `1px solid ${theme.palette.divider}`, // border-neutral-200
        boxShadow: 'var(--shadow-card)',
        transition: 'all 200ms ease-out',
        cursor: isClickable ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': hover && isClickable ? {
          boxShadow: 'var(--shadow-card-hover)',
          borderColor: theme.palette.primary.light,
          transform: 'translateY(-2px)',
        } : {},
        '&:active': isClickable ? {
          transform: 'scale(0.99) translateY(0)',
          boxShadow: 'var(--shadow-sm)',
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
