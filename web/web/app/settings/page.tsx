'use client'

import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { useAppToast } from '@/app/lib/ui/toast'
import { settingsApi } from '@/app/lib/api/settings'
import { DEFAULT_SETTINGS, type AppSettings } from '@/types/settings'
import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { Skeleton } from '@/app/components/ui/Skeleton'
import BusinessProfileSection from '@/app/components/settings/BusinessProfileSection'
import BookingSettingsSection from '@/app/components/settings/BookingSettingsSection'
import FinancialSettingsSection from '@/app/components/settings/FinancialSettingsSection'
import SystemSettingsSection from '@/app/components/settings/SystemSettingsSection'

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const toast = useAppToast()

  // 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        const data = await settingsApi.get()
        setSettings(data)
      } catch (error) {
        console.error('설정 로드 실패:', error)
        toast.error('설정을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [toast])

  // 설정 저장
  const handleSave = async () => {
    try {
      setSaving(true)
      await settingsApi.update({
        businessProfile: settings.businessProfile,
        bookingSettings: settings.bookingSettings,
        financialSettings: settings.financialSettings,
        systemSettings: settings.systemSettings,
      })
      setHasChanges(false)
      toast.success('설정이 저장되었습니다.')
    } catch (error) {
      console.error('설정 저장 실패:', error)
      toast.error('설정 저장에 실패했습니다.', error instanceof Error ? error.message : '알 수 없는 오류')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">설정</h1>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
        ))}
      </main>
    )
  }

  return (
    <main className="space-y-6 pb-24 safe-area-inset-bottom">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">설정</h1>
      </div>

      {/* 저장 버튼 (Floating) - 모바일 safe-area 고려 */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 safe-area-inset-x safe-area-inset-bottom">
        <Button
          variant="primary"
          size="lg"
          leftIcon={<Save className="h-5 w-5" />}
          onClick={handleSave}
          disabled={saving || !hasChanges}
          loading={saving}
          className="shadow-xl rounded-2xl px-6 py-3 min-h-[48px] touch-manipulation"
        >
          {saving ? '저장 중...' : '저장'}
        </Button>
      </div>

      {/* 섹션 1: 가게 기본 정보 */}
      <BusinessProfileSection
        data={settings.businessProfile}
        onChange={(data) => {
          setSettings((s) => ({ ...s, businessProfile: { ...s.businessProfile, ...data } }))
          setHasChanges(true)
        }}
      />

      {/* 섹션 2: 예약 및 스케줄 정책 */}
      <BookingSettingsSection
        data={settings.bookingSettings}
        onChange={(data) => {
          setSettings((s) => ({ ...s, bookingSettings: { ...s.bookingSettings, ...data } }))
          setHasChanges(true)
        }}
      />

      {/* 섹션 3: 재무 및 정산 */}
      <FinancialSettingsSection
        data={settings.financialSettings}
        onChange={(data) => {
          setSettings((s) => ({ ...s, financialSettings: { ...s.financialSettings, ...data } }))
          setHasChanges(true)
        }}
      />

      {/* 섹션 4: 시스템 및 앱 관리 */}
      <SystemSettingsSection
        data={settings.systemSettings}
        onChange={(data) => {
          setSettings((s) => ({ ...s, systemSettings: { ...s.systemSettings, ...data } }))
          setHasChanges(true)
        }}
      />
    </main>
  )
}

