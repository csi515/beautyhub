'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { Pencil, Shield, ShieldCheck } from 'lucide-react'
import { type SecuritySettings } from '@/types/settings'

type Props = {
    data: SecuritySettings
    onEdit: () => void
}

export default function SecuritySettingsSummaryCard({ data, onEdit }: Props) {
    return (
        <Card>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
                <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900">보안 설정</h3>
                    <p className="text-xs sm:text-sm text-neutral-600 mt-1">비밀번호, 2단계 인증을 관리하세요</p>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onEdit} 
                    leftIcon={<Pencil className="h-4 w-4" />}
                    sx={{ minHeight: { xs: '44px', sm: 'auto' }, whiteSpace: 'nowrap' }}
                >
                    편집
                </Button>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between min-h-[44px] sm:min-h-0">
                    <div className="flex items-center gap-2">
                        {data.twoFactorEnabled ? (
                            <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                            <Shield className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                        )}
                        <span className="text-xs sm:text-sm text-neutral-700">2단계 인증</span>
                    </div>
                    <span className={`text-xs sm:text-sm px-2 py-1 rounded-full flex-shrink-0 ${
                        data.twoFactorEnabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-neutral-100 text-neutral-600'
                    }`}>
                        {data.twoFactorEnabled ? '활성화' : '비활성화'}
                    </span>
                </div>

                <div className="text-xs sm:text-sm text-neutral-700 min-h-[44px] sm:min-h-0 flex items-center">
                    <span className="font-medium">세션 타임아웃:</span> {data.sessionTimeout}분
                </div>

                {data.passwordLastChanged && (
                    <div className="text-xs sm:text-sm text-neutral-700 min-h-[44px] sm:min-h-0 flex items-center">
                        <span className="font-medium">비밀번호 변경일:</span>{' '}
                        {new Date(data.passwordLastChanged).toLocaleDateString('ko-KR')}
                    </div>
                )}
            </div>
        </Card>
    )
}
