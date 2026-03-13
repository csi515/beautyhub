'use client'

import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { Pencil, Monitor, Globe, Clock } from 'lucide-react'
import { Box, Typography, Stack } from '@mui/material'
import { type DisplaySettings } from '@/types/settings'

type Props = {
    data: DisplaySettings
    onEdit: () => void
}

export default function DisplaySettingsSummaryCard({ data, onEdit }: Props) {
    const getThemeLabel = (theme: string) => {
        switch (theme) {
            case 'light':
                return '밝은 테마'
            case 'dark':
                return '어두운 테마'
            case 'auto':
                return '자동'
            default:
                return theme
        }
    }

    const getLanguageLabel = (lang: string) => {
        switch (lang) {
            case 'ko':
                return '한국어'
            case 'en':
                return 'English'
            default:
                return lang
        }
    }

    return (
        <Card>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
                        표시 설정
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        테마, 언어, 시간대를 설정하세요
                    </Typography>
                </Box>
                <Button variant="outline" size="sm" onClick={onEdit} leftIcon={<Pencil size={16} />}>
                    편집
                </Button>
            </Stack>

            <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Monitor size={20} style={{ color: 'var(--mui-palette-text-secondary)' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            테마
                        </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={500} sx={{ color: 'text.primary' }}>
                        {getThemeLabel(data.theme)}
                    </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Globe size={20} style={{ color: 'var(--mui-palette-text-secondary)' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            언어
                        </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={500} sx={{ color: 'text.primary' }}>
                        {getLanguageLabel(data.language)}
                    </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Clock size={20} style={{ color: 'var(--mui-palette-text-secondary)' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            시간대
                        </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={500} sx={{ color: 'text.primary' }}>
                        {data.timezone}
                    </Typography>
                </Stack>

                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <Box component="span" fontWeight={600}>
                        날짜 형식:
                    </Box>{' '}
                    {data.dateFormat}
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <Box component="span" fontWeight={600}>
                        시간 형식:
                    </Box>{' '}
                    {data.timeFormat === '24h' ? '24시간제' : '12시간제'}
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <Box component="span" fontWeight={600}>
                        통화:
                    </Box>{' '}
                    {data.currency}
                </Typography>
            </Stack>
        </Card>
    )
}
