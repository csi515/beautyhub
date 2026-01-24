'use client'

import { Typography, Box, Stack, useTheme, useMediaQuery } from '@mui/material'
import Badge from '../ui/Badge'
import { DataTable } from '../ui/DataTable'

export type Transaction = {
  id: string
  type: 'income' | 'expense'
  date: string
  amount: number
  memo?: string
}

interface RecentTransactionsTableProps {
  transactions: Transaction[]
}

export default function RecentTransactionsTable({ transactions }: RecentTransactionsTableProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (transactions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        거래 내역이 없습니다.
      </Typography>
    )
  }

  if (isMobile) {
    return (
      <Stack spacing={1} sx={{ mt: 1 }}>
        {transactions.map((t) => {
          const isExpense = t.type === 'expense'
          return (
            <Box
              key={t.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 1,
                py: 1.5,
                px: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Badge tone={isExpense ? 'danger' : 'success'}>{isExpense ? '지출' : '수입'}</Badge>
                <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
                  {t.memo || '-'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {String(t.date || '').slice(0, 16).replace('T', ' ')}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                fontWeight={700}
                color={isExpense ? 'error.main' : 'success.main'}
                sx={{ flexShrink: 0 }}
              >
                {isExpense ? '-' : '+'}₩{Number(t.amount || 0).toLocaleString()}
              </Typography>
            </Box>
          )
        })}
      </Stack>
    )
  }

  return (
    <DataTable
      columns={[
        {
          key: 'type',
          header: '구분',
          width: 100,
          render: (t) => {
            const isExpense = t.type === 'expense'
            return (
              <Badge tone={isExpense ? 'danger' : 'success'}>{isExpense ? '지출' : '수입'}</Badge>
            )
          },
        },
        {
          key: 'memo',
          header: '설명 / 메모',
          render: (t) => t.memo || '-',
        },
        {
          key: 'date',
          header: '날짜',
          width: 180,
          render: (t) => String(t.date || '').slice(0, 16).replace('T', ' '),
        },
        {
          key: 'amount',
          header: '금액',
          align: 'right',
          width: 140,
          render: (t) => {
            const isExpense = t.type === 'expense'
            return (
              <Typography
                variant="body2"
                fontWeight={700}
                color={isExpense ? 'error.main' : 'success.main'}
              >
                {isExpense ? '-' : '+'}₩{Number(t.amount || 0).toLocaleString()}
              </Typography>
            )
          },
        },
      ]}
      data={transactions}
      emptyMessage="거래 내역이 없습니다."
    />
  )
}
