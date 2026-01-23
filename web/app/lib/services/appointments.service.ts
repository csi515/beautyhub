/**
 * 예약 관련 비즈니스 로직 서비스
 * 데이터 필터링, 정렬 로직을 담당
 */

import type { AppointmentEvent } from '../utils/appointmentUtils'

export interface AppointmentFilters {
  search?: string
  status?: 'all' | 'scheduled' | 'completed' | 'cancelled' | string
}

export class AppointmentsService {
  /**
   * 예약 이벤트 필터링
   */
  static filterAppointments(
    events: AppointmentEvent[],
    filters: AppointmentFilters
  ): AppointmentEvent[] {
    return events.filter((event) => {
      // Search query
      if (filters.search?.trim()) {
        const q = filters.search.trim().toLowerCase()
        const titleMatch = event.title.toLowerCase().includes(q)
        const noteMatch = (event.extendedProps?.notes || '').toLowerCase().includes(q)
        const productMatch = (event.extendedProps?.product_name || '').toLowerCase().includes(q)
        if (!titleMatch && !noteMatch && !productMatch) return false
      }

      // Status filter
      if (filters.status && filters.status !== 'all') {
        if (event.extendedProps?.status !== filters.status) return false
      }

      return true
    })
  }

  /**
   * 예약 데이터를 CSV 내보내기 형식으로 변환
   */
  static prepareAppointmentsForExport(events: AppointmentEvent[]): Array<{
    '예약일시': string
    '제목': string
    '서비스': string
    '상태': string
    '메모': string
  }> {
    const { format } = require('date-fns')
    
    return events.map(event => {
      const startDate = typeof event.start === 'string' ? new Date(event.start) : event.start
      
      return {
        '예약일시': format(startDate, 'yyyy-MM-dd HH:mm'),
        '제목': event.title.split(' · ')[0] || event.title,
        '서비스': event.extendedProps?.product_name || '-',
        '상태': event.extendedProps?.status === 'scheduled' ? '예약됨' :
          event.extendedProps?.status === 'completed' ? '완료' :
            event.extendedProps?.status === 'cancelled' ? '취소' : event.extendedProps?.status || '-',
        '메모': event.extendedProps?.notes || '-'
      }
    })
  }
}
