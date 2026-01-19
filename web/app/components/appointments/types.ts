export type AppointmentEvent = {
  id: string
  title: string
  start: Date | string
  end: Date | string
  allDay: boolean
  extendedProps: {
    status?: string
    notes?: string | null
    service_id?: string | null
    customer_id?: string | null
    staff_id?: string | null
    product_name?: string
  }
}

