'use client'

import { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'

type PageIntroProps = {
  description?: string
  count?: string | number
  children?: ReactNode
}

/**
 * 페이지 상단 컴팩트 인트로
 * TopBar 제목 아래 여백을 채우는 간단한 설명/컨텍스트 바
 */
export default function PageIntro({ description, count, children }: PageIntroProps) {
  if (!description && count === undefined && !children) return null

  return (
    <Box
      sx={{
        py: { xs: 0.25, sm: 0.5, md: 0.5 },
        px: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'nowrap',
        minWidth: 0,
      }}
    >
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0,
          }}
        >
          {description}
        </Typography>
      )}
      {count !== undefined && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {typeof count === 'number' ? `총 ${count.toLocaleString()}건` : String(count)}
        </Typography>
      )}
      {children}
    </Box>
  )
}
