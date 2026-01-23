'use client'

import { ReactNode } from 'react'
import { Box, Stack, Alert, CircularProgress, useTheme, useMediaQuery } from '@mui/material'
import EmptyState from '../ui/EmptyState'
import { AlertCircle, RefreshCw } from 'lucide-react'
import Button from '../ui/Button'

// 모바일 AppBar 및 BottomNav 높이 상수
const MOBILE_APP_BAR_HEIGHT = { xs: 56, sm: 64 } // TopBar 높이 (단일 AppBar)
const MOBILE_BOTTOM_NAV_HEIGHT = 64 // BottomNavigation 높이

type StandardPageLayoutProps = {
  // 상태
  loading?: boolean
  error?: string | null
  empty?: boolean
  
  // 콘텐츠
  children: ReactNode
  
  // Empty State
  emptyTitle?: string
  emptyDescription?: string
  emptyActionLabel?: string
  emptyActionOnClick?: () => void
  
  // Error State
  errorTitle?: string
  errorActionLabel?: string
  errorActionOnClick?: () => void
  
  // 레이아웃
  spacing?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
  maxWidth?: string | number | { xs?: string | number; sm?: string | number; md?: string | number; lg?: string | number; xl?: string | number }
  padding?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
  
  className?: string
}

/**
 * 표준 페이지 레이아웃 컴포넌트
 * 
 * 책임:
 * - 페이지 레벨 padding (좌우, 상하)
 * - 섹션 간 spacing (children을 Stack으로 감싸서)
 * - 모바일: AppBar/BottomNav 높이 고려한 paddingTop/Bottom
 * - maxWidth 제한
 * - 로딩/에러/빈 상태 처리
 * 
 * AppShell과의 역할 분리:
 * - AppShell: 화면 전체 구조, 스크롤 제어, safe-area-inset
 * - StandardPageLayout: 페이지 레벨 padding/spacing, 콘텐츠 레이아웃
 */
export default function StandardPageLayout({
  loading = false,
  error = null,
  empty = false,
  children,
  emptyTitle = '데이터가 없습니다',
  emptyDescription,
  emptyActionLabel,
  emptyActionOnClick,
  errorTitle = '오류가 발생했습니다',
  errorActionLabel = '다시 시도',
  errorActionOnClick,
  spacing = { xs: 1, sm: 1.5, md: 3 },
  maxWidth = { xs: '100%', sm: '100%', md: '90%', lg: '1200px', xl: '1400px' },
  padding = { xs: 1.5, sm: 2, md: 2.5, lg: 3, xl: 3 },
  className = '',
}: StandardPageLayoutProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  // 로딩 상태
  if (loading) {
    return (
      <Box
        sx={{
          px: padding,
          maxWidth: maxWidth as any,
          mx: 'auto',
          width: '100%',
          // 모바일: AppBar/BottomNav 높이 고려한 paddingTop/Bottom
          // 데스크탑: 기본 padding만 적용
          ...(isMobile ? {
            paddingTop: { 
              xs: `calc(${MOBILE_APP_BAR_HEIGHT.xs}px + ${theme.spacing(1)})`, 
              sm: `calc(${MOBILE_APP_BAR_HEIGHT.sm}px + ${theme.spacing(1)})` 
            },
            paddingBottom: `calc(${MOBILE_BOTTOM_NAV_HEIGHT}px + ${theme.spacing(1)})`,
          } : {
            pt: { xs: 2, sm: 2.5, md: 3 },
            pb: { xs: 2, sm: 2.5, md: 3 },
          }),
        }}
        className={className}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Box>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <Box
        sx={{
          px: padding,
          maxWidth: maxWidth as any,
          mx: 'auto',
          width: '100%',
          // 모바일: AppBar/BottomNav 높이 고려한 paddingTop/Bottom
          // 데스크탑: 기본 padding만 적용
          ...(isMobile ? {
            paddingTop: { 
              xs: `calc(${MOBILE_APP_BAR_HEIGHT.xs}px + ${theme.spacing(1)})`, 
              sm: `calc(${MOBILE_APP_BAR_HEIGHT.sm}px + ${theme.spacing(1)})` 
            },
            paddingBottom: `calc(${MOBILE_BOTTOM_NAV_HEIGHT}px + ${theme.spacing(1)})`,
          } : {
            pt: { xs: 2, sm: 2.5, md: 3 },
            pb: { xs: 2, sm: 2.5, md: 3 },
          }),
        }}
        className={className}
      >
        <Alert
          severity="error"
          icon={<AlertCircle size={20} />}
          action={
            errorActionOnClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={errorActionOnClick}
                leftIcon={<RefreshCw size={16} />}
              >
                {errorActionLabel}
              </Button>
            )
          }
          sx={{ mb: 2 }}
        >
          <strong>{errorTitle}</strong>
          <Box sx={{ mt: 1 }}>{error}</Box>
        </Alert>
      </Box>
    )
  }

  // 빈 상태
  if (empty) {
    return (
      <Box
        sx={{
          px: padding,
          maxWidth: maxWidth as any,
          mx: 'auto',
          width: '100%',
          // 모바일: AppBar/BottomNav 높이 고려한 paddingTop/Bottom
          // 데스크탑: 기본 padding만 적용
          ...(isMobile ? {
            paddingTop: { 
              xs: `calc(${MOBILE_APP_BAR_HEIGHT.xs}px + ${theme.spacing(1)})`, 
              sm: `calc(${MOBILE_APP_BAR_HEIGHT.sm}px + ${theme.spacing(1)})` 
            },
            paddingBottom: `calc(${MOBILE_BOTTOM_NAV_HEIGHT}px + ${theme.spacing(1)})`,
          } : {
            pt: { xs: 2, sm: 2.5, md: 3 },
            pb: { xs: 2, sm: 2.5, md: 3 },
          }),
        }}
        className={className}
      >
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={emptyActionOnClick}
        />
      </Box>
    )
  }

  // 일반 콘텐츠
  return (
    <Box
      sx={{
        px: padding,
        maxWidth: typeof maxWidth === 'string' ? maxWidth : maxWidth,
        mx: 'auto',
        width: '100%',
        // 모바일: AppBar/BottomNav 높이 고려한 paddingTop/Bottom
        // - paddingTop: AppBar 높이 + 최소 여백(8px)
        // - paddingBottom: BottomNav 높이 + 최소 여백(8px)
        // 데스크탑: 기본 padding만 적용
        ...(isMobile ? {
          paddingTop: { 
            xs: `calc(${MOBILE_APP_BAR_HEIGHT.xs}px + ${theme.spacing(1)})`, 
            sm: `calc(${MOBILE_APP_BAR_HEIGHT.sm}px + ${theme.spacing(1)})` 
          },
          paddingBottom: `calc(${MOBILE_BOTTOM_NAV_HEIGHT}px + ${theme.spacing(1)})`,
        } : {
          pt: { xs: 2, sm: 2.5, md: 3 },
          pb: { xs: 2, sm: 2.5, md: 3 },
        }),
      }}
      className={className}
    >
      {/* 섹션 간 간격: StandardPageLayout이 책임 */}
      <Stack spacing={spacing}>
        {children}
      </Stack>
    </Box>
  )
}
