'use client'

import { useState, useCallback } from 'react'

export interface DateRange {
  from: string
  to: string
}

export type DateRangePreset = 'thisMonth' | 'lastMonth' | 'threeMonths'

const PRESETS: Record<DateRangePreset, () => DateRange> = {
  thisMonth: () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return {
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
    }
  },
  lastMonth: () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    return {
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
    }
  },
  threeMonths: () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return {
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
    }
  },
}

export function useDateRange(initialPreset: DateRangePreset = 'thisMonth') {
  const [range, setRange] = useState<DateRange>(() => PRESETS[initialPreset]())

  const updateRange = useCallback((partial: Partial<DateRange>) => {
    setRange((prev) => ({
      ...prev,
      ...partial,
    }))
  }, [])

  const setPreset = useCallback((preset: DateRangePreset) => {
    setRange(PRESETS[preset]())
  }, [])

  return {
    dateRange: range,
    from: range.from,
    to: range.to,
    updateRange,
    setPreset,
  }
}
