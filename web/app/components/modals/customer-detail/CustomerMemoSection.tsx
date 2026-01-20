'use client'

import { useState, useRef } from 'react'
import { Box, Stack, IconButton, Menu, MenuItem } from '@mui/material'
import { Mic, MicOff, FileText, Plus, Trash2 } from 'lucide-react'
import Input from '../../ui/Input'
import Button from '../../ui/Button'
import { useAppToast } from '@/app/lib/ui/toast'
import { isSpeechRecognitionSupported, startSpeechRecognition } from '@/app/lib/utils/speechToText'
import { useMemoTemplates } from '@/app/lib/hooks/useMemoTemplates'
import MemoTemplateModal, { type MemoTemplate } from '../MemoTemplateModal'

interface CustomerMemoSectionProps {
  value: string
  onChange: (value: string) => void
  customerId?: string
}

export default function CustomerMemoSection({ value, onChange, customerId: _customerId }: CustomerMemoSectionProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [templateMenuAnchor, setTemplateMenuAnchor] = useState<null | HTMLElement>(null)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<MemoTemplate | null>(null)
  const stopRecognitionRef = useRef<(() => void) | null>(null)
  const toast = useAppToast()
  const { createTemplate, deleteTemplate, getTemplatesByCategory } = useMemoTemplates()

  const handleStartRecording = () => {
    if (!isSpeechRecognitionSupported()) {
      toast.error('음성 인식을 지원하지 않는 브라우저입니다.')
      return
    }

    setIsRecording(true)
    const stop = startSpeechRecognition({
      language: 'ko-KR',
      continuous: false,
      interimResults: false,
      onResult: (result) => {
        onChange(value + (value ? '\n\n' : '') + result.transcript)
        setIsRecording(false)
        toast.success('음성 인식이 완료되었습니다.')
      },
      onError: (error) => {
        setIsRecording(false)
        toast.error(error.message || '음성 인식 중 오류가 발생했습니다.')
      },
      onEnd: () => {
        setIsRecording(false)
      },
    })

    stopRecognitionRef.current = stop
  }

  const handleStopRecording = () => {
    if (stopRecognitionRef.current) {
      stopRecognitionRef.current()
      stopRecognitionRef.current = null
    }
    setIsRecording(false)
  }

  const handleTemplateSelect = (template: MemoTemplate) => {
    onChange(value + (value ? '\n\n' : '') + template.content)
    setTemplateMenuAnchor(null)
    toast.success(`템플릿 "${template.title}"이 적용되었습니다.`)
  }

  const handleTemplateSave = (data: Omit<MemoTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    if (selectedTemplate) {
      // 수정 기능은 useMemoTemplates에 updateTemplate 추가 필요
      toast.error('템플릿 수정 기능은 아직 구현되지 않았습니다.')
    } else {
      createTemplate(data)
      toast.success('템플릿이 저장되었습니다.')
    }
    setTemplateModalOpen(false)
    setSelectedTemplate(null)
  }

  const handleTemplateDelete = (templateId: string) => {
    if (confirm('이 템플릿을 삭제하시겠습니까?')) {
      deleteTemplate(templateId)
      toast.success('템플릿이 삭제되었습니다.')
    }
  }

  const categories = ['general', 'consultation', 'followup', 'treatment']
  const templatesByCategory = categories.map((cat) => ({
    category: cat,
    templates: getTemplatesByCategory(cat),
  })).filter((cat) => cat.templates.length > 0)

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Input
          placeholder="고객 메모를 입력하세요..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          multiline
          minRows={4}
          fullWidth
          sx={{ flex: 1 }}
        />
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
        {/* 음성 메모 버튼 */}
        {isSpeechRecognitionSupported() && (
          <Button
            variant="secondary"
            size="sm"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            leftIcon={isRecording ? <MicOff size={16} /> : <Mic size={16} />}
          >
            {isRecording ? '음성 인식 중지' : '음성 메모'}
          </Button>
        )}

        {/* 템플릿 선택 버튼 */}
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => setTemplateMenuAnchor(e.currentTarget)}
          leftIcon={<FileText size={16} />}
        >
          템플릿
        </Button>

        {/* 템플릿 저장 버튼 */}
        {value.trim() && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedTemplate(null)
              setTemplateModalOpen(true)
            }}
            leftIcon={<Plus size={16} />}
          >
            템플릿으로 저장
          </Button>
        )}

        {/* 템플릿 메뉴 */}
        <Menu
          anchorEl={templateMenuAnchor}
          open={Boolean(templateMenuAnchor)}
          onClose={() => setTemplateMenuAnchor(null)}
        >
          {templatesByCategory.length === 0 ? (
            <MenuItem disabled>저장된 템플릿이 없습니다</MenuItem>
          ) : (
            templatesByCategory.map(({ category, templates: categoryTemplates }) => (
              <Box key={category}>
                <Box sx={{ px: 2, py: 1, fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
                  {category === 'general' && '일반'}
                  {category === 'consultation' && '상담'}
                  {category === 'followup' && '후속 관리'}
                  {category === 'treatment' && '시술 기록'}
                </Box>
                {categoryTemplates.map((template) => (
                  <MenuItem
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ fontWeight: 500 }}>{template.title}</Box>
                      <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
                        {template.content.slice(0, 50)}...
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTemplateDelete(template.id)
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </MenuItem>
                ))}
              </Box>
            ))
          )}
          <MenuItem
            onClick={() => {
              setTemplateMenuAnchor(null)
              setSelectedTemplate(null)
              setTemplateModalOpen(true)
            }}
            sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 1 }}
          >
            <Plus size={16} className="mr-2" />
            새 템플릿 만들기
          </MenuItem>
        </Menu>
      </Stack>

      {/* 템플릿 모달 */}
      <MemoTemplateModal
        open={templateModalOpen}
        template={selectedTemplate}
        onClose={() => {
          setTemplateModalOpen(false)
          setSelectedTemplate(null)
        }}
        onSave={handleTemplateSave}
      />
    </Box>
  )
}
