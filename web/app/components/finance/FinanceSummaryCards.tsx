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
    { label: '기간 내 수입', value: sumIncome, color: 'success' },
    { label: '기간 내 지출', value: sumExpense, color: 'error' },
    { label: '기간 내 순이익', value: profit, color: profit >= 0 ? 'success' : 'error' },
  ]

  return <StatCardsGrid cards={cards} spacing={1} columns={{ xs: 4, sm: 4 }} />
}
