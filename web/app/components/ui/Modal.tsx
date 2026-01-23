'use client'

import React, { useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { X } from 'lucide-react'
import { lockScroll, unlockScroll } from '@/app/lib/utils/scrollLock'
import { useVirtualKeyboard } from '@/app/lib/hooks/useVirtualKeyboard'
import { useHapticFeedback } from '@/app/lib/hooks/useHapticFeedback'
import { useModalVariant } from '@/app/lib/hooks/useModalVariant'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface ModalProps {
  open: boolean
  onClose: () => void
  size?: ModalSize
  children: React.ReactNode
  closeOnOutsideClick?: boolean
  disableAutoFocus?: boolean
  fullScreenOnMobile?: boolean
}

function Modal({
  open,
  onClose,
  size = 'lg',
  children,
  closeOnOutsideClick = true,
  disableAutoFocus = false,
  fullScreenOnMobile = true,
  ...props // pass other props to Dialog
}: ModalProps) {
  // fullScreenOnMobile이 true면 fullscreen으로 처리
  const modalSize = fullScreenOnMobile ? 'fullscreen' : size
  const modal = useModalVariant({
    open,
    size: modalSize as any,
    closeOnOutsideClick,
    disableAutoFocus,
    onClose,
  })
  
  // 가상 키보드 감지
  const { isVisible: isKeyboardVisible, scrollToInput } = useVirtualKeyboard({
    enabled: open && modal.isMobile,
  })
  
  // 햅틱 피드백
  const { light } = useHapticFeedback()

  // 스크롤 잠금
  useEffect(() => {
    if (open) {
      lockScroll()
      light() // 모달 열 때 햅틱 피드백
    } else {
      unlockScroll()
    }
    return () => {
      unlockScroll()
    }
  }, [open, light])
  
  // 모바일에서 입력 필드 포커스 시 자동 스크롤
  useEffect(() => {
    if (!open || !modal.isMobile) return
    
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        scrollToInput(target)
      }
    }
    
    document.addEventListener('focusin', handleFocus)
    return () => {
      document.removeEventListener('focusin', handleFocus)
    }
  }, [open, modal.isMobile, scrollToInput])

  return (
    <Dialog
      {...modal.dialogProps}
      aria-labelledby="modal-title"
      sx={{
        ...modal.dialogProps.sx,
        ...(modal.isMobile && isKeyboardVisible && {
          '& .MuiDialog-paper': {
            maxHeight: '50vh',
            transition: 'max-height 0.3s ease-out',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: 'var(--shadow-modal)',
            border: '1px solid var(--neutral-200)',
          },
        }),
        ...((props as any).sx || {}),
      }}
      {...props}
    >
      {children}
    </Dialog>
  )
}

type ModalHeaderProps = {
  title: string
  description?: string
  icon?: React.ReactNode
  onClose?: () => void
  children?: React.ReactNode
}

function ModalHeader({ title, description, icon, onClose, children }: ModalHeaderProps) {
  return (
    <DialogTitle
      id="modal-title"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: { xs: 2, sm: 3 },
        pb: { xs: 1.5, sm: 2 },
        flexShrink: 0,
      }}
    >
      <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
        {icon && (
          <Box sx={{ flexShrink: 0, mt: 0.5, display: 'flex' }}>
            {icon}
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography 
              variant="h6" 
              component="div" 
              fontWeight="bold" 
              color="text.primary"
              sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
            >
              {title}
            </Typography>
            {children}
          </Stack>
          {description && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mt: 0.5, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
            >
              {description}
            </Typography>
          )}
        </Box>
      </Stack>
      {onClose && (
        <IconButton
          aria-label="닫기"
          onClick={onClose}
          size="small"
          sx={{
            flexShrink: 0,
            color: 'text.secondary',
            alignSelf: 'flex-start',
            mt: -0.5,
            mr: { xs: -0.5, sm: -0.5 },
            minWidth: '44px',
            minHeight: '44px',
          }}
        >
          <X size={20} />
        </IconButton>
      )}
    </DialogTitle>
  )
}

type ModalBodyProps = {
  children: React.ReactNode
  sx?: any
}

function ModalBody({ children, sx }: ModalBodyProps) {
  return (
    <DialogContent
      dividers
      sx={{
        p: { xs: 2, sm: 3 },
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        // Safe area 대응
        pb: { xs: 'calc(env(safe-area-inset-bottom) + 16px)', sm: 3 },
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        },
        ...sx,
      }}
    >
      {children}
    </DialogContent>
  )
}

type ModalFooterProps = {
  children: React.ReactNode
  sx?: any
}

function ModalFooter({ children, sx }: ModalFooterProps) {
  return (
    <DialogActions
      sx={{
        p: { xs: 2, sm: 2 },
        gap: { xs: 1, sm: 1 },
        flexShrink: 0,
        // Safe area 대응
        pb: { xs: 'calc(env(safe-area-inset-bottom) + 8px)', sm: 2 },
        ...sx,
      }}
    >
      {children}
    </DialogActions>
  )
}

export { Modal, ModalHeader, ModalBody, ModalFooter }
export default Modal
