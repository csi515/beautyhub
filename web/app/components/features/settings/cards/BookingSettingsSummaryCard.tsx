'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { Pencil } from 'lucide-react'
import { type BookingSettings } from '@/types/settings'
import { DAY_LABELS } from '@/types/settings'

type Props = {
    data: BookingSettings
    onEdit: () => void
}

export default function BookingSettingsSummaryCard({ data, onEdit }: Props) {
    return (
        <Card>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-neutral-900">예약 및 스케줄 정책</h3>
                    <p className="text-sm text-neutral-600 mt-1">예약 시간 정책 및 리마인드 알림</p>
                </div>
                <Button variant="outline" size="sm" onClick={onEdit} leftIcon={<Pencil className="h-4 w-4" />}>
                    편집
                </Button>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">최소 예약 간격</div>
                        <div className="text-lg font-medium text-neutral-900">{data.minBookingInterval}분</div>
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-neutral-500 uppercase mb-1">최대 예약 시간</div>
                        <div className="text-lg font-medium text-neutral-900">{data.maxBookingHoursPerDay}시간/일</div>
                    </div>
                </div>

                <div>
                    <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">예약 가능 요일</div>
                    <div className="flex flex-wrap gap-2">
                        {data.availableDays.map((day) => (
                            <span
                                key={day}
                                className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-sm"
                            >
                                {DAY_LABELS[day]}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="text-xs font-semibold text-neutral-500 uppercase mb-2">리마인드 알림</div>
                    <div className="flex flex-wrap gap-2">
                        {data.reminderTimings.map((hours) => (
                            <span
                                key={hours}
                                className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-700 text-sm"
                            >
                                {hours}시간 전
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    )
}
