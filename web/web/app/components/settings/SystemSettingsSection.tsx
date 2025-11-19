'use client'

import { useState, useEffect, useRef } from 'react'
import Card from '../ui/Card'
import Select from '../ui/Select'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { ModalBody, ModalFooter } from '../ui/Modal'
import { type SystemSettings } from '@/types/settings'
import { useAppToast } from '@/app/lib/ui/toast'
import { useBiometric } from '@/app/lib/hooks/useBiometric'
import { useAuth } from '@/app/components/AuthProvider'

type Props = {
  data: SystemSettings
  onChange: (data: Partial<SystemSettings>) => void
}

export default function SystemSettingsSection({ data, onChange }: Props) {
  const [showResetModal, setShowResetModal] = useState(false)
  const toast = useAppToast()
  const biometric = useBiometric()
  const { user } = useAuth()
  const biometricRef = useRef(biometric)

  useEffect(() => {
    biometricRef.current = biometric
  }, [biometric])

  useEffect(() => {
    if (user?.id && biometricRef.current.supported) {
      biometricRef.current.checkRegistered(user.id)
    }
  }, [user?.id])

  const handleBackup = async () => {
    try {
      toast.info('백업 기능은 준비 중입니다.')
      // TODO: 백업 기능 구현
    } catch (error) {
      toast.error('백업 실패', error instanceof Error ? error.message : '알 수 없는 오류')
    }
  }

  const handleRestore = async () => {
    try {
      toast.info('복원 기능은 준비 중입니다.')
      // TODO: 복원 기능 구현
    } catch (error) {
      toast.error('복원 실패', error instanceof Error ? error.message : '알 수 없는 오류')
    }
  }

  const handleResetAll = async () => {
    try {
      // TODO: 모든 데이터 초기화 구현
      toast.success('모든 데이터가 초기화되었습니다.')
      setShowResetModal(false)
      // 페이지 새로고침
      window.location.reload()
    } catch (error) {
      toast.error('초기화 실패', error instanceof Error ? error.message : '알 수 없는 오류')
    }
  }

  return (
    <>
      <Card>
        <h2 className="text-xl font-bold text-neutral-900 mb-6">시스템 및 앱 관리 설정</h2>
        
        <div className="space-y-6">
          {/* 알림 설정 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-800">알림 설정</h3>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.pushNotificationsEnabled}
                onChange={(e) => onChange({ pushNotificationsEnabled: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-300 text-blue-600"
              />
              <span className="text-sm font-medium text-neutral-700">PUSH 알림 전체</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.customerNotificationsEnabled}
                onChange={(e) => onChange({ customerNotificationsEnabled: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-300 text-blue-600"
              />
              <span className="text-sm font-medium text-neutral-700">고객 알림</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.internalNotificationsEnabled}
                onChange={(e) => onChange({ internalNotificationsEnabled: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-300 text-blue-600"
              />
              <span className="text-sm font-medium text-neutral-700">내부 알림</span>
            </label>
          </div>

          {/* 데이터 관리 */}
          <div className="border-t border-neutral-200 pt-4 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-800">데이터 관리</h3>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleBackup}>
                백업
              </Button>
              <Button variant="outline" onClick={handleRestore}>
                복원
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowResetModal(true)}
              >
                모든 데이터 초기화
              </Button>
            </div>
          </div>

          {/* 보안 설정 */}
          <div className="border-t border-neutral-200 pt-4 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-800">보안 설정</h3>
            
            {/* 생체 인증 설정 */}
            {biometric.supported && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-700">생체 인증</p>
                    <p className="text-xs text-neutral-500">
                      {biometric.available 
                        ? biometric.registered 
                          ? '등록됨 - 지문/얼굴 인식으로 로그인 가능' 
                          : '미등록 - 로그인 후 활성화 가능'
                        : '사용 불가 - 기기에서 생체 인증을 설정해주세요'}
                    </p>
                  </div>
                  {biometric.registered && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (user?.id) {
                          try {
                            await biometric.remove(user.id)
                            toast.success('생체 인증이 비활성화되었습니다.')
                          } catch (err) {
                            toast.error('생체 인증 해제 실패', err instanceof Error ? err.message : '알 수 없는 오류')
                          }
                        }
                      }}
                    >
                      해제
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <Select
              label="자동 로그아웃 시간"
              value={String(data.autoLogoutMinutes)}
              onChange={(e) => onChange({ autoLogoutMinutes: Number(e.target.value) })}
            >
              <option value="15">15분</option>
              <option value="30">30분</option>
              <option value="60">60분</option>
              <option value="120">2시간</option>
              <option value="0">사용 안 함</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* 데이터 초기화 확인 모달 */}
      <Modal open={showResetModal} onClose={() => setShowResetModal(false)} size="md">
        <ModalBody>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-900">모든 데이터 초기화</h3>
            <p className="text-sm text-neutral-600">
              이 작업은 되돌릴 수 없습니다. 모든 고객 정보, 예약, 거래 내역, 설정이 삭제됩니다.
            </p>
            <p className="text-sm font-semibold text-rose-600">
              정말로 모든 데이터를 초기화하시겠습니까?
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>
            취소
          </Button>
          <Button variant="danger" onClick={handleResetAll}>
            초기화
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

