/**
 * Payroll 페이지 컨트롤러
 * /payroll 접근 시 /staff?tab=payroll로 리다이렉트 (급여는 직원 페이지 탭으로 통합)
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PayrollPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/staff?tab=payroll')
  }, [router])
  return null
}
