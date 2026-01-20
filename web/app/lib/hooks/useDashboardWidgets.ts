/**
 * 대시보드 위젯 관리 훅
 */

import { useState, useEffect } from 'react'
import type { WidgetConfig } from '../utils/dashboardWidgets'
import { loadWidgets, saveWidgets, moveWidget } from '../utils/dashboardWidgets'

export function useDashboardWidgets() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([])
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setWidgets(loadWidgets())
  }, [])

  const handleMove = (fromIndex: number, toIndex: number) => {
    const newWidgets = moveWidget(widgets, fromIndex, toIndex)
    setWidgets(newWidgets)
    saveWidgets(newWidgets)
  }

  const handleSave = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets)
    saveWidgets(newWidgets)
  }

  const toggleEdit = () => {
    setIsEditing(!isEditing)
  }

  return {
    widgets,
    isEditing,
    handleMove,
    handleSave,
    toggleEdit,
  }
}
