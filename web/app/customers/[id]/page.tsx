import type { Transaction } from '@/types/entities'
import { formatCurrency } from '@/app/lib/utils/format'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { createSupabaseServerClient } = await import('@/lib/supabase/server')
  const supabase = await createSupabaseServerClient()
  const [{ data: customer }, { data: transactions }] = await Promise.all([
    supabase.from('customers').select('*').eq('id', params.id).single(),
    supabase.from('transactions').select('*').eq('customer_id', params.id).order('transaction_date', { ascending: false })
  ])

  // 포인트/상품권 API가 없다면 섹션만 자리표시
  const pointsBalance = 0
  const vouchersCount = 0
  const history: Transaction[] = Array.isArray(transactions) ? transactions : []

  return (
    <main className="p-6 space-y-6">
      <Link
        href="/customers"
        className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 mb-2 -mt-1"
        style={{ minHeight: 44, minWidth: 44, alignItems: 'center' }}
        aria-label="고객 목록으로 돌아가기"
      >
        <ChevronLeft size={20} />
        <span className="sm:hidden">뒤로</span>
        <span className="hidden sm:inline">고객 목록</span>
      </Link>
      <h1 className="text-2xl font-bold">고객 상세</h1>

      <section className="bg-white rounded-md border p-4">
        <div className="font-medium">{customer?.name}</div>
        <div className="text-sm text-gray-600">{customer?.phone || '-'} {customer?.email ? `· ${customer.email}` : ''}</div>
      </section>

      <section className="bg-white rounded-md border">
        <div className="p-4 border-b font-medium">구매 이력</div>
        <ul className="divide-y">
          {history.map((t) => (
            <li key={t.id} className="p-4 text-sm flex items-center justify-between">
              <span>거래 {t.id}</span>
              <span className="text-gray-500">{formatCurrency(t.amount || 0)}</span>
            </li>
          ))}
          {history.length === 0 && <li className="p-4 text-sm text-gray-500">데이터가 없습니다.</li>}
        </ul>
      </section>

      <section className="bg-white rounded-md border">
        <div className="p-4 border-b font-medium">포인트</div>
        <div className="p-4 text-sm text-gray-600">잔액: {pointsBalance}p</div>
      </section>

      <section className="bg-white rounded-md border">
        <div className="p-4 border-b font-medium">상품권</div>
        <div className="p-4 text-sm text-gray-600">보유 상품권 수: {vouchersCount}</div>
      </section>
    </main>
  )
}
