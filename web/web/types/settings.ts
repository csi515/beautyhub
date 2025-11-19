/**
 * 설정(Settings) 관련 타입 정의
 */

/**
 * 가게 기본 정보 설정
 */
export interface BusinessProfile {
  storeName: string
  address?: string
  phone?: string
  ownerName?: string
  businessHours: {
    [key: string]: {
      open?: string
      close?: string
      closed?: boolean
    }
  }
  regularHolidays: string[] // 요일 배열 (예: ['sunday', 'monday'])
  bookingAdvanceDays: number // 예약 가능 기간 (일 단위)
  businessRegistrationNumber?: string
  businessCategory?: string
}

/**
 * 예약 및 스케줄 정책 설정
 */
export interface BookingSettings {
  minBookingInterval: number // 분 단위 (15, 30, 60)
  maxBookingHoursPerDay: number // 하루 최대 예약 가능 시간
  availableDays: string[] // 예약 가능 요일 (['monday', 'tuesday', ...])
  reminderTimings: number[] // 리마인드 타이밍 (시간 단위, 예: [1, 3, 24])
  pushNotificationOnCreate: boolean
  pushNotificationOnCancel: boolean
  autoMessages: {
    confirmed: string
    reminder: string
    cancelled: string
  }
}

/**
 * 재무 및 정산 설정
 */
export interface FinancialSettings {
  expenseCategories: string[]
  expenseCategoryColors: Record<string, string> // 카테고리별 색상
  expenseCategoryIcons: Record<string, string> // 카테고리별 아이콘
  bankName?: string
  accountNumber?: string
  accountHolder?: string
  cashSettlementDay: number // 현금 정산일 (매월 N일)
  cardSettlementDay: number // 카드 정산일
  platformSettlementDay: number // 플랫폼 정산일
  autoCreateTransactionOnComplete: boolean
}

/**
 * 시스템 및 앱 관리 설정
 */
export interface SystemSettings {
  pushNotificationsEnabled: boolean
  customerNotificationsEnabled: boolean
  internalNotificationsEnabled: boolean
  autoLogoutMinutes: number // 자동 로그아웃 시간 (분 단위)
  apiKeys?: Record<string, string> // API 키 관리
}

/**
 * 전체 설정 객체
 */
export interface AppSettings {
  businessProfile: BusinessProfile
  bookingSettings: BookingSettings
  financialSettings: FinancialSettings
  systemSettings: SystemSettings
}

/**
 * 설정 업데이트 DTO
 */
export interface SettingsUpdateInput {
  businessProfile?: Partial<BusinessProfile>
  bookingSettings?: Partial<BookingSettings>
  financialSettings?: Partial<FinancialSettings>
  systemSettings?: Partial<SystemSettings>
}

/**
 * 기본 설정 값
 */
export const DEFAULT_SETTINGS: AppSettings = {
  businessProfile: {
    storeName: '',
    address: '',
    phone: '',
    ownerName: '',
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: true },
    },
    regularHolidays: ['sunday'],
    bookingAdvanceDays: 14,
    businessRegistrationNumber: '',
    businessCategory: '',
  },
  bookingSettings: {
    minBookingInterval: 30,
    maxBookingHoursPerDay: 8,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    reminderTimings: [24, 3, 1],
    pushNotificationOnCreate: true,
    pushNotificationOnCancel: true,
    autoMessages: {
      confirmed: '예약이 확정되었습니다. 감사합니다.',
      reminder: '내일 예약이 있습니다. 시간을 확인해주세요.',
      cancelled: '예약이 취소되었습니다.',
    },
  },
  financialSettings: {
    expenseCategories: ['임대료', '인건비', '재료비', '광고비', '유지보수', '전기세', '수도세', '인터넷비', '기타'],
    expenseCategoryColors: {},
    expenseCategoryIcons: {},
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    cashSettlementDay: 1,
    cardSettlementDay: 1,
    platformSettlementDay: 1,
    autoCreateTransactionOnComplete: false,
  },
  systemSettings: {
    pushNotificationsEnabled: true,
    customerNotificationsEnabled: true,
    internalNotificationsEnabled: true,
    autoLogoutMinutes: 30,
    apiKeys: {},
  },
}

/**
 * 요일 라벨 매핑
 */
export const DAY_LABELS: Record<string, string> = {
  monday: '월요일',
  tuesday: '화요일',
  wednesday: '수요일',
  thursday: '목요일',
  friday: '금요일',
  saturday: '토요일',
  sunday: '일요일',
}

