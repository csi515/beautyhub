'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { Pencil, Monitor, Globe, Clock } from 'lucide-react'
import { type DisplaySettings } from '@/types/settings'

type Props = {
    data: DisplaySettings
    onEdit: () => void
}

export default function DisplaySettingsSummaryCard({ data, onEdit }: Props) {
    const getThemeLabel = (theme: string) => {
        switch (theme) {
            case 'light': return '밝은 테마'
            case 'dark': return '어두운 테마'
            case 'auto': return '자동'
            default: return theme
        }
    }

    const getLanguageLabel = (lang: string) => {
        switch (lang) {
            case 'ko': return '한국어'
            case 'en': return 'English'
            default: return lang
        }
    }

    return (
        <Card>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
                <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900">표시 설정</h3>
                    <p className="text-xs sm:text-sm text-neutral-600 mt-1">테마, 언어, 시간대를 설정하세요</p>
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
                    <div className="flex items-center gap-2 min-w-0">
                        <Monitor className="h-5 w-5 text-neutral-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-neutral-700">테마</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-neutral-900 flex-shrink-0 ml-2">
                        {getThemeLabel(data.theme)}
                    </span>
                </div>

                <div className="flex items-center justify-between min-h-[44px] sm:min-h-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <Globe className="h-5 w-5 text-neutral-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-neutral-700">언어</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-neutral-900 flex-shrink-0 ml-2">
                        {getLanguageLabel(data.language)}
                    </span>
                </div>

                <div className="flex items-center justify-between min-h-[44px] sm:min-h-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <Clock className="h-5 w-5 text-neutral-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-neutral-700">시간대</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-neutral-900 flex-shrink-0 ml-2 truncate">
                        {data.timezone}
                    </span>
                </div>

                <div className="text-xs sm:text-sm text-neutral-700 min-h-[44px] sm:min-h-0 flex items-center">
                    <span className="font-medium">날짜 형식:</span> <span className="ml-1 break-all">{data.dateFormat}</span>
                </div>

                <div className="text-xs sm:text-sm text-neutral-700 min-h-[44px] sm:min-h-0 flex items-center">
                    <span className="font-medium">시간 형식:</span> <span className="ml-1">{data.timeFormat === '24h' ? '24시간제' : '12시간제'}</span>
                </div>

                <div className="text-xs sm:text-sm text-neutral-700 min-h-[44px] sm:min-h-0 flex items-center">
                    <span className="font-medium">통화:</span> <span className="ml-1">{data.currency}</span>
                </div>
            </div>
        </Card>
    )
}
