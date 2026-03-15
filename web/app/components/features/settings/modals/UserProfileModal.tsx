'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/app/components/ui/AdaptiveModal'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import ConfirmDialog from '@/app/components/ui/ConfirmDialog'
import { CONFIRMATION_MESSAGES } from '@/app/lib/utils/messages'
import { type UserProfile } from '@/types/settings'

type Props = {
    open: boolean
    data: UserProfile
    onClose: () => void
    onSave: (data: UserProfile) => void | Promise<void>
}

export default function UserProfileModal({ open, data, onClose, onSave }: Props) {
    const [formData, setFormData] = useState<UserProfile>(data)
    const [hasChanges, setHasChanges] = useState(false)
    const [saving, setSaving] = useState(false)
    const [confirmCloseOpen, setConfirmCloseOpen] = useState(false)

    useEffect(() => {
        if (open) {
            setFormData(data)
            setHasChanges(false)
        }
    }, [open, data])

    const handleChange = (field: keyof UserProfile, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
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
            <ModalHeader title="개인 정보 설정" description="개인 정보를 수정합니다." />

            <ModalBody>
                <div className="space-y-6">
                    <Input
                        label="이름"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="이름을 입력하세요"
                        fullWidth
                    />
                    <Input
                        label="이메일"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="이메일을 입력하세요"
                        fullWidth
                    />
                    <Input
                        label="전화번호"
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="전화번호를 입력하세요"
                        fullWidth
                    />
                    <Input
                        label="생년월일"
                        type="date"
                        value={formData.birthdate || ''}
                        onChange={(e) => handleChange('birthdate', e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                    <Input
                        label="자기소개"
                        value={formData.bio || ''}
                        onChange={(e) => handleChange('bio', e.target.value)}
                        placeholder="자기소개를 입력하세요"
                        fullWidth
                        multiline
                        rows={3}
                    />
                </div>
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
