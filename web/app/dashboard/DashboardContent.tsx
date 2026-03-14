'use client'

import { useMemo, useEffect, useState } from 'react'
import { useIsTablet } from '../lib/hooks/useBreakpoint'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import MetricCard from '../components/features/dashboard/MetricCard'
import DashboardInstallPrompt from '../components/features/dashboard/DashboardInstallPrompt'
import Link from 'next/link'
import RecentTransactionsTable, { Transaction } from '../components/features/dashboard/RecentTransactionsTable'
import { Box, Grid, Typography, Stack, List, ListItem, ListItemText } from '@mui/material'
import PageContainer from '../components/layout/PageContainer'
import PageIntro from '../components/common/PageIntro'
import RevenueChart from '../components/features/dashboard/RevenueChart'
import TopServicesChart from '../components/features/dashboard/TopServicesChart'
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton'
import ErrorState from '../components/common/ErrorState'
import { PackageOpen, CalendarX, CheckCircle, Circle, ChevronRight } from 'lucide-react'

type RecentAppointment = {
    id: string
    appointment_date: string
    customer_name: string
    product_name: string
}

type ProductSummary = {
    id: string | number
    name: string
    price: number
    active?: boolean
}

interface DashboardContentProps {
    start: string
    end: string
    userId: string
    accessToken: string | undefined
    initialData: any
    error?: string | Error | null
}

export default function DashboardContent({ initialData, error }: DashboardContentProps) {
    const isTablet = useIsTablet()
    const [scrollProgress, setScrollProgress] = useState(0)

    // 스크롤 진행률 계산 (모바일 전용)
    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const scrollableHeight = documentHeight - windowHeight
            const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0
            setScrollProgress(Math.min(100, Math.max(0, progress)))
        }

        // 모바일에서만 스크롤 인디케이터 활성화
        if (window.innerWidth < 768) {
            window.addEventListener('scroll', handleScroll, { passive: true })
            handleScroll() // 초기값 설정
        }

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

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
    } = data as typeof initialData

    const productLimit = isTablet ? 4 : 12
    const appointmentLimit = isTablet ? 3 : 8
    const transactionLimit = isTablet ? 4 : 10
    const slicedProducts = useMemo(
        () => (activeProducts ?? []).slice(0, productLimit),
        [activeProducts, productLimit]
    )
    const slicedAppointments = useMemo(
        () => (recentAppointments ?? []).slice(0, appointmentLimit),
        [recentAppointments, appointmentLimit]
    )
    const slicedTransactions = useMemo(
        () => (recentTransactions ?? []).slice(0, transactionLimit),
        [recentTransactions, transactionLimit]
    )

    const formattedMonthlyProfit = useMemo(
        () => `₩${Number(monthlyProfit ?? 0).toLocaleString()}`,
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
        <>
            {/* 스크롤 인디케이터 (모바일 전용) */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    bgcolor: 'divider',
                    zIndex: 1100,
                    display: { xs: 'block', md: 'none' },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${scrollProgress}%`,
                        bgcolor: 'primary.main',
                        transition: 'width 0.1s ease-out',
                    },
                }}
            />
            <PageContainer maxWidth={false}>
            <Stack
                spacing={{ xs: 1.5, sm: 1.5, md: isTablet ? 1 : 1.5 }}
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
                            p: 2,
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
                <Grid container spacing={{ xs: 0.75, sm: 1, md: isTablet ? 1 : 1.5, lg: 1.5 }} sx={{ width: '100%', maxWidth: '100%', margin: 0, flexShrink: 0, minWidth: 0 }}>
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
                <Grid container spacing={{ xs: 0.75, sm: 1, md: isTablet ? 1 : 1.5, lg: 1.5 }} sx={{ minHeight: { xs: 'auto', md: isTablet ? 160 : 320 }, width: '100%', maxWidth: '100%', margin: 0, flexShrink: 0, minWidth: 0 }}>
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
                <Grid container spacing={{ xs: 0.75, sm: 1, md: isTablet ? 1 : 1.5, lg: 1.5 }} sx={{ width: '100%', maxWidth: '100%', margin: 0, flex: 1, minHeight: 0, minWidth: 0, alignContent: 'flex-start' }}>
                    {/* Expanded Products Section */}
                    <Grid item xs={12} lg={8} sx={{ minWidth: 0 }}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 2, md: isTablet ? 1.5 : 2 } }}>
                            <Box sx={{ mb: { xs: 1.5, md: isTablet ? 1 : 1.5 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 1, sm: 0 } }}>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ background: 'linear-gradient(to right, #059669, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    판매 중인 상품
                                </Typography>
                                <Box
                                    component={Link}
                                    href="/products"
                                    aria-label="판매 중인 상품 전체보기"
                                    sx={{
                                        fontSize: { xs: '0.875rem', sm: '0.875rem' },
                                        color: '#64748B',
                                        textDecoration: 'none',
                                        minHeight: '44px',
                                        minWidth: '44px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: { xs: '0.75rem', sm: '0.5rem' }
                                    }}
                                >
                                    전체보기 →
                                </Box>
                            </Box>
                            {activeProducts.length > 0 ? (
                                <Grid container spacing={{ xs: 0.5, sm: 1, md: isTablet ? 1 : 1 }}>
                                    {slicedProducts.map((p: ProductSummary, index: number) => (
                                        <Grid item xs={12} sm={6} md={isTablet ? 6 : 4} key={p.id}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    p: { xs: 1.5, md: isTablet ? 1 : 1.5 },
                                                    borderRadius: 3,
                                                    bgcolor: 'background.paper',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    width: '100%',
                                                    maxWidth: '100%',
                                                    overflow: 'hidden',
                                                    touchAction: 'manipulation',
                                                    WebkitTapHighlightColor: 'transparent',
                                                    animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
                                                    '@keyframes fadeInUp': {
                                                        from: {
                                                            opacity: 0,
                                                            transform: 'translateY(10px)',
                                                        },
                                                        to: {
                                                            opacity: 1,
                                                            transform: 'translateY(0)',
                                                        },
                                                    },
                                                    '&:hover': {
                                                        bgcolor: 'rgba(16, 185, 129, 0.04)',
                                                        borderColor: 'success.light',
                                                        transform: { xs: 'none', md: 'translateY(-4px)' },
                                                        boxShadow: { xs: 'none', md: '0 12px 24px -10px rgba(16, 185, 129, 0.2)' }
                                                    },
                                                    '&:active': {
                                                        transform: { xs: 'scale(0.98)', md: 'none' },
                                                        bgcolor: 'rgba(16, 185, 129, 0.08)',
                                                    }
                                                }}
                                            >
                                                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: { xs: 2, sm: 1 }, WebkitBoxOrient: 'vertical', fontSize: { xs: '1rem', sm: '0.875rem' } }}>
                                                    {p.name}
                                                </Typography>
                                                <Typography variant="h6" fontWeight={700} color="success.main">
                                                    ₩{Number(p.price || 0).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Stack
                                    alignItems="center"
                                    justifyContent="center"
                                    spacing={2}
                                    sx={{ py: 5, bgcolor: 'background.default', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}
                                >
                                    <PackageOpen 
                                        size={48} 
                                        className="text-gray-300"
                                        style={{ 
                                            width: 'clamp(40px, 12vw, 48px)',
                                            height: 'clamp(40px, 12vw, 48px)'
                                        }}
                                    />
                                    <Box textAlign="center">
                                        <Typography variant="body1" color="text.secondary" fontWeight={500} gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1rem' } }}>
                                            아직 등록된 상품이 없어요
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1, mb: 2, fontSize: { xs: '0.875rem', sm: '0.75rem' } }}>
                                            첫 상품을 등록하고 비즈니스를 시작해보세요!
                                        </Typography>
                                        <Link 
                                            href="/products" 
                                            aria-label="상품 추가하기"
                                            style={{ 
                                                color: '#3B82F6', 
                                                fontSize: '0.875rem', 
                                                fontWeight: 600, 
                                                textDecoration: 'none',
                                                minHeight: '44px',
                                                minWidth: '44px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '0.75rem 1rem'
                                            }}
                                        >
                                            + 상품 추가하기
                                        </Link>
                                    </Box>
                                </Stack>
                            )}
                        </Card>
                    </Grid>

                    {/* Recent Appointments */}
                    <Grid item xs={12} lg={4} sx={{ minWidth: 0 }}>
                        <Card sx={{ height: '100%', p: { xs: 2, md: isTablet ? 1.5 : 2 } }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: { xs: 1.5, md: isTablet ? 1 : 1.5 }, mb: { xs: 1.5, md: isTablet ? 1 : 1.5 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 1, sm: 0 } }}>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ background: 'linear-gradient(to right, #db2777, #e11d48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    최근 예약
                                </Typography>
                                <Box
                                    component={Link}
                                    href="/appointments"
                                    aria-label="최근 예약 전체보기"
                                    sx={{
                                        fontSize: { xs: '0.875rem', sm: '0.875rem' },
                                        color: '#64748B',
                                        textDecoration: 'none',
                                        minHeight: '44px',
                                        minWidth: '44px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: { xs: '0.75rem', sm: '0.5rem' }
                                    }}
                                >
                                    전체보기 →
                                </Box>
                            </Box>
                            <List disablePadding sx={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
                                {slicedAppointments.length > 0 ? slicedAppointments.map((a: RecentAppointment, index: number) => {
                                    const isToday = new Date(a.appointment_date).toDateString() === new Date().toDateString()
                                    return (
                                        <ListItem
                                            key={a.id}
                                            disableGutters
                                            sx={{
                                                py: { xs: 1.25, md: isTablet ? 0.75 : 1.25 },
                                                px: 1,
                                                borderBottom: '1px solid',
                                                borderLeft: isToday ? '3px solid' : 'none',
                                                borderColor: isToday ? 'primary.main' : 'divider',
                                                bgcolor: isToday ? 'primary.50' : 'transparent',
                                                width: '100%',
                                                maxWidth: '100%',
                                                minWidth: 0,
                                                minHeight: { xs: '44px', sm: 'auto' },
                                                touchAction: 'manipulation',
                                                WebkitTapHighlightColor: 'transparent',
                                                transition: 'background-color 0.15s ease',
                                                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
                                                '@keyframes fadeInUp': {
                                                    from: {
                                                        opacity: 0,
                                                        transform: 'translateY(10px)',
                                                    },
                                                    to: {
                                                        opacity: 1,
                                                        transform: 'translateY(0)',
                                                    },
                                                },
                                                '&:active': {
                                                    bgcolor: { xs: 'rgba(66, 99, 235, 0.1)', sm: 'transparent' },
                                                },
                                                '&:last-child': { borderBottom: 'none' }
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 0.5, sm: 0 } }}>
                                                        <Typography variant="body2" fontWeight={600} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: { xs: 'normal', sm: 'nowrap' }, fontSize: { xs: '1rem', sm: '0.875rem' } }}>{a.customer_name}</Typography>
                                                        <Typography variant="caption" color="primary.main" sx={{ flexShrink: 0, fontSize: { xs: '0.875rem', sm: '0.75rem' } }}>{a.product_name}</Typography>
                                                    </Box>
                                                }
                                                secondary={String(a.appointment_date).slice(0, 16).replace('T', ' ')}
                                                secondaryTypographyProps={{ variant: 'caption', sx: { mt: 0.5, display: 'block', fontSize: { xs: '0.875rem', sm: '0.75rem' } } }}
                                            />
                                        </ListItem>
                                    )
                                }) : (
                                    <Stack
                                        alignItems="center"
                                        justifyContent="center"
                                        spacing={2}
                                        sx={{ py: 4 }}
                                    >
                                        <CalendarX 
                                            size={48} 
                                            className="text-gray-300"
                                            style={{ 
                                                width: 'clamp(40px, 12vw, 48px)',
                                                height: 'clamp(40px, 12vw, 48px)'
                                            }}
                                        />
                                        <Box textAlign="center">
                                            <Typography variant="body1" fontWeight={600} color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1rem' } }}>
                                                아직 예약 내역이 없어요
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1, mb: 2, fontSize: { xs: '0.875rem', sm: '0.75rem' } }}>
                                                첫 예약을 추가하고 고객 관리를 시작해보세요!
                                            </Typography>
                                            <Link href="/appointments" passHref aria-label="예약 추가하기">
                                                <Button variant="primary" size="sm" aria-label="예약 추가하기">
                                                    예약 추가
                                                </Button>
                                            </Link>
                                        </Box>
                                    </Stack>
                                )}
                            </List>
                        </Card>
                    </Grid>

                    {/* Full-width Recent Transactions Table */}
                    <Grid item xs={12} sx={{ minWidth: 0 }}>
                        <Card sx={{ p: { xs: 2, md: isTablet ? 1.5 : 2 } }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: { xs: 1.5, md: isTablet ? 1 : 1.5 }, mb: { xs: 1.5, md: isTablet ? 1 : 1.5 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 1, sm: 0 } }}>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    최근 거래 내역
                                </Typography>
                                <Box
                                    component={Link}
                                    href="/finance"
                                    aria-label="최근 거래 내역 전체보기"
                                    sx={{
                                        fontSize: { xs: '0.875rem', sm: '0.875rem' },
                                        color: '#64748B',
                                        textDecoration: 'none',
                                        minHeight: '44px',
                                        minWidth: '44px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: { xs: '0.75rem', sm: '0.5rem' }
                                    }}
                                >
                                    전체보기 →
                                </Box>
                            </Box>
                            <RecentTransactionsTable transactions={slicedTransactions as Transaction[]} />
                        </Card>
                    </Grid>
                </Grid>
            </Stack>
        </PageContainer>
        </>
    )
}
