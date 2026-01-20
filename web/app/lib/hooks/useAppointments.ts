'use client'

import { useState, useCallback } from 'react'
import { mapAppointments, AppointmentEvent, getDateRange, CalendarView } from '../utils/appointmentUtils'

type AppointmentRow = {
  id: string
  appointment_date: string
  status: string
  notes?: string | null
  service_id?: string | null
  customer_id?: string | null
  staff_id?: string | null
}

type Product = {
  id: string | number
  name: string
}

export function useAppointments() {
  const [events, setEvents] = useState<AppointmentEvent[]>([])
  const [loading, setLoading] = useState(false)

  const reloadCalendar = useCallback(async (date: Date, viewType: CalendarView): Promise<void> => {
    try {
      setLoading(true)
      const { start, end } = getDateRange(date, viewType)
      const from = start.toISOString()
      const to = end.toISOString()

      const { appointmentsApi } = await import('@/app/lib/api/appointments')
      const { productsApi } = await import('@/app/lib/api/products')
      const options: Parameters<typeof appointmentsApi.list>[0] = {}
      if (from) {
        options.from = from
      }
      if (to) {
        options.to = to
      }
      const [rows, products] = await Promise.all([
        appointmentsApi.list(options),
        productsApi.list({ limit: 1000 }),
      ])
      const rowsArray = Array.isArray(rows) ? (rows as AppointmentRow[]) : []
      const productsArray = Array.isArray(products) ? (products as Product[]) : []
      setEvents(mapAppointments(rowsArray, productsArray))
    } catch (error) {
      if (typeof window !== 'undefined') {
        const { logger } = await import('../utils/logger')
        logger.error('예약 캘린더 로딩 실패', error, 'AppointmentsPage')
      } else {
        console.error('예약 캘린더 로딩 실패', error)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    events,
    loading,
    reloadCalendar,
  }
}
