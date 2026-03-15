'use client'

import Link from 'next/link'
import { Box, Typography } from '@mui/material'
import Card from '../components/ui/Card'
import RecentTransactionsTable, { Transaction } from '../components/features/dashboard/RecentTransactionsTable'

interface DashboardRecentTransactionsProps {
  transactions: Transaction[]
  isTablet: boolean
}

export default function DashboardRecentTransactions({ transactions, isTablet }: DashboardRecentTransactionsProps) {
  return (
    <Card sx={{ p: { xs: 2, md: isTablet ? 1.5 : 2 } }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: { xs: 1.5, md: isTablet ? 1 : 1.5 }, mb: { xs: 1.5, md: isTablet ? 1 : 1.5 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 1, sm: 0 } }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          최근 거래 내역
        </Typography>
        <Box component={Link} href="/finance" aria-label="최근 거래 내역 전체보기" sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' }, color: '#64748B', textDecoration: 'none', minHeight: '44px', minWidth: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: { xs: '0.75rem', sm: '0.5rem' } }}>
          전체보기 →
        </Box>
      </Box>
      <RecentTransactionsTable transactions={transactions} />
    </Card>
  )
}
