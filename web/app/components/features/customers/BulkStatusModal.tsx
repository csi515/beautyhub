'use client'

import { useState } from 'react'
import { Typography } from '@mui/material'
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/app/components/ui/Modal'
import Button from '@/app/components/ui/Button'
import { useAppToast } from '@/app/lib/ui/toast'

interface BulkStatusModalProps {
  open: boolean
  onClose: () => void
  selectedCount: number
  onConfirm: (active: boolean) => Promise<void>
}

export default function BulkStatusModal({
  open,
  onClose,
  selectedCount,
  onConfirm,
}: BulkStatusModalProps) {
  const toast = useAppToast()
  const [loading, setLoading] = useState(false)

  const handleConfirm = async (active: boolean) => {
    setLoading(true)
    try {
      await onConfirm(active)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '일괄 상태 변경에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalHeader title="일괄 상태 변경" />
      <ModalBody>
        <Typography variant="body2" color="text.secondary">
          선택한 {selectedCount}명의 고객 상태를 변경합니다.
        </Typography>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          취소
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleConfirm(true)}
          disabled={loading}
          loading={loading}
          aria-label="활성으로 변경"
        >
          활성으로 변경
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleConfirm(false)}
          disabled={loading}
          aria-label="비활성으로 변경"
        >
          비활성으로 변경
        </Button>
      </ModalFooter>
    </Modal>
  )
}
