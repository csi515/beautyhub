'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { Pencil } from 'lucide-react'
import { type FinancialSettings } from '@/types/settings'

type Props = {
    data: FinancialSettings
    onEdit: () => void
}

export default function FinancialSettingsSummaryCard({ data, onEdit }: Props) {
    return (
        <Card>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-neutral-900">재무 및 정산 설정</h3>
                    <p className="text-sm text-neutral-600 mt-1">수입 및 지출 항목 관리</p>
                </div>
                <Button variant="outline" size="sm" onClick={onEdit} leftIcon={<Pencil className="h-4 w-4" />}>
                    편집
                </Button>
            </div>

            <div className="space-y-3">
                {/* 수입 항목 */}
                <div>
                    <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">수입 항목</div>
                    {data.incomeCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {data.incomeCategories.map((category) => (
                                <span
                                    key={category}
                                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-sm"
                                >
                                    {category}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-400 italic">등록된 수입 항목이 없습니다</p>
                    )}
                </div>

                {/* 지출 항목 */}
                <div>
                    <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">지출 항목</div>
                    {data.expenseCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {data.expenseCategories.map((category) => (
                                <span
                                    key={category}
                                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm"
                                >
                                    {category}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-400 italic">등록된 지출 항목이 없습니다</p>
                    )}
                </div>
            </div>
        </Card>
    )
}
