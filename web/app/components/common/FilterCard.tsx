'use client'

import { ReactNode } from 'react'
import Card from '@/app/components/ui/Card'
import { Stack } from '@mui/material'

interface FilterCardProps {
  children: ReactNode
}

/**
 * 검색/조건 영역용 공통 Card 래퍼
 * 모든 페이지 검색 영역에 동일 스타일 적용
 */
export default function FilterCard({ children }: FilterCardProps) {
  return (
    <Card compact sx={{ borderRadius: 3, bgcolor: 'background.paper', p: { xs: 1.5, sm: 2, md: 2 } }}>
      <Stack spacing={{ xs: 1.5, sm: 2, md: 2 }}>{children}</Stack>
    </Card>
  )
}
