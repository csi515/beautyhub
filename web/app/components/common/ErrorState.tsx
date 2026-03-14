'use client'

import { AlertCircle } from 'lucide-react'
import { Box, Typography } from '@mui/material'
import Button from '../ui/Button'

type ErrorStateProps = {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

/**
 * 에러 상태 컴포넌트
 * 일관된 에러 표시 및 재시도 기능
 */
export default function ErrorState({
  title = '오류가 발생했습니다',
  message,
  onRetry,
  retryLabel = '다시 시도',
  className = '',
}: ErrorStateProps) {
  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 2,
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          maxWidth: 400,
          p: 3,
          borderRadius: 3,
          bgcolor: 'error.50',
          border: '1px solid',
          borderColor: 'error.200',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'error.main',
              color: 'error.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertCircle size={24} strokeWidth={2} />
          </Box>
        </Box>
        <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
          {message}
        </Typography>
        {onRetry && (
          <Button variant="primary" onClick={onRetry} size="md">
            {retryLabel}
          </Button>
        )}
      </Box>
    </Box>
  )
}

