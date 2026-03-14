'use client'

import { ReactNode } from 'react'
import { Box, useTheme } from '@mui/material'
import Card from '../ui/Card'

/**
 * 공통 페이지 리스트 컴포넌트
 * 
 * 모바일 카드 → 데스크탑 리스트 변환
 * - 모바일: 카드 형태로 표시
 * - 데스크탑: 리스트 형태로 표시
 */

type PageListProps = {
  children: ReactNode
  /** 모바일에서 카드로 표시할지 여부 (기본: true) */
  cardOnMobile?: boolean
  /** 리스트 아이템 간격 */
  spacing?: number
  className?: string
}

export default function PageList({
  children,
  cardOnMobile = true,
  spacing = 2,
  className = '',
}: PageListProps) {
  const theme = useTheme()
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
      }}
      className={className}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <Box
            key={index}
            sx={{
              // 모바일: 카드로 감싸기
              ...(cardOnMobile && {
                [theme.breakpoints.down('md')]: {
                  '& > *': {
                    borderRadius: theme.shape.borderRadius * 3, // rounded-xl
                    border: `1px solid ${theme.palette.divider}`,
                    p: 2.5,
                  },
                },
              }),
              // 데스크탑: 리스트 형태
              [theme.breakpoints.up('md')]: {
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: spacing,
                '&:last-child': {
                  borderBottom: 'none',
                },
              },
            }}
          >
            {cardOnMobile ? (
              <Card
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {child}
              </Card>
            ) : (
              child
            )}
            {/* 데스크탑에서는 원본 렌더링 */}
            <Box
              sx={{
                display: { xs: 'none', md: 'block' },
              }}
            >
              {child}
            </Box>
          </Box>
        ))
      ) : (
        children
      )}
    </Box>
  )
}
