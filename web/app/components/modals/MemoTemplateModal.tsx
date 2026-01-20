'use client'

import { useState, useEffect } from 'react'
import Modal, { ModalBody, ModalFooter, ModalHeader } from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'
import { useAppToast } from '@/app/lib/ui/toast'

export interface MemoTemplate {
  id: string
  title: string
  content: string
  category?: string
  created_at?: string
  updated_at?: string
}

interface MemoTemplateModalProps {
  open: boolean
  template?: MemoTemplate | null
  onClose: () => void
  onSave: (template: Omit<MemoTemplate, 'id' | 'created_at' | 'updated_at'>) => void
}

const TEMPLATE_CATEGORIES = [
  { value: 'general', label: '일반' },
  { value: 'consultation', label: '상담' },
  { value: 'followup', label: '후속 관리' },
  { value: 'complaint', label: '불만 사항' },
  { value: 'compliment', label: '칭찬' },
  { value: 'treatment', label: '시술 기록' },
]

export default function MemoTemplateModal({ open, template, onClose, onSave }: MemoTemplateModalProps) {
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'general',
  })
  const [loading, setLoading] = useState(false)
  const toast = useAppToast()

  useEffect(() => {
    if (open) {
      if (template) {
        setForm({
          title: template.title || '',
          content: template.content || '',
          category: template.category || 'general',
        })
      } else {
        setForm({
          title: '',
          content: '',
          category: 'general',
        })
      }
    }
  }, [open, template])

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('템플릿 제목을 입력해주세요.')
      return
    }
    if (!form.content.trim()) {
      toast.error('템플릿 내용을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      onSave({
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
      })
      toast.success(template ? '템플릿이 수정되었습니다.' : '템플릿이 저장되었습니다.')
      onClose()
    } catch (error) {
      toast.error('템플릿 저장에 실패했습니다.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <ModalHeader
        title={template ? '메모 템플릿 수정' : '메모 템플릿 추가'}
        description="자주 사용하는 메모를 템플릿으로 저장하세요"
        onClose={onClose}
      />
      <ModalBody>
        <div className="space-y-4">
          <Input
            label="템플릿 제목"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="예: 초기 상담 메모"
            required
          />

          <Select
            label="카테고리"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {TEMPLATE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Select>

          <Textarea
            label="템플릿 내용"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="템플릿 내용을 입력하세요..."
            minRows={6}
            required
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          취소
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={loading}>
          {template ? '수정' : '저장'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
