'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import {
    LayoutDashboard,
    Users,
    Calendar,
    Package,
    Settings,
    Warehouse,
    DollarSign,
    MoreHorizontal,
    Code2,
} from 'lucide-react'
import { BottomSheet, BottomSheetHeader, BottomSheetBody } from '@/app/components/ui/BottomSheet'

const MAIN_NAV_ITEMS = [
    { label: '대시보드', value: '/dashboard', icon: LayoutDashboard },
    { label: '예약', value: '/appointments', icon: Calendar },
    { label: '고객', value: '/customers', icon: Users },
    { label: '재무', value: '/finance', icon: DollarSign },
]

const BASE_MORE_ITEMS = [
    { label: '상품', value: '/products', icon: Package },
    { label: '재고', value: '/inventory', icon: Warehouse },
    { label: '설정', value: '/settings', icon: Settings },
    { label: '개발자 화면', value: '/dev', icon: Code2 },
]
const MORE_NAV_ITEMS = BASE_MORE_ITEMS

export default function MobileBottomNav() {
    const pathname = usePathname()
    const router = useRouter()
    const [moreOpen, setMoreOpen] = useState(false)

    const isPublic =
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/signup' ||
        pathname === '/forgot-password' ||
        pathname?.startsWith('/reset-password') ||
        pathname === '/update-password'

    if (isPublic) return null

    const allItems = [...MAIN_NAV_ITEMS, ...MORE_NAV_ITEMS]
    const currentValue = allItems.find((item) => pathname?.startsWith(item.value))?.value || false
    const isMoreActive = MORE_NAV_ITEMS.some((item) => pathname?.startsWith(item.value))

    const handleMoreItemClick = (value: string) => {
        router.push(value)
        setMoreOpen(false)
    }

    return (
        <>
            <Paper
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: { xs: 'block', md: 'none' },
                    zIndex: 1100,
                    pb: 'env(safe-area-inset-bottom, 0px)',
                    pl: 'env(safe-area-inset-left, 0px)',
                    pr: 'env(safe-area-inset-right, 0px)',
                    borderTop: 1,
                    borderColor: 'divider',
                }}
                elevation={4}
            >
                <BottomNavigation
                    showLabels
                    value={isMoreActive ? 'more' : currentValue}
                    onChange={(_, newValue) => {
                        if (newValue === 'more') {
                            setMoreOpen(true)
                        } else {
                            router.push(newValue)
                        }
                    }}
                    sx={{
                        borderTop: 1,
                        borderColor: 'divider',
                        minHeight: { xs: 64, sm: 56 },
                        '& .MuiBottomNavigationAction-root': {
                            minWidth: { xs: 56, sm: 64 },
                            minHeight: 48,
                            paddingTop: 6,
                            paddingBottom: 6,
                        },
                        '& .MuiBottomNavigationAction-label': {
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            mt: 0.5,
                        },
                    }}
                >
                    {MAIN_NAV_ITEMS.map((item) => {
                        const Icon = item.icon
                        return (
                            <BottomNavigationAction
                                key={item.value}
                                label={item.label}
                                value={item.value}
                                icon={<Icon size={20} />}
                            />
                        )})}
                    <BottomNavigationAction
                        label="더보기"
                        value="more"
                        icon={<MoreHorizontal size={20} />}
                    />
                </BottomNavigation>
            </Paper>

            <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} maxHeight={50}>
                <BottomSheetHeader title="메뉴" onClose={() => setMoreOpen(false)} />
                <BottomSheetBody>
                    <List disablePadding>
                        {MORE_NAV_ITEMS.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname?.startsWith(item.value)
                            return (
                                <ListItemButton
                                    key={item.value}
                                    onClick={() => handleMoreItemClick(item.value)}
                                    sx={{ minHeight: 48, minWidth: 44, py: 1.5 }}
                                    selected={isActive}
                                    aria-label={`${item.label} 메뉴로 이동`}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <Icon size={20} />
                                    </ListItemIcon>
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            )
                        })}
                    </List>
                </BottomSheetBody>
            </BottomSheet>
        </>
    )
}
