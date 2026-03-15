'use client'

import { lazy, Suspense } from 'react'
import { Skeleton } from '@/app/components/ui/Skeleton'

// Recharts를 동적 import하여 번들 크기 감소
const MonthlyChart = lazy(() => import('recharts').then(async recharts => {
  const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } = recharts
  const { formatCurrency } = await import('@/app/lib/utils/format')
  
  return {
    default: function MonthlyChartComponent({ data }: { data: { name: string; income: number; expense: number }[] }) {
      const formatValue = (value: number) => {
        if (typeof value !== 'number') return String(value)
        return formatCurrency(value)
      }

      return (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--brand-100)" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatValue} />
              <Tooltip formatter={(value) => formatValue(value as number)} />
              <Legend />
              <Bar dataKey="income" fill="var(--brand-500)" name="수입" />
              <Bar dataKey="expense" fill="var(--brand-300)" name="지출" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )
    }
  }
}))

type Item = { name: string; income: number; expense: number }

export default function Monthly({ data }: { data: Item[] }) {
  return (
    <Suspense fallback={<div className="h-72 w-full flex items-center justify-center"><Skeleton className="h-full w-full" /></div>}>
      <MonthlyChart data={data} />
    </Suspense>
  )
}
