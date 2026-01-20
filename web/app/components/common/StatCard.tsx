'use client'

import { ReactNode } from 'react'
import { Card, CardContent, Typography, Box, Grid } from '@mui/material'

export interface StatCardData {
  label: string
  value: string | number
  description?: string
  icon?: ReactNode
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default'
  trend?: {
    value: string | number
    isPositive?: boolean
  }
}

interface StatCardProps {
  data: StatCardData
  className?: string
}

/**
 * 개별 통계 카드 컴포넌트
 */
export function StatCard({ data, className }: StatCardProps) {
  const colorMap = {
    primary: { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857' },
    success: { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
    error: { bg: '#fff1f2', border: '#fecdd3', text: '#be123c' },
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
    default: { bg: '#f9fafb', border: '#e5e7eb', text: '#374151' },
  }

  const colors = colorMap[data.color || 'default']

  const formatValue = (val: string | number, showCurrency = true): string => {
    if (typeof val === 'number') {
      if (val >= 100000000) {
        return showCurrency ? `₩${(val / 100000000).toFixed(1)}억` : `${(val / 100000000).toFixed(1)}억`
      } else if (val >= 10000) {
        return showCurrency ? `₩${(val / 10000).toFixed(0)}만` : `${(val / 10000).toFixed(0)}만`
      }
      return showCurrency ? `₩${val.toLocaleString()}` : val.toLocaleString()
    }
    // 문자열인 경우, 이미 포맷팅되어 있을 수 있음
    if (typeof val === 'string' && val.startsWith('₩')) {
      return val
    }
    return showCurrency ? `₩${val}` : val
  }

  // 금액 표시 여부 확인 (숫자이거나 ₩로 시작하는 문자열)
  const isAmount = typeof data.value === 'number' || (typeof data.value === 'string' && /^[₩0-9]/.test(data.value))

  return (
    <Card
      variant="outlined"
      className={className}
      sx={{
        bgcolor: colors.bg,
        borderColor: colors.border,
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        {data.icon && (
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            {data.icon}
          </Box>
        )}
        <Typography
          variant="body2"
          sx={{
            color: colors.text,
            fontWeight: 'bold',
            fontSize: { xs: '0.7rem', sm: '0.875rem' },
            mb: 0.5,
          }}
        >
          {data.label}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: colors.text,
            fontWeight: 'bold',
            fontSize: { xs: '1rem', sm: '1.5rem' },
            mb: data.description || data.trend ? 0.5 : 0,
          }}
        >
          {isAmount ? formatValue(data.value) : data.value}
        </Typography>
        {data.description && (
          <Typography variant="caption" sx={{ color: colors.text, opacity: 0.7, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            {data.description}
          </Typography>
        )}
        {data.trend && (
          <Typography
            variant="caption"
            sx={{
              color: data.trend.isPositive ? colors.text : colorMap.error.text,
              fontWeight: 500,
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
            }}
          >
            {typeof data.trend.value === 'number' ? (data.trend.isPositive ? '+' : '') + formatValue(data.trend.value) : data.trend.value}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

interface StatCardsGridProps {
  cards: StatCardData[]
  spacing?: number
  columns?: { xs?: number; sm?: number; md?: number; lg?: number }
  className?: string
}

/**
 * 통계 카드 그리드 컴포넌트
 */
export function StatCardsGrid({ cards, spacing = 3, columns = { xs: 12, sm: 6, md: 3 }, className }: StatCardsGridProps) {
  return (
    <Grid container spacing={spacing} className={className}>
      {cards.map((card, index) => (
        <Grid item {...columns} key={card.label || index}>
          <StatCard data={card} />
        </Grid>
      ))}
    </Grid>
  )
}

export default StatCard
