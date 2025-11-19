'use client'

import Modal, { ModalBody, ModalFooter } from '../ui/Modal'
import Button from '../ui/Button'
import { Fingerprint, Shield, AlertCircle } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  onAccept: () => void
}

/**
 * 생체 인증 동의 모달
 */
export default function BiometricConsentModal({ open, onClose, onAccept }: Props) {
  return (
    <Modal open={open} onClose={onClose} size="md">
      <ModalBody>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Fingerprint className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">생체 인증 사용 동의</h3>
          </div>

          <div className="space-y-3 text-sm text-neutral-700">
            <p>
              생체 인증(지문/얼굴 인식)을 사용하면 매번 비밀번호를 입력하지 않고도 빠르고 안전하게 로그인할 수 있습니다.
            </p>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-blue-900">보안 안내</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800 text-xs">
                    <li>생체 정보는 기기에만 저장되며 서버로 전송되지 않습니다.</li>
                    <li>인증 과정은 운영체제 수준에서 안전하게 처리됩니다.</li>
                    <li>기기 잠금이 초기화되면 자동으로 비활성화됩니다.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-900">주의사항</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-800 text-xs">
                    <li>생체 인증 실패 시 3회까지 재시도 가능합니다.</li>
                    <li>설정에서 언제든지 비활성화할 수 있습니다.</li>
                    <li>다른 사람이 기기를 사용할 수 있는 환경에서는 사용을 권장하지 않습니다.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          거부
        </Button>
        <Button variant="primary" onClick={onAccept}>
          동의하고 사용하기
        </Button>
      </ModalFooter>
    </Modal>
  )
}

