/**
 * Settings 페이지 View 컴포넌트
 * 순수 UI만 담당, 모든 로직은 props로 받음
 */

'use client'

import { useEffect } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useTheme, useMediaQuery } from '@mui/material'
import StandardPageLayout from '../common/StandardPageLayout'
import { usePageHeader } from '@/app/lib/contexts/PageHeaderContext'
import UserProfileSummaryCard from './cards/UserProfileSummaryCard'
import SystemSettingsSummaryCard from './cards/SystemSettingsSummaryCard'
import SecuritySettingsSummaryCard from './cards/SecuritySettingsSummaryCard'
import DisplaySettingsSummaryCard from './cards/DisplaySettingsSummaryCard'
import AccountSettingsSummaryCard from './cards/AccountSettingsSummaryCard'
import type { SystemSettings, UserProfile, SecuritySettings, DisplaySettings } from '@/types/settings'

export interface SettingsPageViewProps {
    // 데이터
    systemSettings: SystemSettings
    userProfile: UserProfile
    securitySettings: SecuritySettings
    displaySettings: DisplaySettings
    loading: boolean
    
    // 액션
    onEditProfile: () => void
    onEditSystemSettings: () => void
    onEditSecuritySettings: () => void
    onEditDisplaySettings: () => void
    onLogout: () => void
    onExportData: () => void
}

export default function SettingsPageView({
    systemSettings,
    userProfile,
    securitySettings,
    displaySettings,
    loading,
    onEditProfile,
    onEditSystemSettings,
    onEditSecuritySettings,
    onEditDisplaySettings,
    onLogout,
    onExportData,
}: SettingsPageViewProps) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const { setHeaderInfo, clearHeaderInfo } = usePageHeader()

    // 모바일에서 Context에 헤더 정보 설정
    useEffect(() => {
        if (isMobile) {
            setHeaderInfo({
                title: '설정',
                description: '계정 정보, 알림, 표시 등 개인 설정을 관리하세요',
            })
        } else {
            clearHeaderInfo()
        }

        return () => {
            if (isMobile) {
                clearHeaderInfo()
            }
        }
    }, [isMobile, setHeaderInfo, clearHeaderInfo])

    return (
        <StandardPageLayout
            loading={loading}
            maxWidth={{ xs: '100%', md: '1200px' }}
        >
            <Stack spacing={{ xs: 1, sm: 1.5, md: 3 }}>
                {/* 헤더 */}
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                        설정
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                        계정 정보, 알림, 표시 등 개인 설정을 관리하세요
                    </Typography>
                </Box>

                {/* 요약 카드들 */}
                <Stack spacing={{ xs: 1, sm: 1.5, md: 2 }}>
                    <UserProfileSummaryCard
                        data={userProfile}
                        onEdit={onEditProfile}
                    />

                    <SystemSettingsSummaryCard
                        data={systemSettings}
                        onEdit={onEditSystemSettings}
                    />

                    <SecuritySettingsSummaryCard
                        data={securitySettings}
                        onEdit={onEditSecuritySettings}
                    />

                    <DisplaySettingsSummaryCard
                        data={displaySettings}
                        onEdit={onEditDisplaySettings}
                    />

                    <AccountSettingsSummaryCard
                        onLogout={onLogout}
                        onExportData={onExportData}
                    />
                </Stack>
            </Stack>
        </StandardPageLayout>
    )
}
