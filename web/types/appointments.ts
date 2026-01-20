/**
 * 예약 관련 타입 정의
 */

/**
 * 반복 예약 설정
 */
export interface AppointmentRepeat {
  days: number[] // 요일 배열 (0: 일요일, 1: 월요일, ..., 6: 토요일)
  weeks: number // 반복 주 수 (기본 4주)
}
