'use client'

import { useState, useEffect } from 'react'
import Modal, { ModalHeader, ModalBody, ModalFooter } from './Modal'
import Button from './Button'
import Input from './Input'

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
  /** 확인 문구 입력 시 활성화. 이 문자열을 정확히 입력해야 확인 버튼 활성화 */
  confirmInputText?: string
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
  confirmInputText,
}: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (!open) setInputValue('')
  }, [open])

  const isInputMatch = !confirmInputText || inputValue.trim() === confirmInputText
  const canConfirm = (loading || isLoading) ? false : isInputMatch

  const handleConfirm = async () => {
    if (!canConfirm) return
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalHeader title={title} />
      <ModalBody>
        {description && <p className="text-sm text-neutral-600 mb-3">{description}</p>}
        {confirmInputText && (
          <Input
            fullWidth
            size="small"
            placeholder={`"${confirmInputText}" 입력`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoComplete="off"
            sx={{ mt: 1 }}
          />
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading || isLoading}
          sx={{ flex: { xs: 1, sm: 'none' }, minWidth: 0 }}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={handleConfirm}
          disabled={!canConfirm}
          loading={loading || isLoading}
          autoFocus={variant === 'danger'}
          sx={{ flex: { xs: 1, sm: 'none' }, minWidth: 0 }}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
