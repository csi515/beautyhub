'use client'

import { Typography, useMediaQuery, useTheme } from '@mui/material'
import Card from '@/app/components/ui/Card'
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
    // 트랜잭션 데이터를 일별/월별로 집계
    const processData = () => {
        // 최근 7일은 일별로, 그 이전은 월별로 구성
        // 현재는 간단하게 "일별 매출"로 표시
        const dailyMap = new Map<string, number>()

        // 날짜 오름차순 정렬 로직 필요
        // 단순 어제/오늘 기준으로 map 구성
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

        // 데이터가 부족하면 빈 데이터로 채우기(선택적)
        return data
    }

    const data = processData()
    const theme = useTheme()
    const isTablet = useMediaQuery(theme.breakpoints.only('md'))
    const chartHeight = isTablet ? 180 : 220

    return (
        <Card sx={{ height: '100%', width: '100%', maxWidth: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 24px 8px', borderBottom: '1px solid #E7E5E4' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>매출 추이</Typography>
                <Typography variant="body2" color="text.secondary">최근 일별 매출 현황</Typography>
            </div>
            <div style={{ flex: 1, height: `${chartHeight}px`, padding: '16px 24px', minHeight: `${chartHeight}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12, fill: '#666' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#666' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${value / 10000}만`}
                        />
                        <Tooltip
                            formatter={(value: number) => [`${value.toLocaleString()}원`, '매출']}
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar
                            dataKey="amount"
                            fill="#6366f1"
                            radius={[4, 4, 0, 0]}
                            barSize="auto"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}
