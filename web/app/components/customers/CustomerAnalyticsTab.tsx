'use client'

import { useEffect, useState } from 'react'
import AnalyticsPageView from '@/app/components/analytics/AnalyticsPageView'
import { useAppToast } from '@/app/lib/ui/toast'
import { AnalyticsService, type CustomerLTV, type VIPCustomer } from '@/app/lib/services/analytics.service'
import { exportToCSV } from '@/app/lib/utils/export'

/**
 * 고객 페이지 내 고객 분석 탭 콘텐츠
 * LTV/VIP fetch + AnalyticsPageView(embedded)
 */
export default function CustomerAnalyticsTab() {
  const [ltvData, setLtvData] = useState<CustomerLTV[]>([])
  const [vipData, setVipData] = useState<VIPCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const toast = useAppToast()

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const [ltvRes, vipRes] = await Promise.all([
          fetch('/api/analytics/customer-ltv'),
          fetch('/api/analytics/vip-customers'),
        ])
        if (cancelled) return
        if (!ltvRes.ok || !vipRes.ok) throw new Error('데이터를 불러오는데 실패했습니다')
        const ltv = await ltvRes.json()
        const vip = await vipRes.json()
        setLtvData(ltv)
        setVipData(vip)
      } catch (e) {
        if (cancelled) return
        console.error(e)
        const msg = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다'
        setError(msg)
        toast.error('데이터를 불러오는데 실패했습니다')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [toast])

  const stats = AnalyticsService.calculateLTVStats(ltvData)
  const chartData = AnalyticsService.prepareLTVChartData(ltvData, 10)

  const handleExport = () => {
    const data = AnalyticsService.prepareLTVForExport(ltvData)
    exportToCSV(data, `고객LTV분석_${new Date().toISOString().slice(0, 10)}.csv`)
    toast.success('분석 리포트가 다운로드되었습니다')
  }

  return (
    <AnalyticsPageView
      embedded
      ltvData={ltvData}
      vipData={vipData}
      loading={loading}
      error={error}
      stats={stats}
      chartData={chartData}
      onExport={handleExport}
    />
  )
}
