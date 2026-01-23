/**
 * 설정 관련 비즈니스 로직 서비스
 * 설정 검증, 기본값 처리 로직을 담당
 */

import type { SystemSettings, UserProfile, SecuritySettings, DisplaySettings } from '@/types/settings'

export class SettingsService {
  /**
   * 시스템 설정 검증
   */
  static validateSystemSettings(_settings: Partial<SystemSettings>): boolean {
    // 필요한 검증 로직
    return true
  }

  /**
   * 사용자 프로필 검증
   */
  static validateUserProfile(profile: Partial<UserProfile>): boolean {
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      return false
    }
    return true
  }

  /**
   * 보안 설정 검증
   */
  static validateSecuritySettings(settings: Partial<SecuritySettings>): boolean {
    if (settings.sessionTimeout && (settings.sessionTimeout < 5 || settings.sessionTimeout > 1440)) {
      return false
    }
    return true
  }

  /**
   * 표시 설정 검증
   */
  static validateDisplaySettings(_settings: Partial<DisplaySettings>): boolean {
    // 필요한 검증 로직
    return true
  }

  /**
   * 설정 병합 (기본값 + 사용자 설정)
   */
  static mergeSettings<T extends Record<string, unknown>>(
    defaults: T,
    userSettings: Partial<T>
  ): T {
    return { ...defaults, ...userSettings }
  }
}
