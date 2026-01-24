'use client'

import { Stack } from '@mui/material'
import FinanceTabNav from '../components/finance/FinanceTabNav'

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Stack spacing={0}>
      <FinanceTabNav />
      {children}
    </Stack>
  )
}
