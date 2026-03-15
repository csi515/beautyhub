'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Package,
  Users,
  DollarSign,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  Code2,
} from 'lucide-react'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Tooltip,
  Paper,
  useTheme,
  alpha
} from '@mui/material'
import { useIsAdmin } from '@/app/lib/hooks/useUserRole'
import { useShopName } from '@/app/lib/hooks/useShopName'

type Item = {
  href: string
  label: string
  icon: React.ElementType
  disabled?: boolean
}

const baseItems: Item[] = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/appointments', label: '예약', icon: Calendar },
  { href: '/products', label: '상품', icon: Package },
  { href: '/inventory', label: '재고', icon: Warehouse },
  { href: '/customers', label: '고객', icon: Users },
  { href: '/finance', label: '재무', icon: DollarSign },
  { href: '/settings', label: '설정', icon: Settings },
  { href: '/dev', label: '개발자 화면', icon: Code2 },
]

const items =
  process.env.NODE_ENV === 'development'
    ? baseItems
    : baseItems.filter((item) => item.href !== '/dev')

type Props = {
  mobile?: boolean
  onNavigate?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export default function Sidebar({
  mobile = false,
  onNavigate,
  collapsed = false,
  onToggleCollapse
}: Props = {}) {
  const pathname = usePathname()
  const isAdmin = useIsAdmin()
  const theme = useTheme()
  const shopName = useShopName()

  const sidebarWidth = collapsed ? 60 : 192

  return (
    <Paper
      component="aside"
      elevation={0}
      sx={{
        position: mobile ? 'relative' : 'fixed',
        top: 0,
        left: 0,
        width: mobile ? 288 : sidebarWidth,
        flexShrink: 0,
        display: mobile ? 'flex' : { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        height: '100vh',
        borderRight: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        overflowX: 'hidden',
        zIndex: theme.zIndex.drawer,
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 64,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
          {!collapsed && (
            <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Typography variant="subtitle1" fontWeight="bold" noWrap color="text.primary">
                {shopName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                운영 대시보드
              </Typography>
            </Box>
          )}
        </Box>
        {!mobile && onToggleCollapse && (
          <IconButton
            onClick={onToggleCollapse}
            size="small"
            aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
            sx={{
              ml: collapsed ? 'auto' : 0,
              mr: collapsed ? 'auto' : 0
            }}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </IconButton>
        )}
      </Box>

      {/* 네비게이션 */}
      <List
        component="nav"
        sx={{
          flex: 1,
          px: 1,
          py: 2,
          overflowY: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {items.map((item) => {
          const active = !item.disabled && (item.href === '/'
            ? pathname === '/'
            : pathname?.startsWith(item.href))
          const Icon = item.icon

          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip
                title={item.disabled ? (collapsed ? `${item.label} (준비 중)` : '준비 중') : (collapsed ? item.label : '')}
                placement="right"
                arrow
              >
                <span style={{ width: '100%' }}>
                  {/* @ts-expect-error - Next.js Link component type mismatch with MUI */}
                  <ListItemButton
                    component={item.disabled ? 'div' : Link}
                    href={item.disabled ? undefined : item.href}
                    onClick={item.disabled ? undefined : onNavigate}
                    selected={active}
                    disabled={item.disabled}
                    sx={{
                      minHeight: 44,
                      justifyContent: collapsed ? 'center' : 'initial',
                      borderRadius: 2,
                      px: 1.5,
                      color: active ? 'primary.main' : 'text.primary',
                      bgcolor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      opacity: item.disabled ? 0.4 : 1,
                      cursor: item.disabled ? 'not-allowed' : 'pointer',
                      '&:hover': {
                        bgcolor: item.disabled
                          ? 'transparent'
                          : active
                            ? alpha(theme.palette.primary.main, 0.12)
                            : alpha(theme.palette.text.primary, 0.04),
                      },
                      '&.Mui-disabled': {
                        opacity: 0.4,
                        pointerEvents: 'none',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: collapsed ? 0 : 1.5,
                        justifyContent: 'center',
                        color: active ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      <Icon size={20} />
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: active ? 600 : 400
                        }}
                      />
                    )}
                    {active && !collapsed && (
                      <Box
                        sx={{
                          width: 4,
                          height: 32,
                          bgcolor: 'primary.main',
                          position: 'absolute',
                          right: 0,
                          borderTopLeftRadius: 4,
                          borderBottomLeftRadius: 4
                        }}
                      />
                    )}
                  </ListItemButton>
                </span>
              </Tooltip>
            </ListItem>
          )
        })}

        {/* 관리자 메뉴 */}
        {isAdmin && (
          <>
            <Divider sx={{ my: 1, mx: 1 }} />
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed ? '사용자 관리' : ''} placement="right" arrow>
                {/* @ts-expect-error - Next.js Link component type mismatch with component prop */}
                <ListItemButton
                  component={Link}
                  href="/admin"
                  onClick={onNavigate}
                  selected={pathname?.startsWith('/admin')}
                  sx={{
                    minHeight: 44,
                    justifyContent: collapsed ? 'center' : 'initial',
                    borderRadius: 2,
                    px: 1.5,
                    color: pathname?.startsWith('/admin') ? 'primary.main' : 'text.primary',
                    bgcolor: pathname?.startsWith('/admin') ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    '&:hover': {
                      bgcolor: pathname?.startsWith('/admin')
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.text.primary, 0.04),
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 1.5,
                      justifyContent: 'center',
                      color: pathname?.startsWith('/admin') ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <Shield size={20} />
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary="사용자 관리"
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: pathname?.startsWith('/admin') ? 600 : 400
                      }}
                    />
                  )}
                  {pathname?.startsWith('/admin') && !collapsed && (
                    <Box
                      sx={{
                        width: 4,
                        height: 32,
                        bgcolor: 'primary.main',
                        position: 'absolute',
                        right: 0,
                        borderTopLeftRadius: 4,
                        borderBottomLeftRadius: 4
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </>
        )}
      </List>

    </Paper>
  )
}
