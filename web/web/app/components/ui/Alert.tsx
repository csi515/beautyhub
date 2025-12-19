'use client'

import type { ReactNode } from 'react'
import MuiAlert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import IconButton from '@mui/material/IconButton'
import { X } from 'lucide-react'

type AlertVariant = 'success' | 'warning' | 'error' | 'info'

type Props = {
  variant?: AlertVariant
  title?: string
  children?: ReactNode
  description?: string
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
  icon?: ReactNode
}

export default function Alert({
  variant = 'info',
  title,
  children,
  description,
  dismissible = false,
  onDismiss,
  className = '',
  icon,
}: Props) {
  const displayContent = children || description

  const getSeverity = (v: AlertVariant): 'success' | 'warning' | 'error' | 'info' => v

  return (
    <MuiAlert
      severity={getSeverity(variant)}
      icon={icon} // MUI Alert handles icons automatically based on severity if this is undefined, or accepts ReactNode
      action={
        dismissible && onDismiss ? (
          <IconButton
            aria-label="닫기"
            color="inherit"
            size="small"
            onClick={onDismiss}
          >
            <X size={16} />
          </IconButton>
        ) : undefined
      }
      className={className}
      sx={{ '& .MuiAlert-icon': { alignItems: 'center' } }} // Center icon vertically if needed
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {displayContent}
    </MuiAlert>
  )
}
