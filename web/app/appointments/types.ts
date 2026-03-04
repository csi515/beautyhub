export type CalendarView = 'month' | 'week' | 'day'

export type SelectedAppointment = {
    id: string
    date: string
    start: string
    end?: string
    status: string
    notes?: string
    service_id?: string
    customer_id?: string
    staff_id?: string
    no_show?: boolean
}

export type DateRange = { from?: string; to?: string }
