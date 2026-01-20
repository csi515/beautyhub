'use client'

import { ReactNode } from 'react'
import { Box, Stack, Alert, CircularProgress } from '@mui/material'
import EmptyState from '../ui/EmptyState'
import { AlertCircle, RefreshCw } from 'lucide-react'
import Button from '../ui/Button'

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
  spacing?: number
  maxWidth?: string | number | { xs?: string | number; sm?: string | number; md?: string | number; lg?: string | number; xl?: string | number }
  padding?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
  
  className?: string
}

/**
 * 표준 페이지 레이아웃 컴포넌트
 * 로딩, 에러, 빈 상태를 자동으로 처리하는 일관된 페이지 구조
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
  spacing = 3,
  maxWidth = { xs: '100%', sm: '100%', md: '90%', lg: '1200px', xl: '1400px' },
  padding = { xs: 1.5, sm: 2, md: 2.5, lg: 3, xl: 3 },
  className = '',
}: StandardPageLayoutProps) {
  // 로딩 상태
  if (loading) {
    return (
      <Box
        sx={{
          px: padding,
          py: 4,
          maxWidth: maxWidth as any,
          mx: 'auto',
          width: '100%',
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
          py: 4,
          maxWidth: maxWidth as any,
          mx: 'auto',
          width: '100%',
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
          py: 4,
          maxWidth: maxWidth as any,
          mx: 'auto',
          width: '100%',
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
        py: 4,
        maxWidth: typeof maxWidth === 'string' ? maxWidth : maxWidth,
        mx: 'auto',
        width: '100%',
        pb: { xs: 12, sm: 12, md: 4 }, // 모바일 하단 네비게이션 공간
      }}
      className={className}
    >
      <Stack spacing={spacing}>
        {children}
      </Stack>
    </Box>
  )
}
