/**
 * Analytics 페이지
 * /analytics 접근 시 /customers?tab=analytics로 리다이렉트 (고객 분석은 고객 페이지 탭으로 통합)
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AnalyticsPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/customers?tab=analytics')
  }, [router])
  return null
}
