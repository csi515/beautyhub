'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/app/components/ui/AdaptiveModal'
import Button from '@/app/components/ui/Button'
import ConfirmDialog from '@/app/components/ui/ConfirmDialog'
import { type SystemSettings } from '@/types/settings'
import SystemSettingsSection from '@/app/components/features/settings/SystemSettingsSection'

type Props = {
    open: boolean
    data: SystemSettings
    onClose: () => void
    onSave: (data: SystemSettings) => void | Promise<void>
}

export default function SystemSettingsModal({ open, data, onClose, onSave }: Props) {
    const [formData, setFormData] = useState<SystemSettings>(data)
    const [hasChanges, setHasChanges] = useState(false)
    const [saving, setSaving] = useState(false)
    const [confirmCloseOpen, setConfirmCloseOpen] = useState(false)

    useEffect(() => {
        if (open) {
            setFormData(data)
            setHasChanges(false)
        }
    }, [open, data])

    const handleChange = (changes: Partial<SystemSettings>) => {
        setFormData((prev) => ({ ...prev, ...changes }))
        setHasChanges(true)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await onSave(formData)
            setHasChanges(false)
            onClose()
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
        if (saving) return
        if (hasChanges) {
            setConfirmCloseOpen(true)
            return
        }
        handleCancel()
    }

    return (
        <Modal open={open} onClose={handleRequestClose} size="lg">
            <ModalHeader title="시스템 및 앱 관리 설정" description="시스템 알림을 설정합니다." />

            <ModalBody>
                <SystemSettingsSection data={formData} onChange={handleChange} />
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
                description="저장하지 않은 변경사항이 있습니다. 정말 닫으시겠습니까?"
                confirmText="닫기"
                variant="danger"
            />
        </Modal>
    )
}
