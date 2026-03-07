'use client'

import { useState, useEffect, useMemo } from 'react'
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/app/components/ui/AdaptiveModal'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import Select from '@/app/components/ui/Select'
import Textarea from '@/app/components/ui/Textarea'
import { useAppToast } from '@/app/lib/ui/toast'
import StaffAutoComplete from '@/app/components/features/staff/StaffAutoComplete'
import { useCustomerAndProductLists } from '@/app/lib/hooks/components/useCustomerAndProductLists'
import { appointmentsApi } from '@/app/lib/api/appointments'
import type { AppointmentUpdateInput, Product } from '@/types/entities'
import { AlertCircle } from 'lucide-react'
import ConfirmDialog from '@/app/components/ui/ConfirmDialog'

type Item = { id: string; date: string; start: string; end?: string; status: string; notes?: string; customer_id?: string; staff_id?: string; service_id?: string; no_show?: boolean }

export default function ReservationDetailModal({ open, onClose, item, onSaved, onDeleted }: { open: boolean; onClose: () => void; item: Item | null; onSaved: () => void; onDeleted: () => void }) {
  const [form, setForm] = useState<Item | null>(item)
  const [loading, setLoading] = useState(false)
  const [markingNoShow, setMarkingNoShow] = useState(false)
  const [error, setError] = useState('')
  const [confirmNoShowOpen, setConfirmNoShowOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const toast = useAppToast()
  const { customers, products } = useCustomerAndProductLists(open)

  // 예약 상세 데이터 로드 (no_show 포함)
  useEffect(() => {
    const loadAppointmentDetail = async () => {
      if (!open || !item?.id) return
      try {
        const appointment = await appointmentsApi.get(item.id)
        if (appointment) {
          const [y, m, d] = new Date(appointment.appointment_date).toISOString().slice(0, 10).split('-').map(Number)
          const startDate = new Date(appointment.appointment_date)
          setForm({
            id: appointment.id,
            date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            start: `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
            status: appointment.status || 'scheduled',
            notes: appointment.notes || '',
            customer_id: appointment.customer_id || '',
            staff_id: appointment.staff_id || '',
            service_id: appointment.service_id || '',
            no_show: appointment.no_show || false,
          })
        }
      } catch (error) {
        console.error('예약 상세 로드 실패:', error)
        // 실패 시 item 사용
        setForm(item)
      }
    }
    loadAppointmentDetail()
  }, [open, item?.id])

  // 선택된 서비스의 소요 시간 계산
  const selectedProduct = useMemo(() => {
    if (!form?.service_id) return null
    return products.find((p: Product) => p.id === form.service_id) || null
  }, [form?.service_id, products])

  const durationMinutes = selectedProduct?.duration_minutes || 60
  const endTime = useMemo(() => {
    if (!form?.date || !form?.start) return ''
    const [y, m, d] = (form.date || '').split('-').map(Number)
    const [hh, mm] = (form.start || '').split(':').map(Number)
    const startDate = new Date(y || 2024, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0)
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000)
    const endHours = String(endDate.getHours()).padStart(2, '0')
    const endMins = String(endDate.getMinutes()).padStart(2, '0')
    return `${endHours}:${endMins}`
  }, [form?.date, form?.start, durationMinutes])

  const handleMarkNoShow = async () => {
    if (!form?.id) return

    try {
      setMarkingNoShow(true)
      const updated = await appointmentsApi.markAsNoShow(form.id)
      setForm((f) => f ? { ...f, no_show: updated.no_show || true } : f)
      toast.success('노쇼로 처리되었습니다')
      onSaved()
    } catch (error) {
      toast.error('노쇼 처리 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setMarkingNoShow(false)
    }
  }
  const save = async () => {
    if (!form?.id) return
    try {
      setLoading(true); setError('')
      if (!form.date || !form.start) { setError('날짜와 시작 시간은 필수입니다.'); setLoading(false); return }
      const payload: AppointmentUpdateInput = { status: form.status }
      // notes는 값이 있을 때만 포함
      if (form.notes && form.notes.trim() !== '') {
        payload.notes = form.notes.trim()
      }
      // 날짜/시간을 수정한 경우에만 appointment_date를 보냄 (불필요한 날짜 변경 방지)
      const originalDate = item?.date
      const originalStart = item?.start
      if (form.date !== originalDate || form.start !== originalStart) {
        // 로컬 날짜/시간을 UTC ISO 문자열로 변환하여 TZ 오차 방지
        const [y, m, d] = (form.date || '').split('-').map(Number)
        const [hh, mm] = (form.start || '').split(':').map(Number)
        payload.appointment_date = new Date(y || 2024, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0).toISOString()
      }
      await appointmentsApi.update(form.id, payload)
      onSaved(); onClose(); toast.success('예약이 저장되었습니다.')
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '에러가 발생했습니다.'
      setError(errorMessage)
      toast.error('예약 저장 실패', errorMessage)
    } finally { setLoading(false) }
  }

  const removeItem = async () => {
    if (!form?.id) return
    try {
      await appointmentsApi.delete(form.id)
      onDeleted(); onClose(); toast.success('삭제되었습니다.')
    } catch {
      toast.error('삭제 실패')
    }
  }


  if (!open || !form) return null
  return (
    <Modal open={open} onClose={onClose} size="lg">
      <ModalHeader title="예약 상세" description="예약 정보를 확인하고 수정합니다. 날짜와 시작 시간, 상태를 변경할 수 있습니다." onClose={onClose} />
      <ModalBody>
        <div className="grid gap-4 md:grid-cols-[280px,1fr]">
          <div className="space-y-3">
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </div>
          <div className="space-y-3">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="min-w-0">
                  <Input label="날짜" type="date" value={form.date} onChange={e => setForm(f => f && ({ ...f, date: e.target.value }))} className="text-xs sm:text-sm" />
                </div>
                <div className="min-w-0">
                  <Input label="시작" type="time" value={form.start} onChange={e => setForm(f => f && ({ ...f, start: e.target.value }))} className="text-xs sm:text-sm" />
                </div>
                {form.date && form.start && endTime && (
                  <div className="col-span-2">
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-800">
                        <span className="font-medium">예상 종료 시간:</span> {endTime}
                        {durationMinutes && (
                          <span className="ml-2 text-blue-600">
                            (소요 시간: {durationMinutes}분)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <Select label="상태" value={form.status} onChange={e => setForm(f => f && ({ ...f, status: e.target.value }))}>
                  <option value="scheduled">예약확정</option>
                  <option value="pending">대기</option>
                  <option value="cancelled">취소</option>
                  <option value="complete">완료</option>
                </Select>
                {form.no_show && (
                  <div className="col-span-2">
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-600" />
                      <span className="text-sm text-red-800 font-medium">노쇼 처리됨</span>
                    </div>
                  </div>
                )}
                <label className="block">
                  <div className="mb-1 text-sm font-medium text-neutral-700">고객(선택)</div>
                  <select className="w-full h-10 rounded-lg border border-neutral-300 px-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-300" value={form.customer_id || ''} onChange={e => setForm(f => {
                    if (!f) return f
                    const value = e.target.value
                    if (value) {
                      return { ...f, customer_id: value }
                    }
                    const next = { ...f }
                    delete next.customer_id
                    return next
                  })}>
                    <option value="">선택 안 함</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label className="col-span-2 block">
                  <div className="mb-1 text-sm font-medium text-neutral-700">담당 직원(선택)</div>
                  <StaffAutoComplete value={form.staff_id || ''} onChange={(v) => setForm(f => {
                    if (!f) return f
                    if (v) {
                      return { ...f, staff_id: v }
                    }
                    const next = { ...f }
                    delete next.staff_id
                    return next
                  })} />
                </label>
                <label className="block">
                  <div className="mb-1 text-sm font-medium text-neutral-700">
                    서비스/상품(선택)
                  </div>
                  <select
                    className="h-10 w-full rounded-none border-2 border-neutral-500 bg-white px-3 text-sm text-neutral-900 outline-none hover:border-neutral-600 focus:border-[#1D4ED8] focus:ring-[4px] focus:ring-[#1D4ED8]/20"
                    value={form.service_id || ''}
                    onChange={(e) =>
                      setForm((f) => {
                        if (!f) return f
                        const value = e.target.value
                        if (value) {
                          return { ...f, service_id: value }
                        }
                        const next = { ...f }
                        delete next.service_id
                        return next
                      })
                    }
                  >
                    <option value="">선택 안 함</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {form.service_id && selectedProduct?.duration_minutes && (
                    <div className="mt-1 text-xs text-blue-600 font-medium">
                      소요 시간: {selectedProduct.duration_minutes}분
                    </div>
                  )}
                </label>
                <div className="col-span-2">
                  <Textarea
                    label="메모(선택)"
                    placeholder="메모를 입력하세요(선택)"
                    value={form.notes || ''}
                    onChange={(e) =>
                      setForm((f) => f && ({ ...f, notes: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <div className="flex flex-wrap gap-2 w-full">
          <Button variant="secondary" onClick={onClose} disabled={loading || markingNoShow} className="flex-1 md:flex-none">취소</Button>
          {!form.no_show && form.status !== 'cancelled' && (
            <Button
              variant="outline"
              onClick={() => setConfirmNoShowOpen(true)}
              disabled={loading || markingNoShow}
              loading={markingNoShow}
              className="flex-1 md:flex-none border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              노쇼 처리
            </Button>
          )}
          <Button variant="danger" onClick={() => setConfirmDeleteOpen(true)} disabled={loading || markingNoShow} className="flex-1 md:flex-none">삭제</Button>
          <Button variant="primary" onClick={save} disabled={loading || markingNoShow} loading={loading} className="flex-1 md:flex-none">저장</Button>
        </div>
      </ModalFooter>
      <ConfirmDialog
        open={confirmNoShowOpen}
        onClose={() => setConfirmNoShowOpen(false)}
        onConfirm={handleMarkNoShow}
        title="노쇼 처리"
        description="이 예약을 노쇼로 처리하시겠습니까?"
        confirmText="노쇼 처리"
        variant="danger"
      />
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={removeItem}
        title="예약 삭제"
        description="정말 삭제하시겠어요? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        variant="danger"
      />
    </Modal>
  )
}

