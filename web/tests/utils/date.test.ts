/**
 * 날짜 포맷팅 유틸리티 테스트
 */

import { describe, it, expect } from 'vitest'
import {
  formatKoreanDateTime,
  formatDate,
  formatKoreanHour,
  formatDateRange,
  formatRelativeTime,
} from '@/app/lib/utils/date'

describe('date utils', () => {
  describe('formatKoreanDateTime', () => {
    it('ISO 날짜 문자열을 한국어 형식으로 변환', () => {
      const result = formatKoreanDateTime('2024-01-15T10:30:00')
      expect(result).toContain('2024년')
      expect(result).toContain('1월')
      expect(result).toContain('15일')
      expect(result).toContain('오전')
      expect(result).toContain('10시')
      expect(result).toContain('30분')
    })

    it('오후 시간 처리', () => {
      const result = formatKoreanDateTime('2024-01-15T14:30:00')
      expect(result).toContain('오후')
      expect(result).toContain('2시')
    })

    it('잘못된 형식 처리', () => {
      const result = formatKoreanDateTime('invalid-date')
      expect(result).toBe('invalid-date')
    })
  })

  describe('formatDate', () => {
    it('ISO 날짜 문자열을 날짜 형식으로 변환', () => {
      const result = formatDate('2024-01-15T10:30:00')
      expect(result).toBe('2024-01-15')
    })

    it('짧은 문자열 처리', () => {
      const result = formatDate('2024-01-15')
      expect(result).toBe('2024-01-15')
    })
  })

  describe('formatKoreanHour', () => {
    it('시간 형식 변환', () => {
      const result = formatKoreanHour('2024-01-15T10:30:00')
      expect(result).toContain('오전')
      expect(result).toContain('10시')
      expect(result).toContain('30분')
    })

    it('정각 시간 처리', () => {
      const result = formatKoreanHour('2024-01-15T12:00:00')
      expect(result).toContain('오후')
      expect(result).toContain('12시')
    })
  })

  describe('formatDateRange', () => {
    it('월 뷰 형식', () => {
      const start = new Date('2024-01-15')
      const end = new Date('2024-02-15')
      const result = formatDateRange(start, end, 'month')
      expect(result).toBe('2024년 1월')
    })

    it('주 뷰 형식', () => {
      const start = new Date('2024-01-15')
      const end = new Date('2024-01-22')
      const result = formatDateRange(start, end, 'week')
      expect(result).toContain('2024년 1월 15일')
      expect(result).toContain('~')
    })

    it('일 뷰 형식', () => {
      const start = new Date('2024-01-15')
      const end = new Date('2024-01-15')
      const result = formatDateRange(start, end, 'day')
      expect(result).toContain('2024년 1월 15일')
    })
  })

  describe('formatRelativeTime', () => {
    it('방금 전', () => {
      const now = new Date()
      const result = formatRelativeTime(now.toISOString())
      expect(result).toBe('방금 전')
    })

    it('몇 분 전', () => {
      const date = new Date()
      date.setMinutes(date.getMinutes() - 5)
      const result = formatRelativeTime(date.toISOString())
      expect(result).toContain('분 전')
    })

    it('몇 시간 전', () => {
      const date = new Date()
      date.setHours(date.getHours() - 2)
      const result = formatRelativeTime(date.toISOString())
      expect(result).toContain('시간 전')
    })

    it('몇 일 전', () => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      const result = formatRelativeTime(date.toISOString())
      expect(result).toContain('일 전')
    })
  })
})

