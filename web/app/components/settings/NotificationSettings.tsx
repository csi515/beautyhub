'use client'

import { memo } from 'react'
import { Bell } from 'lucide-react'
import CollapsibleSection from '../ui/CollapsibleSection'
import NotificationPermission from '../common/NotificationPermission'
import { type SystemSettings } from '@/types/settings'
import ToggleSwitch from '../ui/ToggleSwitch'

type Props = {
  data: SystemSettings
  onChange: (data: Partial<SystemSettings>) => void
}

function NotificationSettingsSection({ data, onChange }: Props) {
  return (
    <CollapsibleSection
      title="알림 설정"
      description="알림 권한 및 알림 유형을 관리합니다."
      icon={<Bell className="w-6 h-6" />}
      iconColor="from-purple-500 to-purple-600"
    >
      <div className="space-y-6">
        {/* 알림 권한 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-neutral-700" />
            <h3 className="text-lg font-semibold text-neutral-800">알림 권한</h3>
          </div>
          <NotificationPermission
            onPermissionChange={(granted) => {
              onChange({ pushNotificationsEnabled: granted })
            }}
          />
        </div>

        {/* 알림 유형 설정 */}
        <div className="border-t border-neutral-200 pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-neutral-700" />
            <h3 className="text-lg font-semibold text-neutral-800">알림 유형</h3>
          </div>

          <div className="space-y-4">
            <div>
              <ToggleSwitch
                checked={data.customerNotificationsEnabled ?? true}
                onChange={(checked) => onChange({ customerNotificationsEnabled: checked })}
                label="고객 알림 활성화"
              />
              <p className="text-sm text-neutral-600 mt-1 ml-12">예약 리마인더 및 고객 관련 알림</p>
            </div>

            <div>
              <ToggleSwitch
                checked={data.internalNotificationsEnabled ?? true}
                onChange={(checked) => onChange({ internalNotificationsEnabled: checked })}
                label="내부 알림 활성화"
              />
              <p className="text-sm text-neutral-600 mt-1 ml-12">재고 알림 및 시스템 알림</p>
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}

export default memo(NotificationSettingsSection)
