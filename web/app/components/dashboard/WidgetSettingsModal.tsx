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
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">대시보드 위젯 설정</Typography>
          <IconButton onClick={onClose} size="small">
            <X size={18} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
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
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleSave}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  )
}
