import { useState, useMemo } from 'react'
import { useSearch } from '../../lib/hooks/useSearch'
import type { AppointmentEvent } from '../utils/appointmentUtils'

export function useAppointmentsData() {
    const [events, setEvents] = useState<AppointmentEvent[]>([])
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const { query, debouncedQuery, setQuery } = useSearch({ debounceMs: 300 })

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            // Search
            if (debouncedQuery.trim()) {
                const q = debouncedQuery.toLowerCase()
                const titleMatch = event.title.toLowerCase().includes(q)
                const noteMatch = (event.extendedProps?.notes || '').toLowerCase().includes(q)
                const productMatch = (event.extendedProps?.product_name || '').toLowerCase().includes(q)
                if (!titleMatch && !noteMatch && !productMatch) return false
            }
            // Status
            if (statusFilter !== 'all' && event.extendedProps?.status !== statusFilter) return false
            return true
        })
    }, [events, debouncedQuery, statusFilter])

    return {
        events,
        setEvents,
        filteredEvents,
        query,
        setQuery,
        statusFilter,
        setStatusFilter,
    }
}
