'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/app/components/ui/AdaptiveModal'
import Button from '@/app/components/ui/Button'
import Select from '@/app/components/ui/Select'
import ConfirmDialog from '@/app/components/ui/ConfirmDialog'
import { type DisplaySettings } from '@/types/settings'

type Props = {
    open: boolean
    data: DisplaySettings
    onClose: () => void
    onSave: (data: DisplaySettings) => void | Promise<void>
}

export default function DisplaySettingsModal({ open, data, onClose, onSave }: Props) {
    const [formData, setFormData] = useState<DisplaySettings>(data)
    const [hasChanges, setHasChanges] = useState(false)
    const [saving, setSaving] = useState(false)
    const [confirmCloseOpen, setConfirmCloseOpen] = useState(false)

    useEffect(() => {
        if (open) {
            setFormData(data)
            setHasChanges(false)
        }
    }, [open, data])

    const handleChange = (field: keyof DisplaySettings, value: any) => {
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
            <ModalHeader title="표시 설정" description="앱의 표시 방식을 설정합니다." />

            <ModalBody>
                <div className="space-y-6">
                    <Select
                        label="테마"
                        value={formData.theme}
                        onChange={(e) => handleChange('theme', e.target.value)}
                    >
                        <option value="light">밝은 테마</option>
                        <option value="dark">어두운 테마</option>
                        <option value="auto">시스템 설정에 따라</option>
                    </Select>
                    <Select
                        label="언어"
                        value={formData.language}
                        onChange={(e) => handleChange('language', e.target.value)}
                    >
                        <option value="ko">한국어</option>
                        <option value="en">English</option>
                    </Select>
                    <Select
                        label="시간대"
                        value={formData.timezone}
                        onChange={(e) => handleChange('timezone', e.target.value)}
                    >
                        <option value="Asia/Seoul">대한민국 (KST)</option>
                        <option value="America/New_York">미국 동부 (EST)</option>
                        <option value="Europe/London">영국 (GMT)</option>
                        <option value="Asia/Tokyo">일본 (JST)</option>
                    </Select>
                    <Select
                        label="날짜 표시 형식"
                        value={formData.dateFormat}
                        onChange={(e) => handleChange('dateFormat', e.target.value)}
                    >
                        <option value="YYYY-MM-DD">2024-01-15</option>
                        <option value="MM/DD/YYYY">01/15/2024</option>
                        <option value="DD/MM/YYYY">15/01/2024</option>
                        <option value="YYYY년 MM월 DD일">2024년 01월 15일</option>
                    </Select>
                    <Select
                        label="시간 표시 형식"
                        value={formData.timeFormat}
                        onChange={(e) => handleChange('timeFormat', e.target.value)}
                    >
                        <option value="24h">24시간제 (14:30)</option>
                        <option value="12h">12시간제 (2:30 PM)</option>
                    </Select>
                    <Select
                        label="통화"
                        value={formData.currency}
                        onChange={(e) => handleChange('currency', e.target.value)}
                    >
                        <option value="KRW">한국 원 (₩)</option>
                        <option value="USD">미국 달러 ($)</option>
                        <option value="EUR">유로 (€)</option>
                        <option value="JPY">일본 엔 (¥)</option>
                    </Select>
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
                description="저장하지 않은 변경사항이 있습니다. 정말 닫으시겠습니까?"
                confirmText="닫기"
                variant="danger"
            />
        </Modal>
    )
}
