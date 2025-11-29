'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { Pencil, Store, Phone, MapPin } from 'lucide-react'
import { type BusinessProfile } from '@/types/settings'

type Props = {
    data: BusinessProfile
    onEdit: () => void
}

export default function BusinessProfileSummaryCard({ data, onEdit }: Props) {
    const hasBasicInfo = data.storeName || data.phone || data.address

    return (
        <Card>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-neutral-900">가게 기본 정보</h3>
                    <p className="text-sm text-neutral-600 mt-1">상호명, 주소, 영업시간</p>
                </div>
                <Button variant="outline" size="sm" onClick={onEdit} leftIcon={<Pencil className="h-4 w-4" />}>
                    편집
                </Button>
            </div>

            {hasBasicInfo ? (
                <div className="space-y-3">
                    {data.storeName && (
                        <div className="flex items-start gap-3">
                            <Store className="h-5 w-5 text-neutral-500 mt-0.5" />
                            <div>
                                <div className="text-xs font-semibold text-neutral-500 uppercase">상호명</div>
                                <div className="text-base font-medium text-neutral-900">{data.storeName}</div>
                            </div>
                        </div>
                    )}

                    {data.phone && (
                        <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-neutral-500 mt-0.5" />
                            <div>
                                <div className="text-xs font-semibold text-neutral-500 uppercase">전화번호</div>
                                <div className="text-base font-medium text-neutral-900">{data.phone}</div>
                            </div>
                        </div>
                    )}

                    {data.address && (
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-neutral-500 mt-0.5" />
                            <div>
                                <div className="text-xs font-semibold text-neutral-500 uppercase">주소</div>
                                <div className="text-base text-neutral-900">{data.address}</div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-sm text-neutral-400 italic">기본 정보를 등록하세요</p>
            )}
        </Card>
    )
}
