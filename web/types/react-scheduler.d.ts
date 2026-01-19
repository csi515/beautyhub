declare module '@aldabil/react-scheduler/dist/types' {
    export interface ProcessedEvent {
        event_id: number | string
        title: string
        start: Date
        end: Date
        disabled?: boolean
        color?: string
        editable?: boolean
        deletable?: boolean
        draggable?: boolean
        allDay?: boolean
        admin_id?: string | number
        [key: string]: any
    }

    export interface SchedulerRef {
        scheduler: {
            handleState: (value: any, name: string) => void
            confirmEvent: (event: ProcessedEvent, action: 'create' | 'edit') => Promise<ProcessedEvent>
            onDelete: (deletedId: string | number) => Promise<string | number | void>
        }
    }

    export interface ViewEvent {
        event_id: number | string
        title: string
        start: Date
        end: Date
        [key: string]: any
    }
}

declare module '@aldabil/react-scheduler' {
    import { FC } from 'react'
    import { ProcessedEvent } from '@aldabil/react-scheduler/dist/types'

    export interface SchedulerProps {
        events?: ProcessedEvent[]
        height?: number | string
        view?: 'month' | 'week' | 'day'
        month?: {
            weekDays?: number[]
            weekStartOn?: number
            startHour?: number
            endHour?: number
            navigation?: boolean
            disableGoToDay?: boolean
        }
        week?: {
            weekDays?: number[]
            weekStartOn?: number
            startHour?: number
            endHour?: number
            step?: number
            navigation?: boolean
            disableGoToDay?: boolean
        }
        day?: {
            startHour?: number
            endHour?: number
            step?: number
            navigation?: boolean
        }
        selectedDate?: Date
        onSelectedDateChange?: (date: Date) => void
        onEventEdit?: (event: ProcessedEvent) => Promise<ProcessedEvent>
        onEventDelete?: (deletedId: string | number) => Promise<string | number>
        onEventCreate?: (event: ProcessedEvent) => Promise<ProcessedEvent>
        viewerExtraComponent?: (fields: any, event: ProcessedEvent) => React.ReactNode
        fields?: any[]
        loading?: boolean
        customEditor?: (scheduler: any) => React.ReactNode
        viewerTitleComponent?: (event: ProcessedEvent) => React.ReactNode
        resources?: any[]
        resourceFields?: any
        resourceViewMode?: 'default' | 'tabs'
        recourseHeaderComponent?: (resource: any) => React.ReactNode
        direction?: 'ltr' | 'rtl'
        locale?: any
        hourFormat?: '12' | '24'
        timeZone?: string
        draggable?: boolean
        editable?: boolean
        deletable?: boolean
    }

    const Scheduler: FC<SchedulerProps>
    export default Scheduler
}
