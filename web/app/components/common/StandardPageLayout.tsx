'use client'

import { ReactNode } from 'react'
import { Box, Stack, Alert, CircularProgress } from '@mui/material'
import EmptyState from '../ui/EmptyState'
import { AlertCircle, RefreshCw } from 'lucide-react'
import Button from '../ui/Button'
import { useResponsiveLayout } from '../../lib/hooks/useResponsiveLayout'

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
 * - 페이지 레벨 padding (좌우 px, 상하는 모바일/데스크탑 분기)
 * - 섹션 간 spacing (children을 Stack으로 감싸서 자동 간격 제공)
 * - 모바일: AppBar/BottomNav 높이 고려한 paddingTop/Bottom (calc 사용)
 * - 데스크탑: 기본 pt/pb 적용
 * - maxWidth 제한
 * - 로딩/에러/빈 상태 처리
 * 
 * AppShell과의 역할 분리:
 * - AppShell: 화면 전체 구조, 스크롤 제어, safe-area-inset
 * - StandardPageLayout: 페이지 레벨 padding/spacing, 콘텐츠 레이아웃
 * 
 * 주의:
 * - py (padding-y)는 사용하지 않음. 모바일과 데스크탑의 paddingTop/Bottom 로직이 다르기 때문
 * - 모바일: paddingTop/Bottom을 calc로 AppBar/BottomNav 높이 + 여백 계산
 * - 데스크탑: pt/pb를 breakpoint별로 직접 지정
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
  spacing = { xs: 0.5, sm: 1, md: 2.5, lg: 3 },
  maxWidth = { xs: '100%', sm: '100%', md: '90%', lg: '1200px', xl: '1400px' },
  padding = { xs: 1.5, sm: 2, md: 2.5, lg: 3, xl: 3 },
  className = '',
}: StandardPageLayoutProps) {
  const layout = useResponsiveLayout({
    spacing: typeof spacing === 'number' ? { xs: spacing } : (spacing as { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }),
    maxWidth: maxWidth as string | number | { xs?: string | number; sm?: string | number; md?: string | number; lg?: string | number; xl?: string | number },
    padding: padding as { xs?: number; sm?: number; md?: number; lg?: number; xl?: number },
  })

  // 로딩 상태
  if (loading) {
    return (
      <Box
        sx={{
          px: layout.paddingX as any,
          maxWidth: layout.maxWidth as any,
          mx: 'auto',
          width: '100%',
          pt: layout.paddingTop,
          pb: layout.paddingBottom,
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
          px: layout.paddingX as any,
          maxWidth: layout.maxWidth as any,
          mx: 'auto',
          width: '100%',
          pt: layout.paddingTop,
          pb: layout.paddingBottom,
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
          px: layout.paddingX as any,
          maxWidth: layout.maxWidth as any,
          mx: 'auto',
          width: '100%',
          pt: layout.paddingTop,
          pb: layout.paddingBottom,
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
        px: layout.paddingX as any,
        maxWidth: typeof layout.maxWidth === 'string' ? layout.maxWidth : layout.maxWidth,
        mx: 'auto',
        width: '100%',
        pt: layout.paddingTop,
        pb: layout.paddingBottom,
      }}
      className={className}
    >
      {/* 섹션 간 간격: StandardPageLayout이 책임 */}
      <Stack spacing={layout.spacing as any}>
        {children}
      </Stack>
    </Box>
  )
}
