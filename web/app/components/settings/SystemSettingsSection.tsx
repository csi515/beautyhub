'use client'

import { memo } from 'react'
import { Settings } from 'lucide-react'
import CollapsibleSection from '../ui/CollapsibleSection'
import NotificationSettingsSection from './NotificationSettings'
import { type SystemSettings } from '@/types/settings'

type Props = {
  data: SystemSettings
  onChange: (data: Partial<SystemSettings>) => void
}

function SystemSettingsSection({ data, onChange }: Props) {
  return (
    <CollapsibleSection
      title="시스템 및 앱 관리 설정"
      description="시스템 알림을 설정합니다."
      icon={<Settings className="w-6 h-6" />}
      iconColor="from-purple-500 to-purple-600"
    >
      <div className="space-y-6">
        <NotificationSettingsSection data={data} onChange={onChange} />
      </div>
    </CollapsibleSection>
  )
}

// React.memo로 래핑하여 props가 변경되지 않으면 리렌더링 방지
export default memo(SystemSettingsSection)
