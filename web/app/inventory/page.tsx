/**
 * Inventory 페이지
 * /inventory 접근 시 /products?tab=inventory로 리다이렉트 (재고는 제품 페이지 탭으로 통합)
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function InventoryPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/products?tab=inventory')
  }, [router])
  return null
}
