'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/app/components/ui/Modal'
import Button from '@/app/components/ui/Button'
import { type SystemSettings } from '@/types/settings'
import SystemSettingsSection from '@/app/components/settings/SystemSettingsSection'

type Props = {
    open: boolean
    data: SystemSettings
    onClose: () => void
    onSave: (data: SystemSettings) => void
}

export default function SystemSettingsModal({ open, data, onClose, onSave }: Props) {
    const [formData, setFormData] = useState<SystemSettings>(data)
    const [hasChanges, setHasChanges] = useState(false)

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
        <Modal open={open} onClose={handleCancel} size="lg" fullScreenOnMobile>
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-200 bg-white sticky top-0 z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">시스템 및 앱 관리 설정</h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">시스템 알림을 설정합니다.</p>
            </div>

            <ModalBody sx={{ p: { xs: 2, sm: 3 } }}>
                <SystemSettingsSection data={formData} onChange={handleChange} />
            </ModalBody>

            <ModalFooter sx={{ p: { xs: 2, sm: 3 }, gap: 1, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
                <div className="w-full sm:w-auto flex justify-center sm:justify-start">
                    {hasChanges && (
                        <span className="text-xs sm:text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                            변경사항이 있습니다
                        </span>
                    )}
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button 
                        variant="secondary" 
                        onClick={handleCancel}
                        sx={{ 
                            minHeight: '44px', 
                            flex: { xs: 1, sm: 'none' },
                            fontSize: { xs: '0.9375rem', sm: '1rem' }
                        }}
                    >
                        취소
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSave} 
                        disabled={!hasChanges}
                        sx={{ 
                            minHeight: '44px', 
                            flex: { xs: 1, sm: 'none' },
                            fontSize: { xs: '0.9375rem', sm: '1rem' }
                        }}
                    >
                        저장
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    )
}
