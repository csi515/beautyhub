'use client'

import { Menu, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '../ui/LogoutButton'
import AlertsPopover from '../features/dashboard/AlertsPopover'
import { useShopName } from '@/app/lib/hooks/useShopName'
import { useEffect, useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material'
import { useAppToast } from '@/app/lib/ui/toast'
import { logger } from '@/app/lib/utils/logger'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': '', // useShopName으로 대체
  '/customers': '고객 관리',
  '/finance': '재무 관리',
  '/products': '상품 관리',
  '/inventory': '재고 관리',
  '/appointments': '예약 관리',
  '/analytics': '고객 분석',
  '/settings': '설정',
  '/projects': '프로젝트',
  '/admin/users': '사용자 승인 관리',
  '/dev': '개발자 화면',
}

function getPageTitle(pathname: string): string {
  if (pathname === '/dashboard') return ''
  const exact = PAGE_TITLES[pathname]
  if (exact) return exact
  if (pathname.startsWith('/projects/') && pathname !== '/projects') return '프로젝트 상세'
  return 'BeautyHub'
}

export default function TopBar({ onMenu }: { onMenu?: () => void }) {
  const [userName, setUserName] = useState<string | null>(null)
  const theme = useTheme()
  const toast = useAppToast()
  const pathname = usePathname() || ''
  const shopName = useShopName()
  const baseTitle = getPageTitle(pathname)
  const pageTitle = pathname === '/dashboard' ? shopName : baseTitle

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await fetch('/api/user/me')
        if (response.ok) {
          const data = await response.json()
          const profile = data.profile
          if (profile?.name) {
            setUserName(profile.name)
          } else if (profile?.email) {
            setUserName(profile.email.split('@')[0])
          }
        }
      } catch (error) {
        logger.error('Failed to load user profile', error, 'TopBar')
        toast.error('프로필을 불러오는데 실패했습니다.')
      }
    }
    loadUserProfile()
  }, [])

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        zIndex: theme.zIndex.appBar,
        backdropFilter: 'saturate(180%) blur(8px)',
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64 },
          pt: 'env(safe-area-inset-top, 0px)',
          px: { xs: 2, sm: 3, md: 4 },
          pl: { xs: 'calc(16px + env(safe-area-inset-left, 0px))', sm: 'calc(24px + env(safe-area-inset-left, 0px))', md: 'calc(32px + env(safe-area-inset-left, 0px))' },
          pr: { xs: 'calc(16px + env(safe-area-inset-right, 0px))', sm: 'calc(24px + env(safe-area-inset-right, 0px))', md: 'calc(32px + env(safe-area-inset-right, 0px))' },
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          aria-label="메뉴 열기"
          onClick={onMenu}
          sx={{
            mr: 1.5,
            display: { xs: 'inline-flex', md: 'none' },
            minWidth: 44,
            minHeight: 44,
          }}
        >
          <Menu className="h-6 w-6" />
        </IconButton>

        <Typography
          component="h1"
          variant="h6"
          fontWeight={700}
          color="text.primary"
          sx={{
            fontSize: { xs: '1rem', sm: '1.125rem' },
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
        >
          {pageTitle}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <AlertsPopover />
          {userName && (
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ whiteSpace: 'nowrap' }}>
              {userName}님
            </Typography>
          )}
          <LogoutButton compact />
          <IconButton
            component={Link}
            href="/settings"
            size="small"
            sx={{ 
              display: { xs: 'flex', md: 'none' }, 
              color: 'text.secondary',
              minWidth: 44,
              minHeight: 44,
            }}
            aria-label="설정"
          >
            <Settings size={20} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
