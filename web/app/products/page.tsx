/**
 * Products 페이지
 * useSearchParams 사용 구간을 Suspense로 감싸 프리렌더 경고 방지
 */

import { Suspense } from 'react'
import ProductsPageClient from './ProductsPageClient'
import LoadingState from '@/app/components/common/LoadingState'

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingState rows={5} variant="card" />}>
      <ProductsPageClient />
    </Suspense>
  )
}
