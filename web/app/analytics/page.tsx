'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'

import { Box, Typography, Grid, Card, CardContent, Alert, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useMediaQuery, Stack } from '@mui/material';
import Pagination from '@/app/components/common/Pagination';
import { useTheme } from '@mui/material/styles';
import MobileDataCard from '@/app/components/ui/MobileDataCard'
import { CardSkeleton } from '@/app/components/ui/SkeletonLoader'
import EmptyState from '@/app/components/ui/EmptyState'
import { Users, Star, DollarSign, BarChart2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAppToast } from '@/app/lib/ui/toast'
import { formatCurrency } from '@/app/lib/utils/format'
import { getLocalizedErrorMessage } from '@/app/lib/utils/messages'
import { logger } from '@/app/lib/utils/logger'
import PageContainer from '@/app/components/layout/PageContainer'
import PageIntro from '@/app/components/common/PageIntro'

interface CustomerLTV {
    customer_id: string
    customer_name: string
    total_revenue: number
    visit_count: number
    avg_revenue: number
    first_visit: string
    last_visit: string
    return_rate: number
}

interface VIPCustomer {
    customer_id: string
    customer_name: string
    customer_phone: string
    total_revenue: number
    transaction_count: number
    last_visit: string
}

const LTV_PAGE_SIZE = 10
const VIP_PAGE_SIZE_DESKTOP = 20
const VIP_PAGE_SIZE_MOBILE = 10

export default function AnalyticsPage() {
    const [ltvData, setLtvData] = useState<CustomerLTV[]>([])
    const [vipData, setVipData] = useState<VIPCustomer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [ltvPage, setLtvPage] = useState(1)
    const [vipPage, setVipPage] = useState(1)
    const toast = useAppToast()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const [ltvResponse, vipResponse] = await Promise.all([
                fetch('/api/analytics/customer-ltv'),
                fetch('/api/analytics/vip-customers')
            ])

            if (!ltvResponse.ok || !vipResponse.ok) {
                throw new Error('데이터를 불러오는데 실패했습니다')
            }

            const ltv = await ltvResponse.json()
            const vip = await vipResponse.json()

            setLtvData(ltv)
            setVipData(vip)
        } catch (err) {
            logger.error('Analytics fetch failed', err, 'AnalyticsPage')
            const msg = getLocalizedErrorMessage(err, '데이터를 불러오는데 실패했습니다')
            setError(msg)
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const totalCustomers = ltvData.length
    const avgLTV = totalCustomers > 0
        ? ltvData.reduce((sum, c) => sum + c.total_revenue, 0) / totalCustomers
        : 0

    const chartData = useMemo(() => ltvData
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 10)
        .map(c => ({
            name: c.customer_name,
            구매액: c.total_revenue,
            방문횟수: c.visit_count
        })), [ltvData])

    const sortedLtv = useMemo(() => [...ltvData].sort((a, b) => b.total_revenue - a.total_revenue), [ltvData])
    const paginatedLtv = useMemo(() => {
        const start = (ltvPage - 1) * LTV_PAGE_SIZE
        return sortedLtv.slice(start, start + LTV_PAGE_SIZE)
    }, [sortedLtv, ltvPage])

    const vipPageSize = isMobile ? VIP_PAGE_SIZE_MOBILE : VIP_PAGE_SIZE_DESKTOP
    const paginatedVip = useMemo(() => {
        const start = (vipPage - 1) * vipPageSize
        return vipData.slice(start, start + vipPageSize)
    }, [vipData, vipPage, vipPageSize])

    const ltvTotalPages = Math.max(1, Math.ceil(sortedLtv.length / LTV_PAGE_SIZE))
    const vipTotalPages = Math.max(1, Math.ceil(vipData.length / vipPageSize))

    if (loading) {
        return (
            <PageContainer maxWidth="xl" fullScreenOnTablet>
                <Box sx={{ mb: 4 }}>
                    <CardSkeleton count={3} />
                </Box>
                <CardSkeleton count={2} />
            </PageContainer>
        )
    }

    if (error) {
        return (
            <PageContainer maxWidth="xl" fullScreenOnTablet>
                <Alert severity="error">{error}</Alert>
            </PageContainer>
        )
    }

    if (ltvData.length === 0) {
        return (
            <PageContainer maxWidth="xl" fullScreenOnTablet>
                <EmptyState
                    icon={BarChart2}
                    title="분석할 데이터가 없습니다"
                    description="고객 결제 내역이 쌓이면 자동으로 분석 데이터가 표시됩니다."
                    actionLabel="새로고침"
                    onAction={fetchData}
                />
            </PageContainer>
        )
    }

    return (
        <PageContainer maxWidth="xl" fullScreenOnTablet>
            <PageIntro description="고객 LTV·VIP 분석 데이터를 확인합니다" count={totalCustomers} />

            {/* 요약 카드 */}
            <Grid container spacing={{ xs: 0.75, sm: 1.5, md: 2.5, lg: 3 }} sx={{ mb: 4 }}>
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
                                {(totalCustomers || 0).toLocaleString()}명
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
                                {formatCurrency(Math.round(avgLTV) || 0)}
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
                                {(vipData?.length || 0).toLocaleString()}명
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* LTV 차트 */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        고객별 LTV 상위 10명
                    </Typography>
                    <Box sx={{ width: '100%', height: 400, mt: 2 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" orientation="left" stroke="#667eea" />
                                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value || 0)}
                                    contentStyle={{ borderRadius: 8 }}
                                />
                                <Legend />
                                <Bar yAxisId="left" dataKey="구매액" fill="#667eea" />
                                <Bar yAxisId="right" dataKey="방문횟수" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>

            {/* VIP 고객 리스트 */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        VIP 고객 목록
                    </Typography>
                    {isMobile ? (
                        <Stack spacing={2} sx={{ mt: 2 }}>
                            {paginatedVip.map((customer, index) => (
                                <MobileDataCard
                                    key={customer.customer_id}
                                    title={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip label={(vipPage - 1) * vipPageSize + index + 1} size="small" color={index < 3 ? 'warning' : 'default'} sx={{ height: 20, fontSize: '0.7rem' }} />
                                            <Typography variant="subtitle2" fontWeight="bold">{customer.customer_name}</Typography>
                                        </Box>
                                    }
                                    subtitle={`거래 ${customer.transaction_count}회 | ${customer.customer_phone || '-'}`}
                                    status={{ label: 'VIP', color: 'warning' }}
                                    content={
                                        <Typography variant="body2" fontWeight={700} color="success.main" textAlign="right">
                                            총 구매액: {formatCurrency(customer.total_revenue || 0)}
                                        </Typography>
                                    }
                                />
                            ))}
                        </Stack>
                    ) : (
                        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>순위</TableCell>
                                        <TableCell>고객명</TableCell>
                                        <TableCell>연락처</TableCell>
                                        <TableCell align="right">총 구매액</TableCell>
                                        <TableCell align="right">거래 횟수</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedVip.map((customer, index) => (
                                        <TableRow key={customer.customer_id}>
                                            <TableCell>
                                                <Chip
                                                    label={(vipPage - 1) * vipPageSize + index + 1}
                                                    size="small"
                                                    color={index < 3 ? 'warning' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Star size={16} color="#f59e0b" fill="#f59e0b" />
                                                    {customer.customer_name}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{customer.customer_phone || '-'}</TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight={600} color="success.main">
                                                    {formatCurrency(customer.total_revenue || 0)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">{customer.transaction_count}회</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    {vipData.length > vipPageSize && (
                        <Pagination
                            page={vipPage}
                            totalPages={vipTotalPages}
                            onPageChange={setVipPage}
                            totalItems={vipData.length}
                            pageSize={vipPageSize}
                            simple
                        />
                    )}
                </CardContent>
            </Card>

            {/* 전체 LTV 리스트 */}
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        전체 고객 LTV
                    </Typography>
                    {isMobile ? (
                        <Stack spacing={2} sx={{ mt: 2 }}>
                            {paginatedLtv.map((customer) => (
                                <MobileDataCard
                                    key={customer.customer_id}
                                    title={customer.customer_name}
                                    subtitle={`방문 ${customer.visit_count}회 | 재방문율 ${customer.return_rate.toFixed(1)}%`}
                                    content={
                                        <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">총 구매액</Typography>
                                                <Typography variant="body2" fontWeight={600}>{formatCurrency(customer.total_revenue)}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">평균 객단가</Typography>
                                                <Typography variant="body2" fontWeight={600}>{formatCurrency(Math.round(customer.avg_revenue))}</Typography>
                                            </Grid>
                                        </Grid>
                                    }
                                />
                            ))}
                        </Stack>
                    ) : (
                        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>고객명</TableCell>
                                        <TableCell align="right">총 구매액</TableCell>
                                        <TableCell align="right">평균 구매액</TableCell>
                                        <TableCell align="right">방문 횟수</TableCell>
                                        <TableCell align="right">재방문율</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedLtv.map((customer) => (
                                        <TableRow key={customer.customer_id}>
                                            <TableCell>{customer.customer_name}</TableCell>
                                            <TableCell align="right">{formatCurrency(customer.total_revenue)}</TableCell>
                                            <TableCell align="right">{formatCurrency(Math.round(customer.avg_revenue))}</TableCell>
                                            <TableCell align="right">{customer.visit_count}회</TableCell>
                                            <TableCell align="right">{customer.return_rate.toFixed(1)}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    {sortedLtv.length > LTV_PAGE_SIZE && (
                        <Pagination
                            page={ltvPage}
                            totalPages={ltvTotalPages}
                            onPageChange={setLtvPage}
                            totalItems={sortedLtv.length}
                            pageSize={LTV_PAGE_SIZE}
                            simple
                        />
                    )}
                </CardContent>
            </Card>
        </PageContainer >
    )
}
