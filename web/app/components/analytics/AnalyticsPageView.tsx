/**
 * Analytics 페이지 View 컴포넌트
 * 순수 UI만 담당, 모든 로직은 props로 받음
 */

'use client'

import { Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useMediaQuery, Stack, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEffect } from 'react'
import MobileDataCard from '../ui/MobileDataCard'
import StandardPageLayout from '../common/StandardPageLayout'
import PageHeader, { createActionButton } from '../common/PageHeader'
import { usePageHeader } from '@/app/lib/contexts/PageHeaderContext'
import { useExportVisibility } from '@/app/lib/hooks/useExportVisibility'
import { TrendingUp, Users, Star, DollarSign, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import LoadingState from '../common/LoadingState'
import type { CustomerLTV, VIPCustomer } from '@/app/lib/services/analytics.service'

export interface AnalyticsPageViewProps {
    /** 탭 등에 임베드 시 레이아웃·헤더 생략 */
    embedded?: boolean
    // 데이터
    ltvData: CustomerLTV[]
    vipData: VIPCustomer[]
    loading: boolean
    error: string | null
    stats: {
        totalCustomers: number
        avgLTV: number
    }
    chartData: Array<{
        name: string
        구매액: number
        방문횟수: number
    }>
    
    // 액션
    onExport: () => void
}

export default function AnalyticsPageView({
    embedded = false,
    ltvData,
    vipData,
    loading,
    error,
    stats,
    chartData,
    onExport,
}: AnalyticsPageViewProps) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const { showExport } = useExportVisibility()
    const { setHeaderInfo, clearHeaderInfo } = usePageHeader()

    // 모바일에서 Context에 헤더 정보 설정 (embedded 시 스킵)
    useEffect(() => {
        if (embedded) return
        if (isMobile) {
            setHeaderInfo({
                title: '고객 분석',
                icon: <TrendingUp />,
                description: '고객 생애 가치(LTV) 및 VIP 고객 분석',
                actions: [],
            })
        } else {
            clearHeaderInfo()
        }

        return () => {
            if (isMobile) {
                clearHeaderInfo()
            }
        }
    }, [embedded, isMobile, setHeaderInfo, clearHeaderInfo, onExport])

    const inner = (
        <>
            {!embedded && !isMobile && (
                <PageHeader
                    title="고객 분석"
                    description="고객 생애 가치(LTV) 및 VIP 고객 분석"
                    icon={<TrendingUp />}
                    actions={showExport ? [createActionButton('CSV 내보내기', onExport, 'secondary', <Download size={16} />)] : []}
                />
            )}

            {embedded && showExport && (
                <Stack direction="row" sx={{ mb: 2 }}>
                    <Button variant="outlined" size="small" startIcon={<Download size={16} />} onClick={onExport}>
                        CSV 내보내기
                    </Button>
                </Stack>
            )}

            {/* 통계 카드 */}
            <Grid container spacing={{ xs: 1, sm: 1.5, md: 3 }} sx={{ mb: { xs: 2, sm: 2.5, md: 4 } }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Users size={20} color="#667eea" />
                                <Typography variant="body2" color="text.secondary">
                                    총 고객 수
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>
                                {(stats.totalCustomers || 0).toLocaleString()}명
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <DollarSign size={20} color="#10b981" />
                                <Typography variant="body2" color="text.secondary">
                                    평균 LTV
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>
                                ₩{(Math.round(stats.avgLTV) || 0).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Star size={20} color="#f59e0b" />
                                <Typography variant="body2" color="text.secondary">
                                    VIP 고객
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>
                                {vipData.length}명
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 차트 */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        고객별 구매액 Top 10
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="구매액" fill="#667eea" />
                            <Bar dataKey="방문횟수" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* VIP 고객 목록 */}
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        VIP 고객 목록
                    </Typography>
                    {isMobile ? (
                        <Stack spacing={{ xs: 1, sm: 1.5 }} sx={{ mt: 2 }}>
                            {vipData.map((customer) => (
                                <MobileDataCard
                                    key={customer.customer_id}
                                    title={customer.customer_name}
                                    subtitle={`총 매출: ₩${customer.total_revenue.toLocaleString()} | 거래 횟수: ${customer.transaction_count}회`}
                                    status={{ label: 'VIP', color: 'warning' }}
                                />
                            ))}
                        </Stack>
                    ) : (
                        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>고객명</TableCell>
                                        <TableCell>연락처</TableCell>
                                        <TableCell align="right">총 매출</TableCell>
                                        <TableCell align="right">거래 횟수</TableCell>
                                        <TableCell>최근 방문</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {vipData.map((customer) => (
                                        <TableRow key={customer.customer_id}>
                                            <TableCell>{customer.customer_name}</TableCell>
                                            <TableCell>{customer.customer_phone}</TableCell>
                                            <TableCell align="right">
                                                ₩{customer.total_revenue.toLocaleString()}
                                            </TableCell>
                                            <TableCell align="right">{customer.transaction_count}</TableCell>
                                            <TableCell>
                                                {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString() : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </>
    )

    if (embedded) {
        if (loading) return <LoadingState rows={5} variant="card" />
        return <>{inner}</>
    }
    return (
        <StandardPageLayout
            loading={loading}
            error={error || undefined}
            empty={!loading && ltvData.length === 0}
            emptyTitle="데이터가 없습니다"
            emptyDescription="분석할 고객 데이터가 없습니다."
            maxWidth={{ xs: '100%', md: '1200px' }}
        >
            {inner}
        </StandardPageLayout>
    )
}
