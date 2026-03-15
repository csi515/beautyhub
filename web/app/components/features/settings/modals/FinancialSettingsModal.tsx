'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/app/components/ui/AdaptiveModal'
import Button from '@/app/components/ui/Button'
import ConfirmDialog from '@/app/components/ui/ConfirmDialog'
import { CONFIRMATION_MESSAGES } from '@/app/lib/utils/messages'
import { type FinancialSettings } from '@/types/settings'
import FinancialSettingsSection from '../FinancialSettingsSection'

type Props = {
    open: boolean
    data: FinancialSettings
    onClose: () => void
    onSave: (data: FinancialSettings) => void | Promise<void>
}

export default function FinancialSettingsModal({ open, data, onClose, onSave }: Props) {
    const [formData, setFormData] = useState<FinancialSettings>(data)
    const [hasChanges, setHasChanges] = useState(false)
    const [confirmCloseOpen, setConfirmCloseOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    // open이 true가 될 때마다 데이터 초기화
    useEffect(() => {
        if (open) {
            setFormData(data)
            setHasChanges(false)
        }
    }, [open, data])

    const handleChange = (changes: Partial<FinancialSettings>) => {
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
        setFormData(data) // 원래 데이터로 복원
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
            {/* 헤더 */}
            <div className="px-6 py-4 border-b border-neutral-200 bg-white sticky top-0 z-10">
                <h2 className="text-2xl font-bold text-neutral-900">재무 및 정산 설정</h2>
                <p className="text-sm text-neutral-600 mt-1">수입 및 지출 항목을 관리합니다.</p>
            </div>

            {/* 바디 */}
            <ModalBody>
                <FinancialSettingsSection data={formData} onChange={handleChange} />
            </ModalBody>

            {/* 푸터 */}
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
                        <Button variant="secondary" onClick={handleRequestClose}>
                            취소
                        </Button>
                        <Button variant="primary" onClick={handleSave} disabled={!hasChanges || saving} loading={saving}>
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
                cancelText="계속 편집"
                confirmText="취소"
                variant="danger"
            />
        </Modal>
    )
}
