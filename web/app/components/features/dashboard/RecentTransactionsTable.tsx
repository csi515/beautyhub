'use client'

import { Typography } from '@mui/material'
import { formatCurrency } from '@/app/lib/utils/format'
import { formatDateTimeShort } from '@/app/lib/utils/date'
import Badge from '@/app/components/ui/Badge'
import { DataTable } from '@/app/components/ui/DataTable'

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
                            <Badge tone={isExpense ? 'danger' : 'success'}>
                                {isExpense ? '지출' : '수입'}
                            </Badge>
                        )
                    }
                },
                {
                    key: 'memo',
                    header: '설명 / 메모',
                    render: (t) => t.memo || '-'
                },
                {
                    key: 'date',
                    header: '날짜',
                    width: 180,
                    render: (t) => formatDateTimeShort(String(t.date || ''))
                },
                {
                    key: 'amount',
                    header: '금액',
                    align: 'right',
                    width: 140,
                    render: (t) => {
                        const isExpense = t.type === 'expense'
                        return (
                            <Typography variant="body2" fontWeight={700} color={isExpense ? 'error.main' : 'success.main'}>
                                {isExpense ? '-' : '+'}{formatCurrency(t.amount || 0)}
                            </Typography>
                        )
                    }
                }
            ]}
            data={transactions}
            emptyMessage="거래 내역이 없습니다."
        />
    )
}
