'use client'

import { useState } from 'react'
import {
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Box,
  Typography,
} from '@mui/material'
import { Save, Trash2, Plus } from 'lucide-react'
import type { WidgetConfig, DashboardPreset } from '@/app/lib/utils/dashboardWidgets'
import { savePreset, deletePreset, applyPreset } from '@/app/lib/utils/dashboardWidgets'
import { useAppToast } from '@/app/components/ui/Toast'

interface WidgetPresetSectionProps {
  presets: DashboardPreset[]
  widgets: WidgetConfig[]
  onPresetsChange: (presets: DashboardPreset[]) => void
  onLoadPreset: (widgets: WidgetConfig[]) => void
}

export default function WidgetPresetSection({
  presets,
  widgets,
  onPresetsChange,
  onLoadPreset,
}: WidgetPresetSectionProps) {
  const [presetName, setPresetName] = useState('')
  const [showPresetInput, setShowPresetInput] = useState(false)
  const toast = useAppToast()

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('프리셋 이름을 입력해주세요.')
      return
    }
    const preset = savePreset(presetName.trim(), widgets)
    onPresetsChange([...presets, preset])
    setPresetName('')
    setShowPresetInput(false)
    toast.success('프리셋이 저장되었습니다.')
  }

  const handleLoadPreset = (preset: DashboardPreset) => {
    const presetWidgets = [...preset.widgets]
    onLoadPreset(presetWidgets)
    applyPreset(preset)
    toast.success(`프리셋 "${preset.name}"이 적용되었습니다.`)
  }

  const handleDeletePreset = (presetId: string) => {
    deletePreset(presetId)
    onPresetsChange(presets.filter((p) => p.id !== presetId))
    toast.success('프리셋이 삭제되었습니다.')
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          프리셋
        </Typography>
        <Button
          size="small"
          startIcon={<Plus size={16} />}
          onClick={() => setShowPresetInput(true)}
        >
          새 프리셋
        </Button>
      </Box>
      {showPresetInput && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            size="small"
            placeholder="프리셋 이름"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleSavePreset}>
            저장
          </Button>
          <Button onClick={() => setShowPresetInput(false)}>취소</Button>
        </Box>
      )}
      {presets.length > 0 && (
        <List dense>
          {presets.map((preset) => (
            <ListItem key={preset.id}>
              <ListItemText
                primary={preset.name}
                secondary={new Date(preset.created_at).toLocaleDateString()}
              />
              <ListItemSecondaryAction>
                <IconButton size="small" onClick={() => handleLoadPreset(preset)}>
                  <Save size={16} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeletePreset(preset.id)}
                  color="error"
                >
                  <Trash2 size={16} />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}
