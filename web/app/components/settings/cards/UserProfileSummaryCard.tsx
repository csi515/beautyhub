'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { Pencil, User } from 'lucide-react'
import { type UserProfile } from '@/types/settings'

type Props = {
    data: UserProfile
    onEdit: () => void
}

export default function UserProfileSummaryCard({ data, onEdit }: Props) {
    return (
        <Card>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
                <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900">개인 정보</h3>
                    <p className="text-xs sm:text-sm text-neutral-600 mt-1">이름, 연락처, 프로필 정보를 관리하세요</p>
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
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-neutral-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-medium text-neutral-900 text-sm sm:text-base truncate">{data.name || '이름 미설정'}</div>
                        <div className="text-xs sm:text-sm text-neutral-600 truncate">{data.email}</div>
                    </div>
                </div>

                {data.phone && (
                    <div className="text-xs sm:text-sm text-neutral-700">
                        <span className="font-medium">전화번호:</span> <span className="break-all">{data.phone}</span>
                    </div>
                )}

                {data.birthdate && (
                    <div className="text-xs sm:text-sm text-neutral-700">
                        <span className="font-medium">생년월일:</span> {new Date(data.birthdate).toLocaleDateString('ko-KR')}
                    </div>
                )}
            </div>
        </Card>
    )
}
