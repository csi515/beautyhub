'use client'

import { ReactNode } from 'react'
import { Paper, Stack, Chip, useMediaQuery } from '@mui/material'
import { X } from 'lucide-react'
import Button from '../ui/Button'

export interface BulkAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'error'
  icon?: ReactNode
  disabled?: boolean
}

interface BulkActionBarProps {
  selectedCount: number
  selectedLabel?: string // "명의 고객이", "개의 제품이" 등 (기본값: "개 선택됨")
  actions?: BulkAction[]
  onClearSelection: () => void
  variant?: 'inline' | 'fixed' // inline: 페이지 내부, fixed: 하단 고정
  className?: string
}

/**
 * 일괄 작업 바 컴포넌트
 * 선택된 항목에 대한 일괄 작업을 수행할 수 있는 통합 UI
 */
export default function BulkActionBar({
  selectedCount,
  selectedLabel = '개 선택됨',
  actions = [],
  onClearSelection,
  variant = 'inline',
  className = '',
}: BulkActionBarProps) {
  const isSmallMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'))

  if (selectedCount === 0) return null

  const content = (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 1, sm: 1.5 }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
    >
      {/* 선택 정보 */}
      <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
        <Chip
          label={`${selectedCount}${selectedLabel}`}
          color="primary"
          onDelete={onClearSelection}
          deleteIcon={<X size={16} />}
          sx={{
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            height: { xs: '32px', sm: '36px' },
            '& .MuiChip-label': {
              px: { xs: 1.5, sm: 2 },
            },
          }}
        />
      </Stack>

      {/* 액션 버튼들 */}
      {actions.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            flexShrink: 0,
          }}
        >
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant === 'error' ? 'primary' : action.variant || 'secondary'}
              size={isSmallMobile ? 'sm' : 'md'}
              onClick={action.onClick}
              disabled={action.disabled}
              leftIcon={action.icon}
              fullWidth={isSmallMobile}
              sx={{
                whiteSpace: 'nowrap',
                ...(action.variant === 'error' && {
                  bgcolor: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                }),
              }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      )}
    </Stack>
  )

  // Fixed variant: 하단 고정
  if (variant === 'fixed') {
    return (
      <Paper
        elevation={6}
        sx={{
          position: 'fixed',
          bottom: {
            xs: `calc(64px + env(safe-area-inset-bottom, 0px) + 16px)`, // Mobile bottom nav height + padding
            md: 24,
          },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1100, // MobileBottomNav보다 높게
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          borderRadius: 3,
          minWidth: { xs: 'calc(100% - 32px)', sm: 400 },
          maxWidth: { xs: 'calc(100% - 32px)', sm: 600 },
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
        className={className}
      >
        {content}
      </Paper>
    )
  }

  // Inline variant: 페이지 내부
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: 3,
        borderRadius: 2,
        bgcolor: 'primary.light',
        border: '1px solid',
        borderColor: 'primary.main',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 2,
          bgcolor: 'primary.main',
          opacity: 0.05,
          zIndex: 0,
        },
        position: 'relative',
        zIndex: 1,
      }}
      className={className}
    >
      {content}
    </Paper>
  )
}
