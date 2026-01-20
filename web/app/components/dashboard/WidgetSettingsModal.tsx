'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Stack,
  Divider,
} from '@mui/material'
import { X } from 'lucide-react'
import type { WidgetConfig, DashboardPreset } from '@/app/lib/utils/dashboardWidgets'
import {
  loadWidgets,
  saveWidgets,
  loadPresets,
  resetToDefault,
  WIDGET_METADATA,
  type WidgetType,
} from '@/app/lib/utils/dashboardWidgets'
import { useAppToast } from '@/app/components/ui/Toast'
import WidgetPresetSection from './WidgetPresetSection'
import WidgetListSection from './WidgetListSection'

interface WidgetSettingsModalProps {
  open: boolean
  onClose: () => void
  onSave: (widgets: WidgetConfig[]) => void
}

export default function WidgetSettingsModal({ open, onClose, onSave }: WidgetSettingsModalProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([])
  const [presets, setPresets] = useState<DashboardPreset[]>([])
  const toast = useAppToast()

  useEffect(() => {
    if (open) {
      setWidgets(loadWidgets())
      setPresets(loadPresets())
    }
  }, [open])

  const handleAddWidget = (type: WidgetType) => {
    const newWidget: WidgetConfig = {
      id: `${type}_${Date.now()}`,
      type,
      position: widgets.length,
      visible: true,
      size: WIDGET_METADATA[type].defaultSize,
    }
    setWidgets([...widgets, newWidget])
  }

  const handleSave = () => {
    saveWidgets(widgets)
    onSave(widgets)
    toast.success('위젯 설정이 저장되었습니다.')
    onClose()
  }

  const handleLoadPreset = (presetWidgets: WidgetConfig[]) => {
    setWidgets(presetWidgets)
  }

  const handleReset = () => {
    if (confirm('기본 설정으로 복원하시겠습니까?')) {
      const defaultWidgets = resetToDefault()
      setWidgets(defaultWidgets)
      toast.success('기본 설정으로 복원되었습니다.')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' }, pb: { xs: 1, sm: 1.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>대시보드 위젯 설정</Typography>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ minWidth: { xs: 44, sm: 40 }, minHeight: { xs: 44, sm: 40 } }}
            aria-label="닫기"
          >
            <X size={18} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={{ xs: 2, sm: 3 }} sx={{ mt: 1 }}>
          <WidgetPresetSection
            presets={presets}
            widgets={widgets}
            onPresetsChange={setPresets}
            onLoadPreset={handleLoadPreset}
          />
          <Divider />
          <WidgetListSection
            widgets={widgets}
            onWidgetsChange={setWidgets}
            onAddWidget={handleAddWidget}
            onReset={handleReset}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: { xs: 2, sm: 2 }, gap: 1 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            minHeight: '44px', 
            flex: { xs: 1, sm: 'none' },
            fontSize: { xs: '0.9375rem', sm: '1rem' }
          }}
        >
          취소
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          sx={{ 
            minHeight: '44px', 
            flex: { xs: 1, sm: 'none' },
            fontSize: { xs: '0.9375rem', sm: '1rem' }
          }}
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  )
}
