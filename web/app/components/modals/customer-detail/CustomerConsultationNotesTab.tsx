/**
 * 고객 상담 일지 탭 컴포넌트
 */

'use client'

import { useState } from 'react'
import { Card, Typography, Box, Stack, TextField } from '@mui/material'
import { FileText, Plus, Edit2, Trash2, Calendar } from 'lucide-react'
import Button from '@/app/components/ui/Button'
import Textarea from '@/app/components/ui/Textarea'
import ConfirmDialog from '@/app/components/ui/ConfirmDialog'
import { useConsultationNotes, useCreateConsultationNote, useUpdateConsultationNote, useDeleteConsultationNote } from '@/app/lib/hooks/useConsultationNotes'
import { useAppToast } from '@/app/lib/ui/toast'
import type { ConsultationNote } from '@/types/entities'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

type CustomerConsultationNotesTabProps = {
  customerId: string
}

export default function CustomerConsultationNotesTab({ customerId }: CustomerConsultationNotesTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<ConsultationNote | null>(null)
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null)
  const [noteDate, setNoteDate] = useState(new Date().toISOString().slice(0, 10))
  const [noteContent, setNoteContent] = useState('')
  const toast = useAppToast()

  const { data: notes = [], isLoading } = useConsultationNotes(customerId, { orderBy: 'note_date', ascending: false })
  const createMutation = useCreateConsultationNote(customerId)
  const updateMutation = useUpdateConsultationNote(customerId)
  const deleteMutation = useDeleteConsultationNote(customerId)

  const handleCreate = async () => {
    if (!noteContent.trim()) {
      toast.error('내용을 입력해주세요')
      return
    }

    try {
      await createMutation.mutateAsync({
        note_date: noteDate,
        content: noteContent.trim(),
      })
      setIsCreateModalOpen(false)
      setNoteDate(new Date().toISOString().slice(0, 10))
      setNoteContent('')
      toast.success('상담 일지가 추가되었습니다')
    } catch (error) {
      toast.error('상담 일지 추가 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다')
    }
  }

  const handleEdit = (note: ConsultationNote) => {
    setEditingNote(note)
    setNoteDate(note.note_date.slice(0, 10))
    setNoteContent(note.content)
    setIsCreateModalOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingNote || !noteContent.trim()) {
      toast.error('내용을 입력해주세요')
      return
    }

    try {
      await updateMutation.mutateAsync({
        noteId: editingNote.id,
        input: {
          note_date: noteDate,
          content: noteContent.trim(),
        },
      })
      setIsCreateModalOpen(false)
      setEditingNote(null)
      setNoteDate(new Date().toISOString().slice(0, 10))
      setNoteContent('')
      toast.success('상담 일지가 수정되었습니다')
    } catch (error) {
      toast.error('상담 일지 수정 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다')
    }
  }

  const handleDelete = async () => {
    if (!deleteNoteId) return

    try {
      await deleteMutation.mutateAsync(deleteNoteId)
      setDeleteNoteId(null)
      toast.success('상담 일지가 삭제되었습니다')
    } catch (error) {
      toast.error('상담 일지 삭제 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다')
    }
  }

  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setEditingNote(null)
    setNoteDate(new Date().toISOString().slice(0, 10))
    setNoteContent('')
  }

  if (!customerId) return null

  return (
    <Stack spacing={3}>
      <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileText size={20} className="text-primary-main" />
            <Typography variant="subtitle1" fontWeight={700}>
              상담 일지
            </Typography>
          </Box>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus size={18} />}
          >
            일지 추가
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">로딩 중...</Typography>
          </Box>
        ) : notes.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">등록된 상담 일지가 없습니다</Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {notes.map((note) => (
              <Card
                key={note.id}
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calendar size={16} className="text-gray-500" />
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(note.note_date), 'yyyy년 M월 d일', { locale: ko })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(note)}
                      sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteNoteId(note.id)}
                      sx={{ minWidth: 'auto', p: 0.5, color: 'error.main' }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {note.content}
                </Typography>
              </Card>
            ))}
          </Stack>
        )}
      </Card>

      {/* 일지 추가/수정 모달 */}
      {isCreateModalOpen && (
        <Card variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            {editingNote ? '상담 일지 수정' : '상담 일지 추가'}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="일자"
              type="date"
              fullWidth
              size="small"
              value={noteDate}
              onChange={(e) => setNoteDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Textarea
              label="내용"
              placeholder="상담 내용을 입력하세요"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              minRows={6}
              required
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={handleCloseModal}>
                취소
              </Button>
              <Button
                variant="primary"
                onClick={editingNote ? handleUpdate : handleCreate}
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingNote ? '수정' : '추가'}
              </Button>
            </Box>
          </Stack>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteNoteId}
        onClose={() => setDeleteNoteId(null)}
        onConfirm={handleDelete}
        title="상담 일지 삭제"
        description="이 상담 일지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        variant="danger"
      />
    </Stack>
  )
}
