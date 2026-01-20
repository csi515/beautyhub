'use client'

import { Card, CardContent, CardHeader, Typography, useMediaQuery, useTheme } from '@mui/material'
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from 'recharts'

interface TopServicesChartProps {
    recentAppointments: { product_name: string }[] // DashboardPage에서 가공된 데이터를 받음
}

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

export default function TopServicesChart({ recentAppointments }: TopServicesChartProps) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const processData = () => {
        const countMap = new Map<string, number>()

        recentAppointments.forEach(a => {
            if (a.product_name && a.product_name !== '-') {
                const current = countMap.get(a.product_name) || 0
                countMap.set(a.product_name, current + 1)
            }
        })

        const data = Array.from(countMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5) // Top 5

        return data
    }

    const data = processData()

    return (
        <Card sx={{ height: '100%', borderRadius: 2, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
            <CardHeader
                title={<Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>인기 시술 Top 5</Typography>}
                subheader={<Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>최근 예약 기준</Typography>}
                sx={{ pb: { xs: 1, sm: 1.5 } }}
            />
            <CardContent sx={{ height: { xs: 240, sm: 260, md: 300 }, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '100%', overflow: 'hidden', p: { xs: 1, sm: 2, md: 3 } }}>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy={isMobile ? "45%" : "50%"}
                                innerRadius={isMobile ? "30%" : "40%"}
                                outerRadius={isMobile ? "50%" : "60%"}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number) => [`${value}건`, '예약']}
                                contentStyle={{ 
                                    borderRadius: 8, 
                                    border: 'none', 
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    fontSize: isMobile ? '12px' : '14px',
                                    padding: isMobile ? '8px' : '12px'
                                }}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                height={isMobile ? 30 : 36}
                                iconSize={isMobile ? 10 : 12}
                                wrapperStyle={{ fontSize: isMobile ? '11px' : '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>데이터가 부족합니다.</Typography>
                )}
            </CardContent>
        </Card>
    )
}
