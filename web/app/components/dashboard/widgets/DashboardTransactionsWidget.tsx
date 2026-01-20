'use client'

import { useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import Link from 'next/link'
import Card from '../../ui/Card'
import RecentTransactionsTable, { Transaction } from '../RecentTransactionsTable'

interface DashboardTransactionsWidgetProps {
  recentTransactions: Transaction[]
}

export default function DashboardTransactionsWidget({ recentTransactions }: DashboardTransactionsWidgetProps) {
  const slicedTransactions = useMemo(
    () => recentTransactions?.slice(0, 10) || [],
    [recentTransactions]
  )

  return (
    <Card>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 2.5, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 1, sm: 0 } }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          최근 거래 내역
        </Typography>
        <Box
          component={Link}
          href="/finance"
          aria-label="최근 거래 내역 전체보기"
          sx={{
            fontSize: { xs: '0.875rem', sm: '0.875rem' },
            color: '#64748B',
            textDecoration: 'none',
            minHeight: '44px',
            minWidth: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: { xs: '0.75rem', sm: '0.5rem' }
          }}
        >
          전체보기 →
        </Box>
      </Box>
      <RecentTransactionsTable transactions={slicedTransactions} />
    </Card>
  )
}
