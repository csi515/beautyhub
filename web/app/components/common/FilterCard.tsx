'use client'

import { ReactNode } from 'react'
import Card from '@/app/components/ui/Card'
import { Stack } from '@mui/material'

interface FilterCardProps {
  children: ReactNode
}

/**
 * 필터/검색 영역용 공통 Card 래퍼
 * 모든 페이지 필터 영역에 동일 스타일 적용
 */
export default function FilterCard({ children }: FilterCardProps) {
  return (
    <Card compact sx={{ borderRadius: 3 }}>
      <Stack spacing={1}>{children}</Stack>
    </Card>
  )
}
