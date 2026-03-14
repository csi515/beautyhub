'use client'

import { ReactNode } from 'react'
import { Grid, GridProps } from '@mui/material'

/**
 * 공통 페이지 그리드 컴포넌트
 * 
 * 모바일 1열 → 데스크탑 다열 자동 변환
 * - 모바일: xs={12} (전체 너비)
 * - 데스크탑: 지정된 크기 사용
 */

type PageGridProps = Omit<GridProps, 'container' | 'item'> & {
  children: ReactNode
  /** 모바일에서의 열 수 (기본: 1) */
  mobileColumns?: 1 | 2
  /** 데스크탑에서의 열 수 (기본: 2) */
  desktopColumns?: 2 | 3 | 4
}

export default function PageGrid({
  children,
  mobileColumns = 1,
  desktopColumns = 2,
  spacing = { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
  ...rest
}: PageGridProps) {
  // 모바일 열 크기 계산
  const mobileSize = mobileColumns === 1 ? 12 : 6
  
  // 데스크탑 열 크기 계산
  const desktopSize = desktopColumns === 2 ? 6 : desktopColumns === 3 ? 4 : 3
  
  return (
    <Grid
      container
      spacing={spacing}
      sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
      }}
      {...rest}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <Grid
            item
            key={index}
            xs={mobileSize}
            sm={mobileSize}
            md={desktopSize}
            sx={{
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
            }}
          >
            {child}
          </Grid>
        ))
      ) : (
        <Grid
          item
          xs={mobileSize}
          sm={mobileSize}
          md={desktopSize}
          sx={{
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
          }}
        >
          {children}
        </Grid>
      )}
    </Grid>
  )
}
