'use client'

import { useEffect, useState } from 'react'
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/app/components/ui/Modal'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import Select from '@/app/components/ui/Select'
import Textarea from '@/app/components/ui/Textarea'
import { useAppToast } from '@/app/lib/ui/toast'
import { useCreateAppointmentTemplate, useUpdateAppointmentTemplate, useDeleteAppointmentTemplate } from '@/app/lib/hooks/useAppointmentTemplates'
import { productsApi } from '@/app/lib/api/products'
import type { AppointmentTemplate, AppointmentTemplateCreateInput, AppointmentTemplateUpdateInput, Product } from '@/types/entities'
import ConfirmDialog from '@/app/components/ui/ConfirmDialog'

type TemplateForm = {
  name: string
  service_id?: string | null
  duration_minutes?: number | string | null
  default_price?: number | string | null
  default_notes?: string | null
}

export default function AppointmentTemplateModal({
  open,
  onClose,
  item,
  onSaved,
  onDeleted,
}: {
  open: boolean
  onClose: () => void
  item: AppointmentTemplate | null
  onSaved: () => void
  onDeleted: () => void
}) {
  const [form, setForm] = useState<TemplateForm>({
    name: '',
    service_id: null,
    duration_minutes: null,
    default_price: null,
    default_notes: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const toast = useAppToast()
  const createMutation = useCreateAppointmentTemplate()
  const updateMutation = useUpdateAppointmentTemplate()
  const deleteMutation = useDeleteAppointmentTemplate()

  // 제품 목록 로드
  useEffect(() => {
    if (!open) return
    const loadProducts = async () => {
      try {
        const data = await productsApi.list({ limit: 1000 })
        setProducts(Array.isArray(data) ? data : [])
      } catch {
        setProducts([])
      }
    }
    loadProducts()
  }, [open])

  // 폼 초기화
  useEffect(() => {
    if (open) {
      if (item) {
        setForm({
          name: item.name || '',
          service_id: item.service_id || null,
          duration_minutes: item.duration_minutes ?? null,
          default_price: item.default_price ?? null,
          default_notes: item.default_notes || null,
        })
      } else {
        setForm({
          name: '',
          service_id: null,
          duration_minutes: null,
          default_price: null,
          default_notes: null,
        })
      }
      setError('')
    }
  }, [open, item])

  const save = async () => {
    try {
      setLoading(true)
      setError('')

      if (!form.name || form.name.trim() === '') {
        setError('템플릿 이름은 필수입니다.')
        setLoading(false)
        return
      }

      const payload: AppointmentTemplateCreateInput | AppointmentTemplateUpdateInput = {
        name: form.name.trim(),
        service_id: form.service_id || null,
        duration_minutes: form.duration_minutes === '' || form.duration_minutes === null || form.duration_minutes === undefined
          ? null
          : Number(form.duration_minutes),
        default_price: form.default_price === '' || form.default_price === null || form.default_price === undefined
          ? null
          : Number(form.default_price),
        default_notes: form.default_notes && form.default_notes.trim() !== '' ? form.default_notes.trim() : null,
      }

      if (item?.id) {
        await updateMutation.mutateAsync({ id: item.id, input: payload })
        toast.success('템플릿이 저장되었습니다.')
      } else {
        await createMutation.mutateAsync(payload as AppointmentTemplateCreateInput)
        toast.success('템플릿이 생성되었습니다.')
      }

      onSaved()
      onClose()
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '에러가 발생했습니다.'
      setError(errorMessage)
      toast.error('저장 실패', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!item?.id) return
    try {
      await deleteMutation.mutateAsync(item.id)
      toast.success('템플릿이 삭제되었습니다.')
      onDeleted()
      onClose()
    } catch (error) {
      toast.error('삭제 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다')
    }
  }

  const isNew = !item?.id

  if (!open) return null

  return (
    <>
      <Modal open={open} onClose={onClose} size="md">
        <ModalHeader
          title={isNew ? '새 템플릿 생성' : '템플릿 수정'}
          description={isNew ? '예약 템플릿을 생성합니다. 템플릿을 사용하면 예약 생성 시 빠르게 정보를 입력할 수 있습니다.' : '템플릿 정보를 수정합니다.'}
          onClose={onClose}
        />
        <ModalBody>
          <div className="space-y-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{error}</div>}

            <Input
              label="템플릿 이름"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="예: 기본 시술"
            />

            <Select
              label="서비스/상품 (선택)"
              value={form.service_id || ''}
              onChange={(e) => setForm({ ...form, service_id: e.target.value || null })}
            >
              <option value="">선택 안 함</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="소요 시간 (분)"
                type="number"
                value={form.duration_minutes === null || form.duration_minutes === undefined ? '' : form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value === '' ? null : Number(e.target.value) })}
                placeholder="예: 60"
              />

              <Input
                label="기본 가격 (원)"
                type="number"
                value={form.default_price === null || form.default_price === undefined ? '' : form.default_price}
                onChange={(e) => setForm({ ...form, default_price: e.target.value === '' ? null : Number(e.target.value) })}
                placeholder="예: 50000"
              />
            </div>

            <Textarea
              label="기본 메모 (선택)"
              value={form.default_notes || ''}
              onChange={(e) => setForm({ ...form, default_notes: e.target.value || null })}
              placeholder="템플릿 사용 시 자동으로 입력될 메모를 입력하세요"
              rows={4}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex gap-2 w-full">
            {!isNew && (
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading || deleteMutation.isPending}
                className="flex-1 md:flex-none"
              >
                삭제
              </Button>
            )}
            <Button variant="secondary" onClick={onClose} disabled={loading || createMutation.isPending || updateMutation.isPending} className="flex-1 md:flex-none">
              취소
            </Button>
            <Button
              variant="primary"
              onClick={save}
              disabled={loading || createMutation.isPending || updateMutation.isPending}
              loading={loading || createMutation.isPending || updateMutation.isPending}
              className="flex-1 md:flex-none"
            >
              {isNew ? '생성' : '저장'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="템플릿 삭제"
        description="이 템플릿을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        variant="danger"
      />
    </>
  )
}