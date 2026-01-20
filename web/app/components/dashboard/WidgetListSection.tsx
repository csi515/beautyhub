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
          <Button 
            size="small" 
            onClick={onReset} 
            color="warning"
            sx={{ 
              minHeight: { xs: '36px', sm: 'auto' },
              fontSize: { xs: '0.875rem', sm: '0.8125rem' }
            }}
          >
            기본값으로 복원
          </Button>
        </Box>
        <List dense>
          {widgets.map((widget, index) => (
            <ListItem 
              key={widget.id}
              sx={{
                minHeight: { xs: '64px', sm: 'auto' },
                py: { xs: 1.5, sm: 1 },
                borderBottom: { xs: '1px solid', sm: 'none' },
                borderColor: { xs: 'divider', sm: 'transparent' },
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' }, fontWeight: 500 }}>
                      {WIDGET_METADATA[widget.type].name}
                    </Typography>
                    {!widget.visible && (
                      <Chip 
                        label="숨김" 
                        size="small" 
                        color="default"
                        sx={{ height: { xs: 20, sm: 24 }, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Typography sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, mt: 0.5 }}>
                    {WIDGET_METADATA[widget.type].description}
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                  <IconButton
                    size="small"
                    disabled={index === 0}
                    onClick={() => handleMoveUp(index)}
                    sx={{ minWidth: { xs: 44, sm: 40 }, minHeight: { xs: 44, sm: 40 } }}
                    aria-label="위로 이동"
                  >
                    ↑
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={index === widgets.length - 1}
                    onClick={() => handleMoveDown(index)}
                    sx={{ minWidth: { xs: 44, sm: 40 }, minHeight: { xs: 44, sm: 40 } }}
                    aria-label="아래로 이동"
                  >
                    ↓
                  </IconButton>
                  <Switch
                    checked={widget.visible}
                    onChange={() => handleToggleVisibility(widget.id)}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase': {
                        padding: '9px',
                      },
                      '& .MuiSwitch-thumb': {
                        width: '20px',
                        height: '20px',
                      },
                    }}
                  />
                  {widgets.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemove(widget.id)}
                      color="error"
                      sx={{ minWidth: { xs: 44, sm: 40 }, minHeight: { xs: 44, sm: 40 } }}
                      aria-label="위젯 삭제"
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  )}
                </Box>
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
                sx={{ 
                  cursor: 'pointer',
                  minHeight: { xs: '36px', sm: '32px' },
                  fontSize: { xs: '0.875rem', sm: '0.8125rem' },
                  '&:active': {
                    transform: 'scale(0.95)'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </>
  )
}
