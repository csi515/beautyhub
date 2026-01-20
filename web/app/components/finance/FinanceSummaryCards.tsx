'use client'

import { StatCardsGrid, type StatCardData } from '../common/StatCard'

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
  const cards: StatCardData[] = [
    {
      label: '월간 수입',
      value: sumIncome,
      color: 'success',
    },
    {
      label: '월간 지출',
      value: sumExpense,
      color: 'error',
    },
    {
      label: '월간 순이익',
      value: profit,
      color: profit >= 0 ? 'success' : 'error',
    },
  ]

  return <StatCardsGrid cards={cards} spacing={1} columns={{ xs: 4, sm: 4 }} />
}
