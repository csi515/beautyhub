'use client'

import { useState } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'
import SwipeableModal, { SwipeableModalHeader, SwipeableModalBody, SwipeableModalFooter } from './SwipeableModal'
import Modal, { ModalHeader, ModalBody, ModalFooter } from './Modal'
import Button from './Button'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '확인',
  description,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'primary',
  loading = false,
}: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  // 모바일: SwipeableModal 사용
  if (isMobile) {
    return (
      <SwipeableModal open={open} onClose={onClose} size="sm">
        <SwipeableModalHeader title={title} onClose={onClose} />
        <SwipeableModalBody>
          {description && <p className="text-xs sm:text-sm text-neutral-600">{description}</p>}
        </SwipeableModalBody>
        <SwipeableModalFooter>
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={loading || isLoading}
            fullWidth
            sx={{ 
              minHeight: '44px', 
              fontSize: '0.9375rem'
            }}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={loading || isLoading}
            fullWidth
            sx={{ 
              minHeight: '44px', 
              fontSize: '0.9375rem'
            }}
          >
            {confirmText}
          </Button>
        </SwipeableModalFooter>
      </SwipeableModal>
    )
  }

  // 데스크탑: 기존 Modal 사용
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalHeader title={title} />
      <ModalBody>
        {description && <p className="text-xs sm:text-sm text-neutral-600">{description}</p>}
      </ModalBody>
      <ModalFooter sx={{ gap: 1, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
        <Button 
          variant="secondary" 
          onClick={onClose} 
          disabled={loading || isLoading}
          sx={{ 
            minHeight: '44px', 
            flex: { xs: 1, sm: 'none' },
            fontSize: { xs: '0.9375rem', sm: '1rem' }
          }}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={handleConfirm}
          disabled={loading || isLoading}
          sx={{ 
            minHeight: '44px', 
            flex: { xs: 1, sm: 'none' },
            fontSize: { xs: '0.9375rem', sm: '1rem' }
          }}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
