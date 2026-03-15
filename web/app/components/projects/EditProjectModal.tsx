'use client'

import { useState, useEffect } from 'react'
import type { Project } from '@/app/lib/mock/projects'
import Modal, { ModalBody, ModalFooter, ModalHeader } from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import { useAppToast } from '@/app/lib/ui/toast'

export default function EditProjectModal({
  open,
  project,
  onClose,
  onSave
}: {
  open: boolean
  project: Project | null
  onClose: () => void
  onSave: (title: string, content: string) => void
}) {
  const toast = useAppToast()
  const [title, setTitle] = useState(project?.title || '')
  const [content, setContent] = useState(project?.content || '')

  useEffect(() => {
    setTitle(project?.title || '')
    setContent(project?.content || '')
  }, [project])

  const handleSave = () => {
    onSave(title.trim(), content.trim())
    onClose()
    toast.success('프로젝트가 저장되었습니다.')
  }

  if (!open || !project) return null
  return (
    <Modal open={open} onClose={onClose} size="lg">
      <ModalHeader title="프로젝트 수정" description="프로젝트의 제목과 내용을 수정합니다. 저장 시 즉시 반영됩니다." />
      <ModalBody>
        <div className="grid gap-4 md:grid-cols-[240px,1fr]">
          <div />
          <div className="md:pl-6 md:border-l md:border-neutral-200 space-y-3">
            <div className="crm-section space-y-3">
              <Input
                label="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
              />
              <div>
                <Textarea
                  label="내용"
                  value={content}
                  onChange={e=>setContent(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>취소</Button>
        <Button variant="primary" onClick={handleSave}>저장</Button>
      </ModalFooter>
    </Modal>
  )
}



