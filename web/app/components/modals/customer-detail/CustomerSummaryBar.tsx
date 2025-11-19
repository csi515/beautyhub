'use client'

type CustomerSummaryBarProps = {
  name: string
  phone?: string | null
  email?: string | null
  pointsBalance: number
  holdingsCount: number
}

export default function CustomerSummaryBar({
  name,
  phone,
  email,
  pointsBalance,
  holdingsCount
}: CustomerSummaryBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-sm border-2 border-neutral-500 bg-white px-4 sm:px-5 py-3 sm:py-4 shadow-lg">
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-semibold text-neutral-900">{name}</div>
        <div className="mt-1 text-sm text-neutral-600">
          {phone || '-'}{email ? ` · ${email}` : ''}
        </div>
      </div>
      <div className="flex items-center gap-4 sm:gap-6 text-sm w-full sm:w-auto justify-between sm:justify-end">
        <div className="text-center">
          <div className="text-xs text-neutral-600 mb-1">포인트</div>
          <div className="text-lg font-bold text-[#1D4ED8]">
            {pointsBalance.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-neutral-600 mb-1">보유 상품</div>
          <div className="text-lg font-bold text-neutral-900">{holdingsCount}개</div>
        </div>
      </div>
    </div>
  )
}

