'use client'

import { Card, CardContent, CardHeader, Typography, useMediaQuery, useTheme } from '@mui/material'
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts'
import { Transaction } from '@/types/entities'

interface RevenueChartProps {
    transactions: Transaction[]
}

export default function RevenueChart({ transactions }: RevenueChartProps) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    
    // 트랜잭션 데이터를 월별/일별로 집계
    const processData = () => {
        // 최근 7일 또는 이번 달 데이터로 구성
        // 여기서는 간단하게 "일별 매출"로 예시
        const dailyMap = new Map<string, number>()

        // 날짜 오름차순 정렬 로직 등 필요
        // 일단 들어온 데이터 기반으로 map 구성
        transactions.forEach(t => {
            if (t.type === 'income' && t.transaction_date) {
                // YYYY-MM-DD
                const date = t.transaction_date.slice(5, 10) // MM-DD
                const current = dailyMap.get(date) || 0
                dailyMap.set(date, current + Number(t.amount))
            }
        })

        // Map -> Array & Sort
        const data = Array.from(dailyMap.entries())
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date))

        // 데이터가 너무 적으면 빈 데이터 채우기 (선택사항)
        return data
    }

    const data = processData()

    return (
        <Card sx={{ height: '100%', borderRadius: 2, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
            <CardHeader
                title={<Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>매출 추이</Typography>}
                subheader={<Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>최근 일별 매출 현황</Typography>}
                sx={{ pb: { xs: 1, sm: 1.5 } }}
            />
            <CardContent sx={{ height: { xs: 220, sm: 260, md: 300 }, width: '100%', maxWidth: '100%', overflow: 'hidden', p: { xs: 1, sm: 2, md: 3 } }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: isMobile ? 0 : 10, left: isMobile ? -10 : 0, bottom: isMobile ? 5 : 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => {
                                if (value >= 10000) return `${value / 10000}만`
                                return value.toString()
                            }}
                            width={isMobile ? 35 : 50}
                        />
                        <Tooltip
                            formatter={(value: number) => [`${value.toLocaleString()}원`, '매출']}
                            contentStyle={{ 
                                borderRadius: 8, 
                                border: 'none', 
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                fontSize: isMobile ? '12px' : '14px',
                                padding: isMobile ? '8px' : '12px'
                            }}
                            labelStyle={{ fontSize: isMobile ? '11px' : '12px' }}
                        />
                        <Bar
                            dataKey="amount"
                            fill="#6366f1"
                            radius={[4, 4, 0, 0]}
                            barSize={isMobile ? 20 : undefined}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
