'use client'

import SummaryCard, { type SummaryCardItem } from '@/app/components/common/SummaryCard'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/app/lib/utils/format'

interface FinanceSummaryCardsProps {
  sumIncome: number
  sumExpense: number
  profit: number
}

export default function FinanceSummaryCards({
  sumIncome,
  sumExpense,
  profit
}: FinanceSummaryCardsProps) {
  const items: SummaryCardItem[] = [
    {
      label: '월간 수입',
      value: sumIncome,
      icon: TrendingUp,
      color: 'success',
      formatValue: (value) => formatCurrency(value)
    },
    {
      label: '월간 지출',
      value: sumExpense,
      icon: TrendingDown,
      color: 'error',
      formatValue: (value) => formatCurrency(value)
    },
    {
      label: '월간 순이익',
      value: profit,
      icon: DollarSign,
      color: profit >= 0 ? 'success' : 'error',
      formatValue: (value) => formatCurrency(value)
    }
  ]

  return <SummaryCard items={items} columns={{ xs: 4, sm: 4 }} />
}
