'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/app/components/ui/Modal'
import Button from '@/app/components/ui/Button'
import { type BookingSettings } from '@/types/settings'
import BookingSettingsSection from '@/app/components/settings/BookingSettingsSection'

type Props = {
    open: boolean
    data: BookingSettings
    onClose: () => void
    onSave: (data: BookingSettings) => void
}

export default function BookingSettingsModal({ open, data, onClose, onSave }: Props) {
    const [formData, setFormData] = useState<BookingSettings>(data)
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        if (open) {
            setFormData(data)
            setHasChanges(false)
        }
    }, [open, data])

    const handleChange = (changes: Partial<BookingSettings>) => {
        setFormData((prev) => ({ ...prev, ...changes }))
        setHasChanges(true)
    }

    const handleSave = () => {
        onSave(formData)
        setHasChanges(false)
        onClose()
    }

    const handleCancel = () => {
        if (hasChanges) {
            const confirm = window.confirm('저장하지 않은 변경사항이 있습니다. 정말 닫으시겠습니까?')
            if (!confirm) return
        }
        setFormData(data)
        setHasChanges(false)
        onClose()
    }

    return (
        <Modal open={open} onClose={handleCancel} size="xl">
            <div className="px-6 py-4 border-b border-neutral-200 bg-white sticky top-0 z-10">
                <h2 className="text-2xl font-bold text-neutral-900">예약 및 스케줄 정책</h2>
                <p className="text-sm text-neutral-600 mt-1">예약 정책과 리마인드 알림을 관리합니다.</p>
            </div>

            <ModalBody>
                <BookingSettingsSection data={formData} onChange={handleChange} />
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
                        <Button variant="secondary" onClick={handleCancel}>
                            취소
                        </Button>
                        <Button variant="primary" onClick={handleSave} disabled={!hasChanges}>
                            저장
                        </Button>
                    </div>
                </div>
            </ModalFooter>
        </Modal>
    )
}
