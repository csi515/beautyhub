'use client'

import { usePathname, useRouter } from 'next/navigation'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Paper from '@mui/material/Paper'
import {
    LayoutDashboard,
    Users,
    Calendar,
    DollarSign,
    Package
} from 'lucide-react'

export default function MobileBottomNav() {
    const pathname = usePathname()
    const router = useRouter()

    // Don't show on public pages
    const isPublic =
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/signup' ||
        pathname === '/forgot-password' ||
        pathname?.startsWith('/reset-password') ||
        pathname === '/update-password'

    if (isPublic) return null

    const navItems = [
        { label: '대시보드', value: '/dashboard', icon: LayoutDashboard },
        { label: '고객', value: '/customers', icon: Users },
        { label: '예약', value: '/appointments', icon: Calendar },
        { label: '재무', value: '/finance', icon: DollarSign },
        { label: '제품', value: '/products', icon: Package },
    ]

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                display: { xs: 'block', md: 'none' },
                zIndex: 1100,
                // Safe Area 대응 - 노치/홈 인디케이터와 겹치지 않도록
                paddingBottom: { xs: 'calc(env(safe-area-inset-bottom) + 0px)', sm: 0 },
            }}
            elevation={8}
        >
            <BottomNavigation
                showLabels
                value={pathname}
                onChange={(_, newValue) => {
                    router.push(newValue)
                }}
                aria-label="하단 네비게이션"
                sx={{
                    borderTop: 1,
                    borderColor: 'divider',
                    minHeight: { xs: '64px', sm: '56px' }, // 모바일에서 더 큰 터치 타겟
                    '& .MuiBottomNavigationAction-root': {
                        minWidth: 60,
                        px: 0,
                        minHeight: { xs: '44px', sm: '40px' },
                        paddingTop: { xs: '6px', sm: '4px' },
                        paddingBottom: { xs: '6px', sm: '4px' },
                    },
                    '& .MuiBottomNavigationAction-label': {
                        fontSize: { xs: '0.75rem', sm: '0.65rem' },
                        mt: 0.5,
                    },
                }}
            >
                {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <BottomNavigationAction
                            key={item.value}
                            label={item.label}
                            value={item.value}
                            icon={<Icon size={20} />}
                            aria-label={`${item.label}로 이동`}
                        />
                    )
                })}
            </BottomNavigation>
        </Paper>
    )
}
