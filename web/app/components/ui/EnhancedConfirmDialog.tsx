'use client'

import { useState } from 'react'
import Modal, { ModalHeader, ModalBody, ModalFooter } from './Modal'
import Button from './Button'
import { AlertTriangle, Trash2 } from 'lucide-react'
import clsx from 'clsx'

type EnhancedConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary' | 'warning'
  loading?: boolean
  destructive?: boolean
  icon?: React.ReactNode
}

/**
 * 개선된 확인 다이얼로그
 * 위험한 작업에 대한 명확한 경고 및 시각적 강조
 */
export default function EnhancedConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '확인',
  description,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'primary',
  loading = false,
  destructive = false,
  icon,
}: EnhancedConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const isDanger = variant === 'danger' || destructive
  const displayIcon = icon || (isDanger ? <Trash2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />)

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalHeader title={title} />
      <ModalBody>
        <div className="space-y-4">
          {/* 아이콘 및 경고 */}
          {isDanger && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg">
              <div className="flex-shrink-0 text-rose-600 mt-0.5">
                {displayIcon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-rose-900 mb-1">
                  이 작업은 되돌릴 수 없습니다
                </p>
                <p className="text-xs text-rose-700">
                  삭제된 데이터는 복구할 수 없으니 신중하게 결정해주세요.
                </p>
              </div>
            </div>
          )}

          {/* 설명 */}
          {description && (
            <p className={clsx(
              'text-sm leading-relaxed',
              isDanger ? 'text-neutral-700' : 'text-neutral-600'
            )}>
              {description}
            </p>
          )}

          {/* 취소 가능성 강조 */}
          {isDanger && (
            <div className="text-xs text-neutral-500 bg-neutral-50 rounded-md p-2 border border-neutral-200">
              💡 취소 버튼을 눌러 언제든지 중단할 수 있습니다.
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading || isLoading}
          className="order-2"
        >
          {cancelText}
        </Button>
        <Button
          variant={isDanger ? 'danger' : (variant === 'warning' ? 'primary' : variant)}
          onClick={handleConfirm}
          disabled={loading || isLoading}
          loading={loading || isLoading}
          leftIcon={isDanger ? <Trash2 className="h-4 w-4" /> : undefined}
          className={clsx(
            'order-1',
            isDanger && 'focus-visible:ring-2 focus-visible:ring-rose-500'
          )}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
