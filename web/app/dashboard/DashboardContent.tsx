'use client'

import { useEffect, useState } from 'react'
import { useShopName } from '../lib/hooks/useShopName'
import DashboardInstallPrompt from '../components/dashboard/DashboardInstallPrompt'
import { Box, Typography, Stack, Grid, Container, IconButton } from '@mui/material'
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton'
import ErrorState from '../components/common/ErrorState'
import { Settings } from 'lucide-react'
import WidgetSettingsModal from '../components/dashboard/WidgetSettingsModal'
import { useDashboardWidgets } from '../lib/hooks/useDashboardWidgets'
import DashboardMetricsWidget from '../components/dashboard/widgets/DashboardMetricsWidget'
import DashboardChartsWidget from '../components/dashboard/widgets/DashboardChartsWidget'
import DashboardProductsWidget from '../components/dashboard/widgets/DashboardProductsWidget'
import DashboardAppointmentsWidget from '../components/dashboard/widgets/DashboardAppointmentsWidget'
import DashboardTransactionsWidget from '../components/dashboard/widgets/DashboardTransactionsWidget'
import { Transaction } from '../components/dashboard/RecentTransactionsTable'

interface DashboardContentProps {
    start: string
    end: string
    userId: string
    accessToken: string | undefined
    initialData: any
    error?: string | Error | null
}

export default function DashboardContent({ initialData, error }: DashboardContentProps) {
    const shopName = useShopName()
    const [scrollProgress, setScrollProgress] = useState(0)
    const { handleSave } = useDashboardWidgets()
    const [widgetSettingsOpen, setWidgetSettingsOpen] = useState(false)

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

    if (error) {
        const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : '데이터를 불러오는 중 오류가 발생했습니다.')
        return (
            <Container 
                maxWidth={false}
                sx={{ 
                    py: { xs: 2, sm: 3, md: 4 }, 
                    px: { xs: 1.5, sm: 2, md: 3 },
                    width: '100%',
                    maxWidth: { xs: '100%', md: '1200px' },
                }}
            >
                <ErrorState
                    title="대시보드 데이터를 불러올 수 없습니다"
                    message={errorMessage}
                    onRetry={() => window.location.reload()}
                    retryLabel="새로고침"
                />
            </Container>
        )
    }

    if (!initialData) {
        return <DashboardSkeleton />
    }

    const {
        todayAppointments,
        monthlyProfit,
        monthlyNewCustomers,
        monthlyAppointments,
        recentAppointments,
        chartAppointments,
        recentTransactions,
        monthlyRevenueData,
        activeProducts
    } = initialData

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
            <Container 
                maxWidth={false}
                sx={{ 
                    py: { xs: 2, sm: 3, md: 4 }, 
                    px: { xs: 1.5, sm: 2, md: 3 },
                    width: '100%',
                    maxWidth: { xs: '100%', md: '1200px' },
                    overflowX: 'hidden',
                    position: 'relative'
                }}
            >
            <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: '100%', overflowX: 'hidden' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary', mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                            {shopName}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1rem' } }}>
                            오늘도 힘차게 비즈니스를 관리해 보세요.
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setWidgetSettingsOpen(true)} aria-label="대시보드 위젯 설정">
                        <Settings />
                    </IconButton>
                </Box>

                <DashboardInstallPrompt />

                <DashboardMetricsWidget
                    todayAppointments={todayAppointments}
                    monthlyProfit={monthlyProfit}
                    monthlyNewCustomers={monthlyNewCustomers}
                    monthlyAppointments={monthlyAppointments}
                />

                <DashboardChartsWidget
                    monthlyRevenueData={monthlyRevenueData}
                    recentTransactions={recentTransactions}
                    chartAppointments={chartAppointments}
                    recentAppointments={recentAppointments}
                />

                <Grid container spacing={{ xs: 0.75, sm: 1.5, md: 2.5, lg: 3 }} sx={{ width: '100%', margin: 0, overflowX: 'hidden' }}>
                    <Grid item xs={12} lg={8}>
                        <DashboardProductsWidget activeProducts={activeProducts} />
                    </Grid>
                    <Grid item xs={12} lg={4}>
                        <DashboardAppointmentsWidget recentAppointments={recentAppointments} />
                    </Grid>
                    <Grid item xs={12}>
                        <DashboardTransactionsWidget recentTransactions={recentTransactions as Transaction[]} />
                    </Grid>
                </Grid>
            </Stack>
        </Container>
        <WidgetSettingsModal
          open={widgetSettingsOpen}
          onClose={() => setWidgetSettingsOpen(false)}
          onSave={(newWidgets) => {
            handleSave(newWidgets)
            setWidgetSettingsOpen(false)
          }}
        />
        </>
    )
}
