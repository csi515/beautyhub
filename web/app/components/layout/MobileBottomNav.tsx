'use client'

import { usePathname, useRouter } from 'next/navigation'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Paper from '@mui/material/Paper'
import {
    LayoutDashboard,
    Users,
    Calendar,
    Package,
    Settings
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
        { label: '제품', value: '/products', icon: Package },
        { label: '설정', value: '/settings', icon: Settings },
    ]

    const currentValue = navItems.find((item) => pathname?.startsWith(item.value))?.value || false

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                display: { xs: 'block', md: 'none' },
                zIndex: 1100,
                pb: 'env(safe-area-inset-bottom, 0px)',
            }}
            elevation={8}
        >
            <BottomNavigation
                showLabels
                value={currentValue}
                onChange={(_, newValue) => {
                    router.push(newValue)
                }}
                sx={{
                    borderTop: 1,
                    borderColor: 'divider',
                    minHeight: { xs: 64, sm: 56 },
                    '& .MuiBottomNavigationAction-root': {
                        minWidth: 64,
                        minHeight: 48,
                        paddingTop: 6,
                        paddingBottom: 6,
                    },
                    '& .MuiBottomNavigationAction-label': {
                        fontSize: { xs: '0.7rem', sm: '0.65rem' },
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
                        />
                    )
                })}
            </BottomNavigation>
        </Paper>
    )
}
