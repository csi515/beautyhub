'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/app/components/ui/AdaptiveModal'
import Button from '@/app/components/ui/Button'
import ConfirmDialog from '@/app/components/ui/ConfirmDialog'
import { CONFIRMATION_MESSAGES } from '@/app/lib/utils/messages'
import { useAppToast } from '@/app/lib/ui/toast'
import { type BusinessProfile } from '@/types/settings'
import BusinessProfileSection from '../BusinessProfileSection'

type Props = {
    open: boolean
    data: BusinessProfile
    onClose: () => void
    onSave: (data: BusinessProfile) => void | Promise<void>
}

export default function BusinessProfileModal({ open, data, onClose, onSave }: Props) {
    const toast = useAppToast()
    const [formData, setFormData] = useState<BusinessProfile>(data)
    const [hasChanges, setHasChanges] = useState(false)
    const [saving, setSaving] = useState(false)
    const [confirmCloseOpen, setConfirmCloseOpen] = useState(false)

    useEffect(() => {
        if (open) {
            setFormData(data)
            setHasChanges(false)
        }
    }, [open, data])

    const handleChange = (changes: Partial<BusinessProfile>) => {
        setFormData((prev) => ({ ...prev, ...changes }))
        setHasChanges(true)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await onSave(formData)
            setHasChanges(false)
            onClose()
            toast.success('가게 정보가 저장되었습니다.')
        } catch (error) {
            toast.error('저장에 실패했습니다.', error instanceof Error ? error.message : undefined)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData(data)
        setHasChanges(false)
        onClose()
    }

    const handleRequestClose = () => {
        if (hasChanges) {
            setConfirmCloseOpen(true)
            return
        }
        handleCancel()
    }

    return (
        <Modal open={open} onClose={handleRequestClose} size="xl">
            <div className="px-6 py-4 border-b border-neutral-200 bg-white sticky top-0 z-10">
                <h2 className="text-2xl font-bold text-neutral-900">가게 기본 정보</h2>
                <p className="text-sm text-neutral-600 mt-1">상호명, 주소, 영업시간 등을 관리합니다.</p>
            </div>

            <ModalBody>
                <BusinessProfileSection data={formData} onChange={handleChange} />
            </ModalBody>

            <ModalFooter>
                <div className="flex items-center justify-between w-full">
                    <div>
                        {hasChanges && (
                            <span className="text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                                변경사항이 있습니다
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={handleRequestClose} disabled={saving}>
                            취소
                        </Button>
                        <Button variant="primary" onClick={handleSave} disabled={!hasChanges} loading={saving}>
                            저장
                        </Button>
                    </div>
                </div>
            </ModalFooter>
            <ConfirmDialog
                open={confirmCloseOpen}
                onClose={() => setConfirmCloseOpen(false)}
                onConfirm={handleCancel}
                title="변경사항 닫기"
                description={CONFIRMATION_MESSAGES.cancel}
                confirmText="닫기"
                variant="danger"
            />
        </Modal>
    )
}
