'use client'

import { Grid, Card, CardContent, Typography, Box } from '@mui/material'
import { LucideIcon } from 'lucide-react'

export interface SummaryCardItem {
    label: string
    value: string | number
    icon?: LucideIcon
    iconColor?: string
    subtitle?: string
    color?: 'success' | 'error' | 'warning' | 'info' | 'default'
    formatValue?: (value: number) => string
}

interface SummaryCardProps {
    items: SummaryCardItem[]
    columns?: { xs?: number; sm?: number; md?: number; lg?: number }
}

/**
 * 공통 Summary Card 컴포넌트
 * 여러 요약 정보를 카드 형태로 표시
 */
export default function SummaryCard({ items, columns = { xs: 12, sm: 6, md: 4 } }: SummaryCardProps) {
    const getColorScheme = (color?: SummaryCardItem['color']) => {
        switch (color) {
            case 'success':
                return {
                    bg: '#ecfdf5',
                    border: '#a7f3d0',
                    text: '#047857',
                }
            case 'error':
                return {
                    bg: '#fff1f2',
                    border: '#fecdd3',
                    text: '#be123c',
                }
            case 'warning':
                return {
                    bg: '#fffbeb',
                    border: '#fde68a',
                    text: '#b45309',
                }
            case 'info':
                return {
                    bg: '#eff6ff',
                    border: '#bfdbfe',
                    text: '#1d4ed8',
                }
            default:
                return {
                    bg: '#f9fafb',
                    border: '#e5e7eb',
                    text: '#374151',
                }
        }
    }

    const formatValue = (item: SummaryCardItem): string => {
        if (typeof item.value === 'string') return item.value
        if (item.formatValue && typeof item.value === 'number') return item.formatValue(item.value)
        
        // 기본 포맷팅 (숫자인 경우만)
        if (typeof item.value === 'number') {
            if (item.value >= 100000000) {
                return `${(item.value / 100000000).toFixed(1)}억`
            } else if (item.value >= 10000) {
                return `${(item.value / 10000).toFixed(0)}만`
            }
            return item.value.toLocaleString()
        }
        return String(item.value)
    }

    return (
        <Grid container spacing={2}>
            {items.map((item, index) => {
                const colorScheme = getColorScheme(item.color)
                const Icon = item.icon
                const displayValue = formatValue(item)

                return (
                    <Grid
                        key={index}
                        item
                        xs={columns.xs || 12}
                        sm={columns.sm || 6}
                        md={columns.md || 4}
                        {...(columns.lg !== undefined && { lg: columns.lg })}
                    >
                        <Card
                            variant="outlined"
                            sx={{
                                bgcolor: colorScheme.bg,
                                border: `1px solid ${colorScheme.border}`,
                                height: '100%',
                                borderRadius: 3,
                                transition: 'box-shadow 200ms ease',
                                '&:hover': { boxShadow: 1 },
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    {Icon && (
                                        <Icon
                                            size={20}
                                            style={{ color: item.iconColor || colorScheme.text }}
                                        />
                                    )}
                                    <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                        gutterBottom
                                        sx={{
                                            color: colorScheme.text,
                                            fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                        }}
                                    >
                                        {item.label}
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                    sx={{
                                        color: colorScheme.text,
                                        fontSize: { xs: '1rem', sm: '1.5rem' },
                                    }}
                                >
                                    {typeof item.value === 'number' && item.value >= 10000 ? '₩' : ''}
                                    {displayValue}
                                </Typography>
                                {item.subtitle && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ display: 'block', mt: 0.5 }}
                                    >
                                        {item.subtitle}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                )
            })}
        </Grid>
    )
}
