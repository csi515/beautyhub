'use client'

import {
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  Box,
  Typography,
  Chip,
} from '@mui/material'
import { Trash2 } from 'lucide-react'
import type { WidgetConfig } from '@/app/lib/utils/dashboardWidgets'
import { WIDGET_METADATA, type WidgetType } from '@/app/lib/utils/dashboardWidgets'

interface WidgetListSectionProps {
  widgets: WidgetConfig[]
  onWidgetsChange: (widgets: WidgetConfig[]) => void
  onAddWidget: (type: WidgetType) => void
  onReset: () => void
}

export default function WidgetListSection({
  widgets,
  onWidgetsChange,
  onAddWidget,
  onReset,
}: WidgetListSectionProps) {
  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newWidgets = [...widgets]
    ;[newWidgets[index - 1], newWidgets[index]] = [newWidgets[index], newWidgets[index - 1]]
    onWidgetsChange(newWidgets.map((w, i) => ({ ...w, position: i })))
  }

  const handleMoveDown = (index: number) => {
    if (index === widgets.length - 1) return
    const newWidgets = [...widgets]
    ;[newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]]
    onWidgetsChange(newWidgets.map((w, i) => ({ ...w, position: i })))
  }

  const handleToggleVisibility = (widgetId: string) => {
    onWidgetsChange(widgets.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w)))
  }

  const handleRemove = (widgetId: string) => {
    if (widgets.filter((w) => w.visible).length <= 1) {
      return
    }
    onWidgetsChange(widgets.filter((w) => w.id !== widgetId))
  }

  const availableWidgetTypes = Object.entries(WIDGET_METADATA).filter(
    ([type]) => !widgets.some((w) => w.type === type)
  ) as Array<[WidgetType, typeof WIDGET_METADATA[WidgetType]]>

  return (
    <>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            위젯 목록
          </Typography>
          <Button size="small" onClick={onReset} color="warning">
            기본값으로 복원
          </Button>
        </Box>
        <List dense>
          {widgets.map((widget, index) => (
            <ListItem key={widget.id}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {WIDGET_METADATA[widget.type].name}
                    {!widget.visible && (
                      <Chip label="숨김" size="small" color="default" />
                    )}
                  </Box>
                }
                secondary={WIDGET_METADATA[widget.type].description}
              />
              <ListItemSecondaryAction>
                <IconButton
                  size="small"
                  disabled={index === 0}
                  onClick={() => handleMoveUp(index)}
                >
                  ↑
                </IconButton>
                <IconButton
                  size="small"
                  disabled={index === widgets.length - 1}
                  onClick={() => handleMoveDown(index)}
                >
                  ↓
                </IconButton>
                <Switch
                  checked={widget.visible}
                  onChange={() => handleToggleVisibility(widget.id)}
                  size="small"
                />
                {widgets.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => handleRemove(widget.id)}
                    color="error"
                  >
                    <Trash2 size={16} />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>

      {availableWidgetTypes.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            위젯 추가
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {availableWidgetTypes.map(([type, meta]) => (
              <Chip
                key={type}
                label={meta.name}
                onClick={() => onAddWidget(type)}
                variant="outlined"
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      )}
    </>
  )
}
