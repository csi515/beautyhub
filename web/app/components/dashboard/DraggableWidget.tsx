'use client'

import { useState, useRef, useEffect } from 'react'
import { Box, IconButton, Paper } from '@mui/material'
import { GripVertical, X, Eye, EyeOff } from 'lucide-react'
import type { WidgetConfig } from '@/app/lib/utils/dashboardWidgets'

interface DraggableWidgetProps {
  widget: WidgetConfig
  children: React.ReactNode
  onMove?: (fromIndex: number, toIndex: number) => void
  onRemove?: (widgetId: string) => void
  onToggleVisibility?: (widgetId: string) => void
  index: number
  isEditing?: boolean
  widgetCount: number
}

export default function DraggableWidget({
  widget,
  children,
  onMove,
  onRemove,
  onToggleVisibility,
  index,
  isEditing = false,
  widgetCount,
}: DraggableWidgetProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const widgetRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return

    setIsDragging(true)
    const rect = widgetRef.current?.getBoundingClientRect()
    if (rect) {
      dragStartPos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isEditing) return

    setDragOffset({ x: e.clientX, y: e.clientY })

    // 드롭 영역 계산
    const widgets = document.querySelectorAll('[data-widget-index]')
    widgets.forEach((el, i) => {
      if (i === index) return

      const rect = el.getBoundingClientRect()
      const centerY = rect.top + rect.height / 2

      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        if (e.clientY < centerY && i < index) {
          // 위로 이동
          onMove?.(index, i)
        } else if (e.clientY > centerY && i > index) {
          // 아래로 이동
          onMove?.(index, i + 1)
        }
      }
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
    return undefined
  }, [isDragging, index])

  if (!widget.visible && !isEditing) {
    return null
  }

  return (
    <Paper
      ref={widgetRef}
      data-widget-index={index}
      sx={{
        position: 'relative',
        opacity: widget.visible ? 1 : 0.5,
        transition: isDragging ? 'none' : 'all 0.2s ease',
        transform: isDragging
          ? `translate(${dragOffset.x - (widgetRef.current?.getBoundingClientRect().left || 0)}px, ${dragOffset.y - (widgetRef.current?.getBoundingClientRect().top || 0)}px)`
          : 'none',
        zIndex: isDragging ? 1000 : 1,
        cursor: isEditing && !isDragging ? 'move' : 'default',
        '&:hover .widget-controls': {
          opacity: isEditing ? 1 : 0,
        },
      }}
    >
      {isEditing && (
        <Box
          className="widget-controls"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 0.5,
            opacity: 0,
            transition: 'opacity 0.2s',
            zIndex: 10,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 2,
          }}
        >
          <IconButton
            size="small"
            onClick={() => onToggleVisibility?.(widget.id)}
            title={widget.visible ? '숨기기' : '보이기'}
          >
            {widget.visible ? <Eye size={16} /> : <EyeOff size={16} />}
          </IconButton>
          <IconButton
            size="small"
            onMouseDown={handleMouseDown}
            title="이동"
            sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
          >
            <GripVertical size={16} />
          </IconButton>
          {widgetCount > 1 && (
            <IconButton
              size="small"
              onClick={() => onRemove?.(widget.id)}
              title="제거"
              color="error"
            >
              <X size={16} />
            </IconButton>
          )}
        </Box>
      )}
      {children}
    </Paper>
  )
}
