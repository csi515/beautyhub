'use client'

import React, { useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'

import { useTheme } from '@mui/material'
import { useMediaQuery } from '@mui/material'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MobileBottomNav from './MobileBottomNav'
import OfflineIndicator from '../common/OfflineIndicator'
import PullToRefresh from '../ui/PullToRefresh'
import ScrollToTop from '../ui/ScrollToTop'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ''
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'))
  const isFullScreenPage =
    pathname !== '/dashboard' &&
    !pathname.startsWith('/dashboard') &&
    pathname !== '/settings' &&
    !pathname.startsWith('/settings')

  const isPublic =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname.startsWith('/reset-password') ||
    pathname === '/update-password' ||
    pathname === '/features' ||
    pathname.startsWith('/guides') ||
    pathname === '/faq' ||
    pathname === '/privacy-policy' ||
    pathname === '/terms-of-service'

  const [navOpen, setNavOpen] = useState(false)
  const mainScrollRef = useRef<HTMLDivElement>(null)

  // Collapse state for desktop with localStorage persistence
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed')
      return saved === 'true'
    }
    return false
  })

  const toggleCollapse = () => {
    const newState = !collapsed
    setCollapsed(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', String(newState))
    }
  }

  // ESC key handler is handled by MUI Modal/Drawer by default for mobile

  if (isPublic) {
    return (
      <Box
        component="main"
        sx={{
          height: { xs: '100dvh', md: 'auto' },
          minHeight: { xs: '100dvh', md: '100vh' },
          overflowY: { xs: 'auto', md: 'visible' },
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {children}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
        />
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={navOpen}
          onClose={() => setNavOpen(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 288 },
          }}
        >
          <Sidebar mobile onNavigate={() => setNavOpen(false)} />
        </Drawer>
      )}

      {/* Main Content */}
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        ml: { xs: 0, md: collapsed ? '60px' : '192px' },
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}>
        <TopBar onMenu={() => setNavOpen(true)} />
        <Box
          ref={mainScrollRef}
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: { md: 'calc(100vh - 64px)' },
            minHeight: 0,
            minWidth: 0,
            pt: isTablet && isFullScreenPage
              ? 0
              : { xs: 'max(1rem, env(safe-area-inset-top, 0px))', sm: 1, md: 1.25, lg: 1.5 },
            pr: isTablet && isFullScreenPage
              ? 0
              : { xs: 'max(0.75rem, env(safe-area-inset-right, 0px))', sm: 0.75, md: 1, lg: 1.5 },
            pb: isTablet && isFullScreenPage
              ? 0
              : {
                  xs: 'calc(72px + env(safe-area-inset-bottom, 0px))',
                  md: 1.25,
                  lg: 1.5,
                  xl: 2,
                },
            pl: isTablet && isFullScreenPage
              ? 0
              : { xs: 'max(0.75rem, env(safe-area-inset-left, 0px))', sm: 0.75, md: 1, lg: 1.5 },
            overflowX: 'hidden',
            overflowY: 'auto',
            width: '100%',
            maxWidth: '100%',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 1.5, sm: 2, md: 2, lg: 2.5 },
            flex: { md: 1 },
            minHeight: { md: 0 },
            overflow: 'visible',
          }}>
            {isMobile ? (
              <PullToRefresh>
                {children}
              </PullToRefresh>
            ) : (
              children
            )}
          </Box>
        </Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* ScrollToTop - 긴 목록 페이지에서 상단 이동 버튼 */}
      <ScrollToTop scrollContainerRef={mainScrollRef} className="!bottom-20 md:!bottom-8" />
    </Box>
  )
}
