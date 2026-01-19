'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { Pencil, Bell, BellOff } from 'lucide-react'
import { type SystemSettings } from '@/types/settings'

type Props = {
    data: SystemSettings
    onEdit: () => void
}

export default function SystemSettingsSummaryCard({ data, onEdit }: Props) {
    return (
        <Card>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-neutral-900">시스템 및 앱 관리 설정</h3>
                    <p className="text-sm text-neutral-600 mt-1">시스템 알림 설정</p>
                </div>
                <Button variant="outline" size="sm" onClick={onEdit} leftIcon={<Pencil className="h-4 w-4" />}>
                    편집
                </Button>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">PUSH 알림 전체</span>
                    {data.pushNotificationsEnabled ? (
                        <Bell className="h-5 w-5 text-[#F472B6]" />
                    ) : (
                        <BellOff className="h-5 w-5 text-neutral-400" />
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">고객 알림</span>
                    {data.customerNotificationsEnabled ? (
                        <Bell className="h-5 w-5 text-[#F472B6]" />
                    ) : (
                        <BellOff className="h-5 w-5 text-neutral-400" />
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">내부 알림</span>
                    {data.internalNotificationsEnabled ? (
                        <Bell className="h-5 w-5 text-[#F472B6]" />
                    ) : (
                        <BellOff className="h-5 w-5 text-neutral-400" />
                    )}
                </div>
            </div>
        </Card>
    )
}
