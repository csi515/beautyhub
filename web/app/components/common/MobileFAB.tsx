'use client'

import { ReactNode } from 'react'
import { Fab } from '@mui/material'

interface MobileFABProps {
  icon: ReactNode
  label: string
  onClick: () => void
  color?: 'primary' | 'secondary' | 'default'
  size?: 'small' | 'medium' | 'large'
}

/**
 * 모바일 플로팅 액션 버튼 컴포넌트
 * 모바일에서만 표시되며, 하단 네비게이션과의 간격을 자동으로 조정합니다.
 */
export default function MobileFAB({
  icon,
  label,
  onClick,
  color = 'primary',
  size = 'medium',
}: MobileFABProps) {
  return (
    <Fab
      color={color}
      aria-label={label}
      size={size}
      onClick={onClick}
      sx={{
        position: 'fixed',
        bottom: {
          xs: 'calc(64px + env(safe-area-inset-bottom, 0px) + 16px)',
          md: 16,
        },
        right: 16,
        display: { xs: 'flex', md: 'none' },
        zIndex: 1099, // 하단 네비게이션(zIndex: 1100) 바로 아래
      }}
    >
      {icon}
    </Fab>
  )
}
