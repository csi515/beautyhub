'use client'

import React from 'react'
import MuiTable from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { alpha, useTheme } from '@mui/material/styles'

type Props = {
  children: React.ReactNode
  className?: string
}

export default function Table({ children, className }: Props) {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, ...((className) as any) }}>
      <MuiTable sx={{ minWidth: 650 }} aria-label="simple table">
        {children}
      </MuiTable>
    </TableContainer>
  )
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <TableHead sx={{ bgcolor: 'neutral.50' }}>
      {children}
    </TableHead>
  )
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <TableBody>{children}</TableBody>
}

export function TR({
  children,
  onClick,
  clickable,
  selected,
  onSelect,
}: {
  children: React.ReactNode
  onClick?: () => void
  clickable?: boolean
  selected?: boolean
  onSelect?: () => void
}) {
  const isClickable = clickable || !!onClick || !!onSelect
  const theme = useTheme()

  const handleClick = () => {
    onSelect?.()
    onClick?.()
  }

  return (
    <TableRow
      hover={!!isClickable}
      onClick={isClickable ? handleClick : undefined}
      selected={!!selected}
      sx={{
        cursor: isClickable ? 'pointer' : 'default',
        '&.Mui-selected': {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.12),
          }
        }
      }}
    >
      {children}
    </TableRow>
  )
}

export function TH({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <TableCell
      component="th"
      variant="head"
      sx={{ fontWeight: 600, color: 'text.secondary' }}
      className={className}
    >
      {children}
    </TableCell>
  )
}

export function TD({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <TableCell className={className} sx={{ color: 'text.primary' }}>
      {children}
    </TableCell>
  )
}
