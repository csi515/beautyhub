'use client'

import { Typography } from '@mui/material'

interface PaginationInfoProps {
  totalItems: number
  page: number
  pageSize: number
  totalPages: number
  format?: 'compact' | 'detailed' | 'pages' // "총 N개" | "총 N개 · X-Y 표시" | "총 N명 · X / Y 페이지"
  itemLabel?: string // "명", "개", "건" 등 (기본값: "개")
  className?: string
}

/**
 * 페이지네이션 정보 표시 컴포넌트
 * 다양한 형식의 페이지네이션 정보를 일관되게 표시
 */
export default function PaginationInfo({
  totalItems,
  page,
  pageSize,
  totalPages,
  format = 'detailed',
  itemLabel = '개',
  className = '',
}: PaginationInfoProps) {
  const showingFrom = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const showingTo = Math.min(page * pageSize, totalItems)

  let text = ''

  switch (format) {
    case 'compact':
      text = `총 ${totalItems.toLocaleString()}${itemLabel}`
      break
    case 'detailed':
      text = `총 ${totalItems.toLocaleString()}${itemLabel} · ${showingFrom.toLocaleString()}-${showingTo.toLocaleString()} 표시`
      break
    case 'pages':
      text = `총 ${totalItems.toLocaleString()}${itemLabel} · ${page} / ${totalPages} 페이지`
      break
  }

  return (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{
        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
        textAlign: { xs: 'center', sm: 'left' },
        width: { xs: '100%', sm: 'auto' },
      }}
      className={className}
    >
      {text}
    </Typography>
  )
}
