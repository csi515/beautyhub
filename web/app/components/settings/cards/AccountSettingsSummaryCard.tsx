'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { LogOut, Download } from 'lucide-react'

type Props = {
    onLogout: () => void
    onExportData: () => void
}

export default function AccountSettingsSummaryCard({ onLogout, onExportData }: Props) {
    return (
        <Card>
            <div className="mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-neutral-900">계정 관리</h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">계정 관련 작업을 수행하세요</p>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
                <Button
                    variant="outline"
                    onClick={onExportData}
                    leftIcon={<Download className="h-4 w-4" />}
                    className="w-full justify-start"
                    sx={{ minHeight: '44px', fontSize: { xs: '0.9375rem', sm: '1rem' } }}
                >
                    내 데이터 내보내기
                </Button>

                <Button
                    variant="outline"
                    onClick={onLogout}
                    leftIcon={<LogOut className="h-4 w-4" />}
                    className="w-full justify-start text-neutral-700 hover:text-neutral-900"
                    sx={{ minHeight: '44px', fontSize: { xs: '0.9375rem', sm: '1rem' } }}
                >
                    로그아웃
                </Button>
            </div>
        </Card>
    )
}
