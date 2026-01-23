/**
 * Analytics 페이지 컨트롤러
 * 인증 확인, 파라미터 결정, 데이터 로딩 결정, View에 props 전달만 담당
 */

'use client'

import { useEffect, useState } from 'react'
import AnalyticsPageView from '../components/analytics/AnalyticsPageView'
import { useAppToast } from '../lib/ui/toast'
import { AnalyticsService, type CustomerLTV, type VIPCustomer } from '../lib/services/analytics.service'
import { exportToCSV } from '../lib/utils/export'

export default function AnalyticsPage() {
    const [ltvData, setLtvData] = useState<CustomerLTV[]>([])
    const [vipData, setVipData] = useState<VIPCustomer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const toast = useAppToast()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            setLoading(true)
            const [ltvResponse, vipResponse] = await Promise.all([
                fetch('/api/analytics/customer-ltv'),
                fetch('/api/analytics/vip-customers')
            ])

            if (!ltvResponse.ok || !vipResponse.ok) {
                throw new Error('데이터를 불러오는데 실패했습니다')
            }

            const ltv = await ltvResponse.json()
            const vip = await vipResponse.json()

            setLtvData(ltv)
            setVipData(vip)
        } catch (err) {
            console.error(err)
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
            toast.error('데이터를 불러오는데 실패했습니다')
        } finally {
            setLoading(false)
        }
    }

    // Service 레이어를 사용한 통계 계산 및 데이터 변환
    const stats = AnalyticsService.calculateLTVStats(ltvData)
    const chartData = AnalyticsService.prepareLTVChartData(ltvData, 10)

    const handleExport = () => {
        const dataToExport = AnalyticsService.prepareLTVForExport(ltvData)
        exportToCSV(dataToExport, `고객LTV분석_${new Date().toISOString().slice(0, 10)}.csv`)
        toast.success('분석 리포트가 다운로드되었습니다')
    }

    return (
        <AnalyticsPageView
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
