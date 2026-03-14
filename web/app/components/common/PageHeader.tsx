'use client'

import { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'
import { Plus } from 'lucide-react'
import Button from '@/app/components/ui/Button'

type PageHeaderProps = {
  title?: string
  icon?: ReactNode
  className?: string
}

/**
 * 페이지 헤더 컴포넌트
 * 제목과 아이콘만 표시하여 공간 효율 극대화
 */
export default function PageHeader({
  title,
  icon,
  className = '',
}: PageHeaderProps) {
  return (
    <Box
      className={className}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        boxShadow: 1,
        p: { xs: 2, sm: 2.5 },
      }}
    >
      {(title || icon) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
          {icon && (
            <Box sx={{ flexShrink: 0, color: 'primary.main' }}>{icon}</Box>
          )}
          {title && (
            <Typography component="h1" variant="h6" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
              {title}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  )
}

/**
 * 액션 버튼 생성 헬퍼 (FilterBar 등에서 사용)
 */
export function createActionButton(
  label: string,
  onClick: () => void,
  variant: 'primary' | 'secondary' = 'primary',
  icon: ReactNode = <Plus className="h-4 w-4" />,
  disabled: boolean = false
) {
  return (
    <Button
      variant={variant}
      size="md"
      leftIcon={icon}
      onClick={onClick}
      disabled={disabled}
      className="w-full sm:w-auto"
    >
      {label}
    </Button>
  )
}
