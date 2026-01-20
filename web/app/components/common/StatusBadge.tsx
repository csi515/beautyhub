'use client'

import { ReactNode } from 'react'
import { Chip, ChipProps } from '@mui/material'
import { AlertTriangle, TrendingDown, CheckCircle, XCircle, DollarSign, Minus, Clock, FileCheck } from 'lucide-react'

export type StatusType =
  // 재고 상태
  | 'out_of_stock' // 품절
  | 'low_stock' // 재고 부족
  | 'normal' // 정상
  // 재무 상태
  | 'income' // 수입
  | 'expense' // 지출
  // 급여 상태
  | 'paid' // 지급완료
  | 'approved' // 승인완료
  | 'calculated' // 계산완료
  | 'not_calculated' // 미계산
  // 직원 상태
  | 'office' // 출근
  | 'away' // 휴무
  | 'off_duty' // 퇴근
  // 일반
  | 'active' // 활성
  | 'inactive' // 비활성
  | 'pending' // 대기중

interface StatusBadgeProps {
  status: StatusType | string
  label?: string // 커스텀 레이블 (지정 시 status 무시)
  icon?: ReactNode // 커스텀 아이콘
  size?: 'small' | 'medium'
  variant?: 'filled' | 'outlined'
  onClick?: () => void
  className?: string
}

/**
 * 상태 배지 컴포넌트
 * 다양한 상태 타입에 대한 일관된 UI 제공
 */
export default function StatusBadge({
  status,
  label,
  icon,
  size = 'small',
  variant = 'filled',
  onClick,
  className = '',
}: StatusBadgeProps) {
  // 상태별 설정
  const statusConfig: Record<
    string,
    {
      label: string
      color: ChipProps['color']
      defaultIcon?: ReactNode
    }
  > = {
    // 재고 상태
    out_of_stock: {
      label: '품절',
      color: 'error',
      defaultIcon: <TrendingDown size={16} />,
    },
    low_stock: {
      label: '재고 부족',
      color: 'warning',
      defaultIcon: <AlertTriangle size={16} />,
    },
    normal: {
      label: '정상',
      color: 'success',
      defaultIcon: <CheckCircle size={16} />,
    },
    // 재무 상태
    income: {
      label: '수입',
      color: 'success',
      defaultIcon: <DollarSign size={16} />,
    },
    expense: {
      label: '지출',
      color: 'error',
      defaultIcon: <Minus size={16} />,
    },
    // 급여 상태
    paid: {
      label: '지급완료',
      color: 'success',
      defaultIcon: <CheckCircle size={16} />,
    },
    approved: {
      label: '승인완료',
      color: 'info',
      defaultIcon: <FileCheck size={16} />,
    },
    calculated: {
      label: '계산완료',
      color: 'warning',
      defaultIcon: <Clock size={16} />,
    },
    not_calculated: {
      label: '미계산',
      color: 'default',
      defaultIcon: <XCircle size={16} />,
    },
    // 직원 상태
    office: {
      label: '출근',
      color: 'success',
      defaultIcon: <CheckCircle size={16} />,
    },
    away: {
      label: '휴무',
      color: 'warning',
      defaultIcon: <AlertTriangle size={16} />,
    },
    off_duty: {
      label: '퇴근',
      color: 'default',
      defaultIcon: <Minus size={16} />,
    },
    // 일반 상태
    active: {
      label: '활성',
      color: 'success',
      defaultIcon: <CheckCircle size={16} />,
    },
    inactive: {
      label: '비활성',
      color: 'default',
      defaultIcon: <XCircle size={16} />,
    },
    pending: {
      label: '대기중',
      color: 'warning',
      defaultIcon: <Clock size={16} />,
    },
    // 예산 상태
    error: {
      label: '초과',
      color: 'error',
      defaultIcon: <AlertTriangle size={16} />,
    },
    warning: {
      label: '경고',
      color: 'warning',
      defaultIcon: <AlertTriangle size={16} />,
    },
  }

  const config = statusConfig[status] || {
    label: label || status,
    color: 'default' as ChipProps['color'],
    defaultIcon: undefined,
  }

  const displayLabel = label || config.label
  const displayIcon = icon !== undefined ? icon : config.defaultIcon

  return (
    <Chip
      label={displayLabel}
      color={config.color}
      size={size}
      variant={variant}
      icon={displayIcon ? <span>{displayIcon}</span> : undefined}
      onClick={onClick}
      className={className}
      sx={{
        fontSize: { xs: '0.75rem', sm: size === 'small' ? '0.8125rem' : '0.875rem' },
        height: size === 'small' ? { xs: 22, sm: 24 } : { xs: 28, sm: 32 },
        fontWeight: 600,
        cursor: onClick ? 'pointer' : 'default',
        '& .MuiChip-icon': {
          marginLeft: '8px',
          marginRight: '-4px',
        },
      }}
    />
  )
}
