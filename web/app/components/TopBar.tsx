'use client'

import { Menu, Settings, ArrowLeft, Filter } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme, useMediaQuery } from '@mui/material'
import { usePWA } from '@/app/lib/hooks/usePWA'
import { usePageHeader } from '@/app/lib/contexts/PageHeaderContext'
import { getPageTitle } from '@/app/lib/utils/pageTitle'

export default function TopBar({ onMenu }: { onMenu?: () => void }) {
  const [userName, setUserName] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { isStandalone, isIOS } = usePWA()
  const { headerInfo } = usePageHeader()
  
  // 페이지 제목: Context에서 가져오거나 pathname에서 추출
  const pageTitle = isMobile 
    ? (headerInfo?.title || getPageTitle(pathname || ''))
    : null

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
        console.error('Failed to load user profile:', error)
      }
    }
    loadUserProfile()
  }, [])

  return (
    <AppBar
      position={isMobile ? 'fixed' : 'sticky'}
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        zIndex: theme.zIndex.appBar,
        // PWA standalone 모드: iOS status bar 높이 고려
        ...(isMobile && isStandalone && isIOS && {
          paddingTop: 'env(safe-area-inset-top)',
        }),
      }}
    >
      <Toolbar sx={{ 
        minHeight: { xs: 56, sm: 64 }, 
        px: { xs: 2, sm: 3, md: 4 },
        gap: 1,
        // PWA standalone 모드: status bar와 겹치지 않도록
        ...(isMobile && isStandalone && isIOS && {
          paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
        }),
      }}>
        {/* 모바일: 뒤로가기 또는 메뉴 버튼 */}
        {isMobile && (
          <>
            {headerInfo?.showBack !== false && (headerInfo?.onBack || headerInfo?.title) ? (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="뒤로가기"
                onClick={() => {
                  if (headerInfo?.onBack) {
                    headerInfo.onBack()
                  } else {
                    router.back()
                  }
                }}
                sx={{ 
                  mr: 0.5,
                  minWidth: '44px',
                  minHeight: '44px'
                }}
              >
                <ArrowLeft size={20} />
              </IconButton>
            ) : (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="메뉴 열기"
                onClick={onMenu}
                sx={{ 
                  mr: 2,
                  minWidth: '44px',
                  minHeight: '44px'
                }}
              >
                <Menu className="h-6 w-6" />
              </IconButton>
            )}
          </>
        )}

        {/* 데스크탑: 메뉴 버튼 없음 (사이드바 사용) */}

        {/* 아이콘 (페이지별) */}
        {isMobile && headerInfo?.icon && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mr: 1,
              color: 'primary.main',
            }}
          >
            {headerInfo.icon}
          </Box>
        )}

        {/* 페이지 제목 */}
        {isMobile && pageTitle && (
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontSize: '1rem',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            {pageTitle}
          </Typography>
        )}

        {/* 필터 버튼 (모바일, 페이지별) */}
        {isMobile && headerInfo?.onFilter && (
          <IconButton
            color="inherit"
            aria-label="필터"
            onClick={headerInfo.onFilter}
            sx={{
              minWidth: '44px',
              minHeight: '44px',
              position: 'relative',
            }}
          >
            <Filter size={20} />
            {headerInfo.filterBadge !== undefined && headerInfo.filterBadge > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                }}
              />
            )}
          </IconButton>
        )}

        {/* 액션 버튼들 (모바일, 페이지별) */}
        {isMobile && headerInfo?.actions && (
          <>
            {Array.isArray(headerInfo.actions)
              ? headerInfo.actions.map((action, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                    {action}
                  </Box>
                ))
              : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {headerInfo.actions}
                </Box>
              )}
          </>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* 사용자 정보 및 설정 (모바일) */}
        {isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {userName && !headerInfo?.title && (
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {userName}님
              </Typography>
            )}
            <IconButton
              component={Link}
              href="/settings"
              size="small"
              sx={{ 
                color: 'text.secondary',
                minWidth: '44px',
                minHeight: '44px'
              }}
              aria-label="설정"
            >
              <Settings size={20} />
            </IconButton>
          </Box>
        )}

        {/* 데스크탑: 사용자 정보 및 설정 */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {userName && (
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {userName}님
              </Typography>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}
