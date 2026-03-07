'use client'

import { ReactNode } from 'react'
import { Container } from '@mui/material'

/**
 * 공통 페이지 컨테이너 컴포넌트
 * 
 * 모바일 우선 패딩과 maxWidth를 관리합니다.
 * - 모바일: 전체 너비, 작은 패딩
 * - 데스크탑: 최대 너비 제한, 큰 패딩
 */

type PageContainerProps = {
  children: ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
  className?: string
}

export default function PageContainer({
  children,
  maxWidth = 'lg',
  className = '',
}: PageContainerProps) {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 2, md: 3 },
        width: '100%',
        maxWidth: maxWidth === false ? '100%' : undefined,
        overflowX: 'hidden',
      }}
      className={className}
    >
      {children}
    </Container>
  )
}
