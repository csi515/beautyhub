'use client'

import { useEffect, useState } from 'react'
import { useAppToast } from '@/app/lib/ui/toast'
import { settingsApi } from '@/app/lib/api/settings'
import { DEFAULT_SETTINGS, type SystemSettings, type UserProfile, type SecuritySettings, type DisplaySettings } from '@/types/settings'
import SettingsSkeleton from '@/app/components/skeletons/SettingsSkeleton'

// MUI Imports (레이아웃 유틸리티만 허용)
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import PageContainer from '../components/layout/PageContainer'
import PageIntro from '../components/common/PageIntro'

import SettingsIconGrid from '@/app/components/features/settings/SettingsIconGrid'
import AccountSettingsSummaryCard from '@/app/components/features/settings/cards/AccountSettingsSummaryCard'
import { User, Bell, Shield, Monitor } from 'lucide-react'

// Modals
import UserProfileModal from '@/app/components/features/settings/modals/UserProfileModal'
import SystemSettingsModal from '@/app/components/features/settings/modals/SystemSettingsModal'
import SecuritySettingsModal from '@/app/components/features/settings/modals/SecuritySettingsModal'
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
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 60
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
  const [securityModalOpen, setSecurityModalOpen] = useState(false)
  const [displayModalOpen, setDisplayModalOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  const toast = useAppToast()

  // 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        const data = await settingsApi.get()
        setSystemSettings(data.systemSettings)

        // TODO: 실제 사용자 API에서 프로필 정보 로드
        // 임시로 mock 데이터 사용
        setUserProfile({
          name: '사용자',
          email: 'user@example.com',
          phone: '',
          birthdate: '',
          avatar: '',
          bio: ''
        })
      } catch (error) {
        console.error('설정 로드 실패:', error)
        toast.error('설정을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 개인 프로필 저장
  const handleSaveUserProfile = async (data: UserProfile) => {
    try {
      // TODO: 실제 사용자 API로 프로필 저장
      setUserProfile(data)
      toast.success('개인 정보가 저장되었습니다.')
    } catch (error) {
      console.error('개인 정보 저장 실패:', error)
      toast.error('개인 정보 저장에 실패했습니다.', error instanceof Error ? error.message : '알 수 없는 오류')
    }
  }

  // 보안 설정 저장
  const handleSaveSecuritySettings = async (data: SecuritySettings) => {
    try {
      // TODO: 실제 보안 설정 API로 저장
      setSecuritySettings(data)
      toast.success('보안 설정이 저장되었습니다.')
    } catch (error) {
      console.error('보안 설정 저장 실패:', error)
      toast.error('보안 설정 저장에 실패했습니다.', error instanceof Error ? error.message : '알 수 없는 오류')
    }
  }

  // 표시 설정 저장
  const handleSaveDisplaySettings = async (data: DisplaySettings) => {
    try {
      // TODO: 실제 표시 설정 API로 저장
      setDisplaySettings(data)
      toast.success('표시 설정이 저장되었습니다.')
    } catch (error) {
      console.error('표시 설정 저장 실패:', error)
      toast.error('표시 설정 저장에 실패했습니다.', error instanceof Error ? error.message : '알 수 없는 오류')
    }
  }

  // 계정 관리 핸들러들
  const handleLogout = async () => {
    try {
      // TODO: 실제 로그아웃 API 호출
      toast.success('로그아웃되었습니다.')
      // 리다이렉트 로직
      window.location.href = '/login'
    } catch (error) {
      toast.error('로그아웃에 실패했습니다.')
    }
  }

  const handleExportData = async () => {
    try {
      // TODO: 실제 데이터 익스포트 API 호출
      toast.success('데이터 내보내기가 시작되었습니다. 이메일로 다운로드 링크를 보내드리겠습니다.')
    } catch (error) {
      toast.error('데이터 내보내기에 실패했습니다.')
    }
  }

  // 시스템 설정 저장
  const handleSaveSystemSettings = async (data: SystemSettings) => {
    try {
      await settingsApi.update({ systemSettings: data })
      setSystemSettings(data)
      toast.success('시스템 설정이 저장되었습니다.')
    } catch (error) {
      console.error('시스템 설정 저장 실패:', error)
      toast.error('시스템 설정 저장에 실패했습니다.', error instanceof Error ? error.message : '알 수 없는 오류')
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
          spacing={{ xs: 4, sm: 2, md: 3 }}
          sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        >
          <PageIntro description="계정 및 시스템 설정을 관리합니다" />
          <Stack
            spacing={{ xs: 3, sm: 2, md: 2 }}
            sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <SettingsIconGrid
                items={[
                  { id: 'profile', label: '개인 정보', icon: <User size={24} />, onClick: () => setProfileModalOpen(true) },
                  { id: 'system', label: '시스템', icon: <Bell size={24} />, onClick: () => setSystemModalOpen(true) },
                  { id: 'security', label: '보안', icon: <Shield size={24} />, onClick: () => setSecurityModalOpen(true) },
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

      <SecuritySettingsModal
        open={securityModalOpen}
        data={securitySettings}
        onClose={() => setSecurityModalOpen(false)}
        onSave={handleSaveSecuritySettings}
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
