import type { Transaction } from '@/types/entities'

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { createSupabaseServerClient } = await import('@/lib/supabase/server')
  const supabase = createSupabaseServerClient()
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
              <span className="text-gray-500">₩{Number(t.amount || 0).toLocaleString()}</span>
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
