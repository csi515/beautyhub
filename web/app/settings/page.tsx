'use client'

import { useEffect, useState } from 'react'
import { useAppToast } from '@/app/lib/ui/toast'
import { settingsApi } from '@/app/lib/api/settings'
import { customersApi } from '@/app/lib/api/customers'
import { productsApi } from '@/app/lib/api/products'
import { getAuthApi } from '@/app/lib/api/auth'
import { DEFAULT_SETTINGS, type SystemSettings, type UserProfile, type DisplaySettings } from '@/types/settings'
import { logger } from '@/app/lib/utils/logger'
import { getLocalizedErrorMessage } from '@/app/lib/utils/messages'
import {
  exportToExcelMultiSheet,
  prepareCustomerDataForExport,
  prepareProductDataForExport,
  prepareInventoryDataForExport,
} from '@/app/lib/utils/export'
import SettingsSkeleton from '@/app/components/skeletons/SettingsSkeleton'

// MUI Imports (레이아웃 유틸리티만 허용)
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import PageContainer from '../components/layout/PageContainer'
import PageIntro from '../components/common/PageIntro'

import SettingsIconGrid from '@/app/components/features/settings/SettingsIconGrid'
import AccountSettingsSummaryCard from '@/app/components/features/settings/cards/AccountSettingsSummaryCard'
import { User, Bell, Monitor } from 'lucide-react'

// Modals
import UserProfileModal from '@/app/components/features/settings/modals/UserProfileModal'
import SystemSettingsModal from '@/app/components/features/settings/modals/SystemSettingsModal'
import DisplaySettingsModal from '@/app/components/features/settings/modals/DisplaySettingsModal'
import ConfirmDialog from '@/app/components/ui/ConfirmDialog'

export default function SettingsPage() {
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SETTINGS.systemSettings)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    avatar: '',
    bio: ''
  })
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    theme: 'light',
    language: 'ko',
    timezone: 'Asia/Seoul',
    dateFormat: 'YYYY년 MM월 DD일',
    currency: 'KRW',
    timeFormat: '24h'
  })
  const [loading, setLoading] = useState(true)

  // Modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [systemModalOpen, setSystemModalOpen] = useState(false)
  const [displayModalOpen, setDisplayModalOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  const toast = useAppToast()

  // 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        const [settingsData, profileRes] = await Promise.all([
          settingsApi.get(),
          fetch('/api/user/me', { credentials: 'include' })
        ])
        setSystemSettings(settingsData.systemSettings)
        if (settingsData.displaySettings) {
          setDisplaySettings(prev => ({ ...prev, ...settingsData.displaySettings }))
        }

        if (profileRes.ok) {
          const { profile } = await profileRes.json()
          if (profile) {
            setUserProfile(prev => ({
              ...prev,
              name: profile.name ?? prev.name,
              email: profile.email ?? prev.email,
              phone: profile.phone ?? prev.phone
            }))
          }
        }
      } catch (error) {
        logger.error('설정 로드 실패', error, 'SettingsPage')
        toast.error(getLocalizedErrorMessage(error, '설정을 불러오는데 실패했습니다.'))
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
    // 마운트 시 1회만 로드
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 개인 프로필 저장
  const handleSaveUserProfile = async (data: UserProfile) => {
    try {
      const res = await fetch('/api/user/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || '저장에 실패했습니다.')
      }
      setUserProfile(data)
      toast.success('개인 정보가 저장되었습니다.')
    } catch (error) {
      logger.error('개인 정보 저장 실패', error, 'SettingsPage')
      toast.error(getLocalizedErrorMessage(error, '개인 정보 저장에 실패했습니다.'))
    }
  }

  // 표시 설정 저장
  const handleSaveDisplaySettings = async (data: DisplaySettings) => {
    try {
      await settingsApi.update({ displaySettings: data })
      setDisplaySettings(data)
      toast.success('표시 설정이 저장되었습니다.')
    } catch (error) {
      logger.error('표시 설정 저장 실패', error, 'SettingsPage')
      toast.error(getLocalizedErrorMessage(error, '표시 설정 저장에 실패했습니다.'))
    }
  }

  // 계정 관리 핸들러들
  const handleLogout = async () => {
    try {
      const authApi = await getAuthApi()
      await authApi.logout()
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      } catch {
        // 세션 정리 실패해도 진행
      }
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear()
        } catch { /* ignore */ }
      }
      toast.success('로그아웃되었습니다.')
      window.location.href = '/login'
    } catch (error) {
      toast.error(getLocalizedErrorMessage(error, '로그아웃에 실패했습니다.'))
    }
  }

  const handleExportData = async () => {
    try {
      toast.info('데이터를 불러오는 중입니다...')
      const [customers, products, inventoryRes] = await Promise.all([
        customersApi.list({ limit: 10000 }),
        productsApi.list({ limit: 10000 }),
        fetch('/api/inventory?limit=10000&page=1').then(r => r.json()),
      ])
      const inventoryData = Array.isArray(inventoryRes?.data) ? inventoryRes.data : []
      const sheets = [
        { name: '고객', data: prepareCustomerDataForExport(customers) },
        { name: '상품', data: prepareProductDataForExport(products) },
        { name: '재고', data: prepareInventoryDataForExport(inventoryData) },
      ]
      const filename = `beautyhub-data-${new Date().toISOString().slice(0, 10)}.xlsx`
      exportToExcelMultiSheet(sheets, filename)
      toast.success('데이터 내보내기가 완료되었습니다.')
    } catch (error) {
      logger.error('데이터 내보내기 실패', error, 'SettingsPage')
      toast.error(getLocalizedErrorMessage(error, '데이터 내보내기에 실패했습니다.'))
    }
  }

  // 시스템 설정 저장
  const handleSaveSystemSettings = async (data: SystemSettings) => {
    try {
      await settingsApi.update({ systemSettings: data })
      setSystemSettings(data)
      toast.success('시스템 설정이 저장되었습니다.')
    } catch (error) {
      logger.error('시스템 설정 저장 실패', error, 'SettingsPage')
      toast.error(getLocalizedErrorMessage(error, '시스템 설정 저장에 실패했습니다.'))
    }
  }

  if (loading) {
    return (
      <PageContainer maxWidth={false}>
        <Box sx={{ flex: 1, minHeight: 0, overflowY: { xs: 'auto', md: 'hidden' } }}>
          <SettingsSkeleton />
        </Box>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth={false}>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflowY: { xs: 'auto', md: 'hidden' },
        }}
      >
        <Stack
          spacing={{ xs: 2, sm: 1.5, md: 2 }}
          sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        >
          <PageIntro description="계정 및 시스템 설정을 관리합니다" />
          <Stack
            spacing={{ xs: 2, sm: 1.5, md: 1.5 }}
            sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <SettingsIconGrid
                items={[
                  { id: 'profile', label: '개인 정보', icon: <User size={24} />, onClick: () => setProfileModalOpen(true) },
                  { id: 'system', label: '시스템', icon: <Bell size={24} />, onClick: () => setSystemModalOpen(true) },
                  { id: 'display', label: '표시', icon: <Monitor size={24} />, onClick: () => setDisplayModalOpen(true) },
                ]}
              />
            </Box>

            <Box sx={{ flexShrink: 0 }}>
              <AccountSettingsSummaryCard
                onLogout={() => setLogoutConfirmOpen(true)}
                onExportData={handleExportData}
              />
            </Box>
          </Stack>
        </Stack>
      </Box>

      {/* 모달들 */}
      <UserProfileModal
        open={profileModalOpen}
        data={userProfile}
        onClose={() => setProfileModalOpen(false)}
        onSave={handleSaveUserProfile}
      />

      <SystemSettingsModal
        open={systemModalOpen}
        data={systemSettings}
        onClose={() => setSystemModalOpen(false)}
        onSave={handleSaveSystemSettings}
      />

      <DisplaySettingsModal
        open={displayModalOpen}
        data={displaySettings}
        onClose={() => setDisplayModalOpen(false)}
        onSave={handleSaveDisplaySettings}
      />

      <ConfirmDialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title="로그아웃"
        description="정말 로그아웃하시겠습니까?"
        confirmText="로그아웃"
        variant="danger"
      />
    </PageContainer>
  )
}
