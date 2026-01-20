import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { ko } from 'date-fns/locale'

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

export type AppointmentEvent = {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  extendedProps: {
    status: string
    notes: string
    service_id: string | null
    customer_id: string | null
    staff_id: string | null
    product_name: string
  }
}

export const formatKoreanHour = (iso: string): string => {
  try {
    const d = new Date(iso)
    const h = d.getHours()
    const isAM = h < 12
    const hh = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${isAM ? '오전' : '오후'} ${String(hh).padStart(2, '0')}시`
  } catch {
    return ''
  }
}

export const mapAppointments = (rows: AppointmentRow[], products: Product[]): AppointmentEvent[] => {
  const idToName: Record<string, string> = {}
  products.forEach((p) => {
    if (p?.id) idToName[String(p.id)] = p.name
  })

  return rows.map((a) => {
    const titleParts: string[] = []
    titleParts.push(formatKoreanHour(a.appointment_date))
    if (a.service_id && idToName[String(a.service_id)]) {
      titleParts.push(idToName[String(a.service_id)] || '')
    }
    const baseTitle = titleParts.filter(Boolean).join(' · ') || '예약'
    const title = a.notes ? `${baseTitle} · ${a.notes}` : baseTitle

    return {
      id: String(a.id),
      title,
      start: new Date(a.appointment_date),
      end: new Date(a.appointment_date),
      allDay: false,
      extendedProps: {
        status: a.status,
        notes: a.notes ?? '',
        service_id: a.service_id ?? null,
        customer_id: a.customer_id ?? null,
        staff_id: a.staff_id ?? null,
        product_name: a.service_id ? idToName[String(a.service_id)] || '' : '',
      },
    }
  })
}

export type CalendarView = 'month' | 'week' | 'day'

export const formatRangeLabel = (start: Date, end: Date, viewType: CalendarView): string => {
  if (viewType === 'month') {
    return format(start, 'yyyy년 M월', { locale: ko })
  }

  if (viewType === 'week') {
    return `${format(start, 'yyyy년 M월 d일', { locale: ko })} ~ ${format(end, 'M월 d일', { locale: ko })}`
  }

  return format(start, 'yyyy년 M월 d일', { locale: ko })
}

export const getDateRange = (date: Date, viewType: CalendarView): { start: Date; end: Date } => {
  if (viewType === 'month') {
    return {
      start: startOfWeek(startOfMonth(date), { locale: ko }),
      end: endOfWeek(endOfMonth(date), { locale: ko }),
    }
  } else if (viewType === 'week') {
    return {
      start: startOfWeek(date, { locale: ko }),
      end: endOfWeek(date, { locale: ko }),
    }
  } else {
    return {
      start: date,
      end: date,
    }
  }
}
