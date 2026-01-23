'use client'

import { useEffect, useState, useRef } from 'react'
import { useShopName } from '../lib/hooks/useShopName'
import DashboardInstallPrompt from '../components/dashboard/DashboardInstallPrompt'
import { Box, Typography, Grid, IconButton, useMediaQuery, useTheme } from '@mui/material'
import StandardPageLayout from '../components/common/StandardPageLayout'
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
    const contentRef = useRef<HTMLDivElement>(null)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    // 스크롤 진행률 계산 (모바일 전용)
    // AppShell의 콘텐츠 영역 스크롤을 감지
    useEffect(() => {
        if (!isMobile || !contentRef.current) return

        const contentElement = contentRef.current.closest('[role="main"]') || contentRef.current.parentElement
        if (!contentElement) return

        const handleScroll = () => {
            const scrollTop = contentElement.scrollTop
            const scrollHeight = contentElement.scrollHeight
            const clientHeight = contentElement.clientHeight
            const scrollableHeight = scrollHeight - clientHeight
            const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0
            setScrollProgress(Math.min(100, Math.max(0, progress)))
        }

        contentElement.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // 초기값 설정

        return () => {
            contentElement.removeEventListener('scroll', handleScroll)
        }
    }, [isMobile])

    if (!initialData) {
        return (
            <StandardPageLayout loading={true}>
                <div />
            </StandardPageLayout>
        )
    }

    const errorMessage = error instanceof Error ? error.message : (typeof error === 'string' ? error : undefined)

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
            <StandardPageLayout
                error={errorMessage}
                errorTitle="대시보드 데이터를 불러올 수 없습니다"
                errorActionLabel="새로고침"
                errorActionOnClick={() => window.location.reload()}
                maxWidth={{ xs: '100%', md: '1200px' }}
            >
            <Box ref={contentRef} sx={{ width: '100%', overflowX: 'hidden' }}>
                {/* 헤더: StandardPageLayout spacing으로 자동 간격 처리 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary', mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                            {shopName}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1rem' } }}>
                            오늘도 힘차게 비즈니스를 관리해 보세요.
                        </Typography>
                    </Box>
                    <IconButton 
                        onClick={() => setWidgetSettingsOpen(true)} 
                        aria-label="대시보드 위젯 설정"
                        sx={{ minWidth: { xs: 44, sm: 40 }, minHeight: { xs: 44, sm: 40 } }}
                    >
                        <Settings size={20} />
                    </IconButton>
                </Box>

                {/* 위젯들: StandardPageLayout spacing으로 자동 간격 처리 */}
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

                {/* Grid 내부 spacing은 컴포넌트 간 간격이므로 유지 */}
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
            </Box>
        </StandardPageLayout>
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
