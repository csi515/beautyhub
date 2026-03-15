'use client'

import { ReactNode } from 'react'
import { Container, useTheme, useMediaQuery } from '@mui/material'

/**
 * 공통 페이지 컨테이너 컴포넌트
 *
 * 모바일 우선 패딩과 maxWidth를 관리합니다.
 * - 모바일: 전체 너비, 작은 패딩
 * - 데스크탑: 최대 너비 제한, 큰 패딩
 * - fullScreenOnTablet: 태블릿(md~lg)에서 패딩 제거, 화면 꽉 채움
 */

type PageContainerProps = {
  children: ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
  fullScreenOnTablet?: boolean
  className?: string
}

export default function PageContainer({
  children,
  maxWidth = 'xl',
  fullScreenOnTablet = false,
  className = '',
}: PageContainerProps) {
  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'))
  const useFullScreen = fullScreenOnTablet && isTablet

  return (
    <Container
      maxWidth={useFullScreen ? false : maxWidth}
      disableGutters
      sx={{
        py: useFullScreen ? 0 : { xs: 1, sm: 1.5, md: 1.5, lg: 2 },
        px: useFullScreen ? 0 : { xs: 0.5, sm: 0.75, md: 1, lg: 1.5 },
        width: '100%',
        maxWidth: useFullScreen || maxWidth === false ? '100%' : undefined,
        minWidth: 0,
        display: { md: 'flex' },
        flexDirection: { md: 'column' },
        flex: { md: 1 },
        minHeight: { md: 0 },
      }}
      className={className}
    >
      {children}
    </Container>
  )
}
