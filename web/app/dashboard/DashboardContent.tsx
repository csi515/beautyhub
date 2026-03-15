'use client'

import { useMemo } from 'react'
import { useIsTablet } from '../lib/hooks/useBreakpoint'
import { formatCurrency } from '../lib/utils/format'
import Card from '../components/ui/Card'
import MetricCard from '../components/features/dashboard/MetricCard'
import DashboardInstallPrompt from '../components/features/dashboard/DashboardInstallPrompt'
import Link from 'next/link'
import type { Transaction } from '../components/features/dashboard/RecentTransactionsTable'
import DashboardProductList from './DashboardProductList'
import DashboardRecentAppointments from './DashboardRecentAppointments'
import DashboardRecentTransactions from './DashboardRecentTransactions'
import { Box, Grid, Typography, Stack } from '@mui/material'
import PageContainer from '../components/layout/PageContainer'
import PageIntro from '../components/common/PageIntro'
import RevenueChart from '../components/features/dashboard/RevenueChart'
import TopServicesChart from '../components/features/dashboard/TopServicesChart'
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton'
import ErrorState from '../components/common/ErrorState'
import { CheckCircle, Circle, ChevronRight } from 'lucide-react'

type RecentAppointment = {
    id: string
    appointment_date: string
    customer_name: string
    product_name: string
}

export interface DashboardData {
    todayAppointments: number
    monthlyProfit: number
    monthlyNewCustomers: number
    monthlyAppointments: number
    prevMonthlyProfit: number
    prevMonthlyAppointments: number
    prevMonthlyNewCustomers: number
    recentAppointments: RecentAppointment[]
    chartAppointments: { product_name: string }[]
    recentTransactions: Transaction[]
    monthlyRevenueData: { id: string; amount: number; transaction_date: string; type: string; owner_id: string }[]
    activeProducts: { id: string | number; name: string; price: number; active?: boolean }[]
}

interface DashboardContentProps {
    start: string
    end: string
    userId: string
    accessToken: string | undefined
    initialData: DashboardData | null
    error?: string | Error | null
}

export default function DashboardContent({ initialData, error }: DashboardContentProps) {
    const isTablet = useIsTablet()

    // Hook 규칙: early return 전에 모든 Hook 호출 (조건부 Hook 방지)
    const data = initialData ?? {}
    const {
        todayAppointments,
        monthlyProfit,
        monthlyNewCustomers,
        monthlyAppointments,
        prevMonthlyProfit,
        prevMonthlyAppointments,
        prevMonthlyNewCustomers,
        recentAppointments,
        chartAppointments,
        recentTransactions,
        monthlyRevenueData,
        activeProducts
    } = data as DashboardData

    const productLimit = isTablet ? 3 : 6
    const appointmentLimit = isTablet ? 3 : 5
    const transactionLimit = isTablet ? 4 : 5
    const slicedAppointments = useMemo(
        () => (recentAppointments ?? []).slice(0, appointmentLimit),
        [recentAppointments, appointmentLimit]
    )
    const slicedTransactions = useMemo(
        () => (recentTransactions ?? []).slice(0, transactionLimit),
        [recentTransactions, transactionLimit]
    )

    const formattedMonthlyProfit = useMemo(
        () => formatCurrency(monthlyProfit ?? 0),
        [monthlyProfit]
    )

    const calcDelta = (current: number, prev: number) => {
        if (!prev || prev === 0) return undefined
        const pct = ((current - prev) / prev * 100)
        return {
            value: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`,
            tone: (pct >= 0 ? 'up' : 'down') as 'up' | 'down',
        }
    }

    const profitDelta = useMemo(() => calcDelta(Number(monthlyProfit ?? 0), Number(prevMonthlyProfit ?? 0)), [monthlyProfit, prevMonthlyProfit])
    const appointmentsDelta = useMemo(() => calcDelta(Number(monthlyAppointments ?? 0), Number(prevMonthlyAppointments ?? 0)), [monthlyAppointments, prevMonthlyAppointments])
    const newCustomersDelta = useMemo(() => calcDelta(Number(monthlyNewCustomers ?? 0), Number(prevMonthlyNewCustomers ?? 0)), [monthlyNewCustomers, prevMonthlyNewCustomers])

    if (error) {
        const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : '데이터를 불러오는 중 오류가 발생했습니다.')
        return (
            <PageContainer maxWidth={false}>
                <ErrorState
                    title="대시보드 데이터를 불러올 수 없습니다"
                    message={errorMessage}
                    onRetry={() => window.location.reload()}
                    retryLabel="새로고침"
                />
            </PageContainer>
        )
    }

    if (!initialData) {
        return <DashboardSkeleton />
    }

    return (
        <PageContainer maxWidth={false}>
            <Stack
                spacing={{ xs: 1, sm: 1, md: isTablet ? 0.75 : 1 }}
                sx={{
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <PageIntro description="오늘의 요약과 최근 활동을 확인합니다" />
                <Box sx={{ display: { md: isTablet ? 'none' : 'block' } }}>
                    <DashboardInstallPrompt />
                </Box>

                {/* 신규 사용자 온보딩 가이드 */}
                {activeProducts.length === 0 && monthlyAppointments === 0 && (
                    <Card
                        sx={{
                            p: 1.5,
                            border: '1px dashed',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'text.primary' }}>
                                시작 가이드
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{ color: 'primary.main', bgcolor: 'primary.light', px: 1, py: 0.25, borderRadius: 1 }}
                            >
                                2단계
                            </Typography>
                        </Box>
                        <Stack spacing={1.5}>
                            {[
                                { label: '상품/서비스 등록', desc: '판매할 서비스나 상품을 먼저 등록하세요', href: '/products', done: activeProducts.length > 0 },
                                { label: '첫 예약 잡기', desc: '고객의 첫 예약을 등록해보세요', href: '/appointments', done: monthlyAppointments > 0 },
                            ].map((step) => (
                                <Box
                                    key={step.href}
                                    component={Link}
                                    href={step.href}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 1.25,
                                        borderRadius: 2,
                                        bgcolor: step.done ? 'success.light' : 'action.hover',
                                        border: '1px solid',
                                        borderColor: step.done ? 'success.main' : 'divider',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        minHeight: 56,
                                        transition: 'all 0.15s ease',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            bgcolor: step.done ? 'success.light' : 'primary.light',
                                        },
                                    }}
                                >
                                    <Box sx={{ flexShrink: 0, color: step.done ? 'success.main' : 'text.disabled' }}>
                                        {step.done ? <CheckCircle size={20} /> : <Circle size={20} />}
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                            sx={{ color: step.done ? 'success.dark' : 'text.primary' }}
                                        >
                                            {step.label}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {step.desc}
                                        </Typography>
                                    </Box>
                                    {!step.done && (
                                        <Box component="span" sx={{ flexShrink: 0, color: 'text.disabled', display: 'flex' }}>
                                            <ChevronRight size={16} />
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    </Card>
                )}

                {/* Metrics */}
                <Grid container spacing={{ xs: 0.5, sm: 0.75, md: isTablet ? 0.75 : 1, lg: 1 }} sx={{ width: '100%', maxWidth: '100%', margin: 0, flexShrink: 0, minWidth: 0 }}>
                    <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
                        <MetricCard
                            label="오늘 예약"
                            value={todayAppointments}
                            hint="오늘 기준"
                            colorIndex={0}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
                        <MetricCard
                            label="월간 순이익"
                            value={formattedMonthlyProfit}
                            hint="이번 달 기준"
                            colorIndex={1}
                            {...(profitDelta ? { delta: profitDelta } : {})}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
                        <MetricCard
                            label="이번 달 신규 고객"
                            value={monthlyNewCustomers}
                            hint="이번 달 기준"
                            colorIndex={2}
                            {...(newCustomersDelta ? { delta: newCustomersDelta } : {})}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3} sx={{ minWidth: 0 }}>
                        <MetricCard
                            label="이번 달 총 예약"
                            value={monthlyAppointments}
                            hint="이번 달 기준"
                            colorIndex={3}
                            {...(appointmentsDelta ? { delta: appointmentsDelta } : {})}
                        />
                    </Grid>
                </Grid>

                {/* Charts Row */}
                <Grid container spacing={{ xs: 0.5, sm: 0.75, md: isTablet ? 0.75 : 1, lg: 1 }} sx={{ minHeight: { xs: 'auto', md: isTablet ? 140 : 220 }, width: '100%', maxWidth: '100%', margin: 0, flexShrink: 0, minWidth: 0 }}>
                    <Grid item xs={12} lg={8} sx={{ minWidth: 0 }}>
                        {/* Revenue Chart */}
                        <RevenueChart transactions={monthlyRevenueData || recentTransactions} />
                    </Grid>
                    <Grid item xs={12} lg={4} sx={{ minWidth: 0 }}>
                        {/* Top Services Chart */}
                        <TopServicesChart recentAppointments={chartAppointments || recentAppointments} />
                    </Grid>
                </Grid>

                {/* Main Content Areas */}
                <Grid container spacing={{ xs: 0.5, sm: 0.75, md: isTablet ? 0.75 : 1, lg: 1 }} sx={{ width: '100%', maxWidth: '100%', margin: 0, flex: 1, minHeight: 0, minWidth: 0, alignContent: 'flex-start' }}>
                    {/* Expanded Products Section */}
                    <Grid item xs={12} lg={8} sx={{ minWidth: 0 }}>
                        <DashboardProductList products={activeProducts ?? []} limit={productLimit} isTablet={isTablet} />
                    </Grid>

                    {/* Recent Appointments */}
                    <Grid item xs={12} lg={4} sx={{ minWidth: 0 }}>
                        <DashboardRecentAppointments appointments={slicedAppointments} isTablet={isTablet} />
                    </Grid>

                    {/* Full-width Recent Transactions Table */}
                    <Grid item xs={12} sx={{ minWidth: 0 }}>
                        <DashboardRecentTransactions transactions={slicedTransactions as Transaction[]} isTablet={isTablet} />
                    </Grid>
                </Grid>
            </Stack>
        </PageContainer>
    )
}
