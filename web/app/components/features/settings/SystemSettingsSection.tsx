'use client'

import { memo } from 'react'
import { Settings, Bell } from 'lucide-react'
import CollapsibleSection from '@/app/components/ui/CollapsibleSection'
import ToggleSwitch from '@/app/components/ui/ToggleSwitch'
import InfoTooltip from '@/app/components/ui/InfoTooltip'
import { type SystemSettings } from '@/types/settings'

type Props = {
  data: SystemSettings
  onChange: (data: Partial<SystemSettings>) => void
}

function SystemSettingsSection({ data, onChange }: Props) {
  return (
    <CollapsibleSection
      title="?�스??�???관�??�정"
      description="?�스???�림???�정?�니??"
      icon={<Settings className="w-6 h-6" />}
      iconColor="from-purple-500 to-purple-600"
    >
      <div className="space-y-6">
        {/* ?�림 ?�정 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-neutral-700" />
            <h3 className="text-lg font-semibold text-neutral-800">?�림 ?�정</h3>
            <InfoTooltip content="?�의 ?�림 ?�신 ?��?�??�정?�세??" />
          </div>

          <div className="space-y-3">
            <ToggleSwitch
              checked={data.pushNotificationsEnabled}
              onChange={(checked) => onChange({ pushNotificationsEnabled: checked })}
              label="PUSH ?�림 ?�체"
            />

            <ToggleSwitch
              checked={data.customerNotificationsEnabled}
              onChange={(checked) => onChange({ customerNotificationsEnabled: checked })}
              label="고객 ?�림"
            />

            <ToggleSwitch
              checked={data.internalNotificationsEnabled}
              onChange={(checked) => onChange({ internalNotificationsEnabled: checked })}
              label="?��? ?�림"
            />
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}

// React.memo�??�핑?�여 props가 변경되지 ?�으�?리렌?�링 방�?
export default memo(SystemSettingsSection)
