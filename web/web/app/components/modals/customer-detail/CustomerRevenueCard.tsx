'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp } from 'lucide-react'
import { transactionsApi } from '@/app/lib/api/transactions'
import type { Transaction } from '@/types/entities'

type CustomerRevenueCardProps = {
  customerId: string
}

/**
 * 고객별 매출 요약 카드 컴포넌트
 */
export default function CustomerRevenueCard({ customerId }: CustomerRevenueCardProps) {
  const [revenue, setRevenue] = useState<{
    total: number
    thisMonth: number
    lastMonth: number
    count: number
  }>({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    count: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRevenue = async () => {
      if (!customerId) return
      try {
        setLoading(true)
        const transactions = await transactionsApi.list({ limit: 1000 })
        const allTxs: Transaction[] = Array.isArray(transactions) ? transactions : []
        const customerTxs = allTxs.filter((t) => t.customer_id === customerId)

        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1)

        const total = customerTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0)
        const thisMonth = customerTxs
          .filter((t) => {
            const date = new Date(t.transaction_date || t.created_at || '')
            return date >= thisMonthStart
          })
          .reduce((sum, t) => sum + Number(t.amount || 0), 0)
        const lastMonth = customerTxs
          .filter((t) => {
            const date = new Date(t.transaction_date || t.created_at || '')
            return date >= lastMonthStart && date < lastMonthEnd
          })
          .reduce((sum, t) => sum + Number(t.amount || 0), 0)

        setRevenue({
          total,
          thisMonth,
          lastMonth,
          count: customerTxs.length,
        })
      } catch (error) {
        console.error('매출 조회 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRevenue()
  }, [customerId])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border-2 border-blue-200 p-4 animate-pulse">
        <div className="h-4 bg-blue-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-blue-200 rounded w-32"></div>
      </div>
    )
  }

  const trend = revenue.lastMonth > 0 
    ? ((revenue.thisMonth - revenue.lastMonth) / revenue.lastMonth * 100).toFixed(1)
    : revenue.thisMonth > 0 ? '100' : '0'

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border-2 border-blue-200 p-4 shadow-md">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-blue-900">고객 매출 요약</h3>
        </div>
        {Number(trend) !== 0 && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            Number(trend) > 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            <TrendingUp className={`h-3 w-3 ${Number(trend) < 0 ? 'rotate-180' : ''}`} />
            {Number(trend) > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-blue-700">총 매출</span>
          <span className="text-lg font-bold text-blue-900">₩{revenue.total.toLocaleString()}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-blue-700">이번 달</span>
          <span className="text-base font-semibold text-blue-800">₩{revenue.thisMonth.toLocaleString()}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-blue-700">거래 횟수</span>
          <span className="text-sm font-medium text-blue-700">{revenue.count}회</span>
        </div>
      </div>
    </div>
  )
}

