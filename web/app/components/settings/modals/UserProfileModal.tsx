'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalBody, ModalFooter } from '@/app/components/ui/Modal'
import Button from '@/app/components/ui/Button'
import { type UserProfile } from '@/types/settings'

type Props = {
    open: boolean
    data: UserProfile
    onClose: () => void
    onSave: (data: UserProfile) => void
}

export default function UserProfileModal({ open, data, onClose, onSave }: Props) {
    const [formData, setFormData] = useState<UserProfile>(data)
    const [hasChanges, setHasChanges] = useState(false)

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
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">개인 정보 설정</h2>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">개인 정보를 수정합니다.</p>
            </div>

            <ModalBody sx={{ p: { xs: 2, sm: 3 } }}>
                <div className="space-y-4 sm:space-y-6">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                            이름
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full h-11 sm:h-10 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-base sm:text-sm touch-manipulation"
                            placeholder="이름을 입력하세요"
                            style={{ fontSize: '16px' }}
                            autoComplete="name"
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                            이메일
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="w-full h-11 sm:h-10 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-base sm:text-sm touch-manipulation"
                            placeholder="이메일을 입력하세요"
                            style={{ fontSize: '16px' }}
                            autoComplete="email"
                            inputMode="email"
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                            전화번호
                        </label>
                        <input
                            type="tel"
                            value={formData.phone || ''}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="w-full h-11 sm:h-10 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-base sm:text-sm touch-manipulation"
                            placeholder="전화번호를 입력하세요"
                            style={{ fontSize: '16px' }}
                            autoComplete="tel"
                            inputMode="tel"
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                            생년월일
                        </label>
                        <input
                            type="date"
                            value={formData.birthdate || ''}
                            onChange={(e) => handleChange('birthdate', e.target.value)}
                            className="w-full h-11 sm:h-10 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-base sm:text-sm touch-manipulation"
                            style={{ fontSize: '16px' }}
                            inputMode="numeric"
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">
                            자기소개
                        </label>
                        <textarea
                            value={formData.bio || ''}
                            onChange={(e) => handleChange('bio', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none text-base sm:text-sm touch-manipulation"
                            placeholder="자기소개를 입력하세요"
                            style={{ fontSize: '16px', minHeight: '80px' }}
                        />
                    </div>
                </div>
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
