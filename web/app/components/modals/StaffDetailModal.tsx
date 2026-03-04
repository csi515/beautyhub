'use client'

import { useEffect, useState } from 'react'
import DetailModal from '@/app/components/common/DetailModal'
import DetailForm, { type DetailFormField } from '@/app/components/common/DetailForm'
import { useAppToast } from '@/app/lib/ui/toast'
import { staffApi } from '@/app/lib/api/staff'
import { settingsApi } from '@/app/lib/api/settings'

type Staff = {
  id?: string
  name: string
  phone?: string | null
  email?: string | null
  role?: string | null
  notes?: string | null
  active?: boolean
  status?: string | null
  skills?: string | null
  profile_image_url?: string | null
}

export default function StaffDetailModal({
  open,
  onClose,
  item,
  onSaved,
  onDeleted,
}: {
  open: boolean
  onClose: () => void
  item: Staff | null
  onSaved: () => void
  onDeleted: () => void
}) {
  const [form, setForm] = useState<Staff | null>(item)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [positions, setPositions] = useState<string[]>([])
  const toast = useAppToast()

  // 설정에서 직책 목록 불러오기
  useEffect(() => {
    const loadPositions = async () => {
      try {
        const settings = await settingsApi.get()
        setPositions(settings.staffSettings?.positions || [])
      } catch (error) {
        console.error('직책 목록 로드 실패:', error)
        setPositions([])
      }
    }
    loadPositions()
  }, [])

  useEffect(() => {
    setForm(
      item || {
        name: '',
        phone: '',
        email: '',
        role: '',
        notes: '',
        active: true,
        status: 'office',
        skills: '',
        profile_image_url: '',
      }
    )
  }, [item])

  const save = async () => {
    if (!form) return
    try {
      setLoading(true)
      setError('')
      const body = {
        name: (form.name || '').trim(),
        phone: form.phone?.trim() ? form.phone.trim() : null,
        email: form.email?.trim() ? form.email.trim() : null,
        role: form.role?.trim() ? form.role.trim() : null,
        active: form.active !== false,
        notes: form.notes?.trim() || null,
        status: form.status || 'office',
        skills: form.skills?.trim() || null,
        profile_image_url: form.profile_image_url?.trim() || null,
      }

      if (!body.name) throw new Error('이름은 필수입니다.')

      if (form.id) {
        await staffApi.update(form.id, body)
      } else {
        await staffApi.create(body)
      }
      onSaved()
      onClose()
      toast.success('직원이 저장되었습니다.')
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '에러가 발생했습니다.'
      setError(errorMessage)
      toast.error('저장 실패', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async () => {
    if (!form?.id) return
    try {
      await staffApi.delete(form.id)
      onDeleted()
      onClose()
      toast.success('삭제되었습니다.')
    } catch {
      toast.error('삭제 실패')
    }
  }

  if (!open || !form) return null

  const isNew = !form.id

  const fields: DetailFormField[][] = [
    [
      {
        name: 'name',
        label: '이름',
        type: 'text',
        required: true,
        value: form.name,
        onChange: (v) => setForm((f) => (f ? { ...f, name: String(v) } : null)),
        placeholder: '직원 이름을 입력하세요',
        gridCols: 1,
      },
      {
        name: 'role',
        label: '직책',
        type: 'select',
        value: form.role || '',
        onChange: (v) => setForm((f) => (f ? { ...f, role: String(v) } : null)),
        options: positions.map((pos) => ({ value: pos, label: pos })),
        gridCols: 1,
      },
    ],
    [
      {
        name: 'email',
        label: '이메일(선택)',
        type: 'text',
        value: form.email || '',
        onChange: (v) => setForm((f) => (f ? { ...f, email: String(v) } : null)),
        placeholder: '예: staff@example.com',
        gridCols: 1,
      },
      {
        name: 'phone',
        label: '휴대폰(선택)',
        type: 'text',
        value: form.phone || '',
        onChange: (v) => setForm((f) => (f ? { ...f, phone: String(v) } : null)),
        placeholder: '예: 010-1234-5678',
        gridCols: 1,
      },
    ],
    [
      {
        name: 'profile_image_url',
        label: '프로필 이미지 URL(선택)',
        type: 'text',
        value: form.profile_image_url || '',
        onChange: (v) => setForm((f) => (f ? { ...f, profile_image_url: String(v) } : null)),
        placeholder: 'https://...',
        gridCols: 1,
      },
      {
        name: 'skills',
        label: '보유 기술(선택)',
        type: 'text',
        value: form.skills || '',
        onChange: (v) => setForm((f) => (f ? { ...f, skills: String(v) } : null)),
        placeholder: '예: 경락, 아로마, 필링',
        gridCols: 1,
      },
    ],
    [
      {
        name: 'active',
        label: '시스템 접근 권한 활성',
        type: 'checkbox',
        value: form.active !== false,
        onChange: (v) => setForm((f) => (f ? { ...f, active: Boolean(v) } : null)),
        gridCols: 12,
      },
    ],
    [
      {
        name: 'notes',
        label: '상세 메모(선택)',
        type: 'textarea',
        value: form.notes || '',
        onChange: (v) => setForm((f) => (f ? { ...f, notes: String(v) } : null)),
        placeholder: '직원에 대한 특이사항이나 메모를 입력하세요',
        rows: 4,
        gridCols: 12,
      },
    ],
  ]

  return (
    <DetailModal
      open={open}
      onClose={onClose}
      item={form}
      title={isNew ? '직원 추가' : '직원 상세'}
      description="직원 정보를 관리합니다. 이름은 필수입니다."
      loading={loading}
      error={error}
      onSave={save}
      onDelete={removeItem}
      confirmDeleteMessage="이 직원을 삭제하시겠습니까?"
      showDelete={!isNew}
      size="lg"
    >
      <DetailForm fields={fields} />
    </DetailModal>
  )
}
