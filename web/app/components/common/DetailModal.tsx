'use client'

import { ReactNode, useState } from 'react'
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/app/components/ui/AdaptiveModal'
import Button from '@/app/components/ui/Button'
import ConfirmDialog from '@/app/components/ui/ConfirmDialog'

export interface DetailModalProps<T> {
    open: boolean
    onClose: () => void
    item: T | null
    title: string
    description?: string
    loading?: boolean
    error?: string
    confirmDeleteMessage?: string
    onSave: () => void | Promise<void>
    onDelete?: () => void | Promise<void>
    children: ReactNode
    saveLabel?: string
    deleteLabel?: string
    showDelete?: boolean
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * 공통 Detail Modal 컴포넌트
 * CRUD 작업을 위한 표준화된 모달 구조 제공
 */
export default function DetailModal<T>({
    open,
    onClose,
    item,
    title,
    description,
    loading = false,
    error,
    confirmDeleteMessage = '정말 삭제하시겠습니까?',
    onSave,
    onDelete,
    children,
    saveLabel = '저장',
    deleteLabel = '삭제',
    showDelete = true,
    size = 'md',
}: DetailModalProps<T>) {
    const [confirmOpen, setConfirmOpen] = useState(false)

    const handleDelete = async () => {
        if (onDelete) {
            await onDelete()
            setConfirmOpen(false)
        }
    }

    return (
        <>
            <Modal open={open} onClose={onClose} size={size}>
                <ModalHeader 
                    title={title} 
                    {...(description ? { description } : {})} 
                    onClose={onClose} 
                />
                <ModalBody>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    {children}
                </ModalBody>
                <ModalFooter>
                    <div className="flex justify-between w-full">
                        <div>
                            {showDelete && item && onDelete && (
                                <Button
                                    variant="danger"
                                    onClick={() => setConfirmOpen(true)}
                                    disabled={loading}
                                >
                                    {deleteLabel}
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={onClose} disabled={loading}>
                                취소
                            </Button>
                            <Button
                                variant="primary"
                                onClick={onSave}
                                disabled={loading}
                                loading={loading}
                            >
                                {saveLabel}
                            </Button>
                        </div>
                    </div>
                </ModalFooter>
            </Modal>

            {onDelete && (
                <ConfirmDialog
                    open={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    onConfirm={handleDelete}
                    title="삭제 확인"
                    description={confirmDeleteMessage}
                />
            )}
        </>
    )
}
