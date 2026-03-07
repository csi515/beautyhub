'use client'

import { useEffect, useState, useMemo } from 'react'
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/app/components/ui/AdaptiveModal'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import DateInput from '@/app/components/ui/DateInput'
import TimeInput from '@/app/components/ui/TimeInput'
import CheckboxField from '@/app/components/ui/CheckboxField'
import { useAppToast } from '@/app/lib/ui/toast'
import StaffAutoComplete from '@/app/components/features/staff/StaffAutoComplete'
import Textarea from '@/app/components/ui/Textarea'
import Select from '@/app/components/ui/Select'
import { useCustomerAndProductLists } from '@/app/lib/hooks/components/useCustomerAndProductLists'
import { appointmentsApi } from '@/app/lib/api/appointments'
import { customerProductsApi } from '@/app/lib/api/customer-products'
import { useAppointmentTemplates } from '@/app/lib/hooks/useAppointmentTemplates'
import type { AppointmentCreateInput, Customer, Product, AppointmentTemplate } from '@/types/entities'

type Draft = {
  date: string
  start: string
  end: string
  status: string
  notes: string
  customer_id?: string
  staff_id?: string
  service_id?: string
}

export default function ReservationCreateModal({ open, onClose, draft, onSaved }: { open: boolean; onClose: () => void; draft: Draft; onSaved: () => void }) {
  const [form, setForm] = useState<Draft>(draft)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [conflictWarning, setConflictWarning] = useState<string | null>(null)
  const toast = useAppToast()
  const { customers, products } = useCustomerAndProductLists(open)
  const { data: templates = [] } = useAppointmentTemplates()
  const [customerQuery, setCustomerQuery] = useState('')
  const [showSuggest, setShowSuggest] = useState(false)
  const [holdingsByProduct, setHoldingsByProduct] = useState<Record<string, number>>({})
  const [autoCreateTransaction, setAutoCreateTransaction] = useState(false)
  const [transactionAmount, setTransactionAmount] = useState<string>('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')

  // 선택된 서비스의 소요 시간 계산
  const selectedProduct = useMemo(() => {
    if (!form.service_id) return null
    return products.find((p: Product) => p.id === form.service_id) || null
  }, [form.service_id, products])

  const durationMinutes = selectedProduct?.duration_minutes || 60
  const endTime = useMemo(() => {
    if (!form.date || !form.start) return ''
    const [y, m, d] = form.date.split('-').map(Number)
    const [hh, mm] = form.start.split(':').map(Number)
    const startDate = new Date(y || 2024, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0)
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000)
    const endHours = String(endDate.getHours()).padStart(2, '0')
    const endMins = String(endDate.getMinutes()).padStart(2, '0')
    return `${endHours}:${endMins}`
  }, [form.date, form.start, durationMinutes])

  // 템플릿 선택 시 폼 자동 채우기
  useEffect(() => {
    if (!selectedTemplateId || !open) return
    const template = templates.find((t: AppointmentTemplate) => t.id === selectedTemplateId)
    if (template) {
      setForm((f) => ({
        ...f,
        ...(template.service_id ? { service_id: template.service_id } : {}),
        notes: template.default_notes || f.notes,
      }))
    }
  }, [selectedTemplateId, templates, open])

  // 중복 검사
  useEffect(() => {
    const checkConflict = async () => {
      if (!form.date || !form.start || !form.staff_id || !open) {
        setConflictWarning(null)
        return
      }

      try {
        const [y, m, d] = form.date.split('-').map(Number)
        const [hh, mm] = form.start.split(':').map(Number)
        const appointmentDate = new Date(y || 2024, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0).toISOString()

        const result = await appointmentsApi.checkConflict({
          appointment_date: appointmentDate,
          staff_id: form.staff_id,
          duration_minutes: durationMinutes,
        })

        if (result.hasConflict && result.conflictingAppointments.length > 0) {
          const conflictTimes = result.conflictingAppointments
            .map((a) => {
              const d = new Date(a.appointment_date)
              return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
            })
            .join(', ')
          setConflictWarning(`해당 시간대에 이미 예약이 있습니다: ${conflictTimes}`)
        } else {
          setConflictWarning(null)
        }
      } catch (error) {
        // 중복 검사 실패는 경고만 표시
        console.error('중복 검사 실패:', error)
      }
    }

    // 디바운스: 500ms 후에 검사
    const timeoutId = setTimeout(checkConflict, 500)
    return () => clearTimeout(timeoutId)
  }, [form.date, form.start, form.staff_id, durationMinutes, open])

  // Reset form to fresh draft on open
  useEffect(() => {
    if (open) {
      setForm(draft)
      setCustomerQuery('')
      setShowSuggest(false)
      setSelectedTemplateId('')
      setConflictWarning(null)
    }
  }, [open, draft])

  // 고객 선택 시 보유 상품 수량 로드
  useEffect(() => {
    const loadHoldings = async () => {
      try {
        if (!open || !form.customer_id) { setHoldingsByProduct({}); return }
        const list = await customerProductsApi.list(form.customer_id)
        const qtyMap: Record<string, number> = {}
          ; (Array.isArray(list) ? list : []).forEach((h) => {
            const pid = String(h.product_id)
            qtyMap[pid] = Number(h.quantity || 0)
          })
        setHoldingsByProduct(qtyMap)
      } catch {
        setHoldingsByProduct({})
      }
    }
    loadHoldings()
  }, [open, form.customer_id])

  const save = async () => {
    try {
      setLoading(true); setError('')
      if (!form.date || !form.start) { setError('날짜와 시작 시간은 필수입니다.'); setLoading(false); return }

      // 중복 검사 재확인
      if (form.staff_id) {
        const [y, m, d] = form.date.split('-').map(Number)
        const [hh, mm] = form.start.split(':').map(Number)
        const appointmentDate = new Date(y || 2024, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0).toISOString()

        const conflictResult = await appointmentsApi.checkConflict({
          appointment_date: appointmentDate,
          staff_id: form.staff_id,
          duration_minutes: durationMinutes,
        })

        if (conflictResult.hasConflict) {
          setError('해당 시간대에 이미 예약이 있습니다. 다른 시간을 선택해주세요.')
          setLoading(false)
          return
        }
      }

      // 로컬 날짜/시간을 UTC ISO 문자열로 변환하여 TZ 오차 방지
      const [y, m, d] = form.date.split('-').map(Number)
      const [hh, mm] = form.start.split(':').map(Number)
      const startIso = new Date(y || 2024, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0).toISOString()
      type AppointmentPayload = AppointmentCreateInput & { service_id?: string | null }
      const payload: AppointmentPayload = {
        appointment_date: startIso,
        status: form.status,
        customer_id: form.customer_id || null,
        staff_id: form.staff_id || null,
        service_id: form.service_id || null,
      }
      // notes는 값이 있을 때만 포함
      if (form.notes && form.notes.trim() !== '') {
        payload.notes = form.notes.trim()
      }
      const appointment = await appointmentsApi.create(payload)

      // 예약 완료 시 자동 매출 생성 옵션
      if (autoCreateTransaction && form.customer_id && transactionAmount) {
        try {
          const amountValue = transactionAmount.replace(/[^0-9]/g, '')
          if (amountValue && Number(amountValue) > 0) {
            const { transactionsApi } = await import('@/app/lib/api/transactions')
            await transactionsApi.create({
              customer_id: form.customer_id,
              appointment_id: appointment.id,
              transaction_date: form.date,
              amount: Number(amountValue),
              notes: `예약 완료: ${form.notes || ''}`.trim(),
            })
            toast.success('예약과 매출이 자동으로 생성되었습니다.')
          }
        } catch (error) {
          console.error('자동 매출 생성 실패:', error)
          toast.error('예약은 저장되었지만 매출 생성에 실패했습니다.')
        }
      }

      // persist memo for customer detail modal
      try { if (form.customer_id && (form.notes || '').trim()) localStorage.setItem(`memoDraft:${form.customer_id}`, form.notes || '') } catch { }
      onSaved(); onClose(); toast.success('예약이 저장되었습니다.')
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '에러가 발생했습니다.'
      setError(errorMessage)
      toast.error('예약 저장 실패', errorMessage)
    } finally { setLoading(false) }
  }

  const filteredCustomers = (() => {
    const q = customerQuery.trim().toLowerCase()
    if (!q) return []
    return customers.filter((c: Customer) => {
      const name = (c.name || '').toLowerCase()
      const email = (c.email || '').toLowerCase()
      const phone = (c.phone || '').toLowerCase()
      return name.includes(q) || email.includes(q) || phone.includes(q)
    }).slice(0, 8)
  })()

  if (!open) return null
  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={handleClose} size="lg">
      <ModalHeader
        title="새 예약"
        description="날짜와 시간, 고객, 서비스를 선택해 새로운 예약을 등록합니다."
        onClose={handleClose}
      />
      <ModalBody>
        <div className="grid gap-4 md:grid-cols-[280px,1fr]">
          <div className="space-y-3">
            {error && <p className="text-sm text-rose-600">{error}</p>}
            {conflictWarning && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">{conflictWarning}</p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="space-y-3">
              {/* 템플릿 선택 */}
              {templates.length > 0 && (
                <div className="col-span-2">
                  <Select
                    label="템플릿 선택 (선택)"
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                  >
                    <option value="">템플릿 선택 안 함</option>
                    {templates.map((template: AppointmentTemplate) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="min-w-0">
                  <DateInput
                    label="날짜 *"
                    size="small"
                    fullWidth
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </div>
                <div className="min-w-0">
                  <TimeInput
                    label="시작 시간 *"
                    size="small"
                    fullWidth
                    value={form.start}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, start: e.target.value }))
                    }
                  />
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
                <div className="col-span-2">
                  <div className="relative">
                    <Input
                      label="고객"
                      size="small"
                      fullWidth
                      placeholder="이름/이메일/전화번호로 검색하여 선택"
                      value={customerQuery}
                      onChange={(e) => {
                        setCustomerQuery(e.target.value)
                        setShowSuggest(true)
                      }}
                      onFocus={() => setShowSuggest(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && filteredCustomers.length > 0) {
                          const c = filteredCustomers[0]
                          if (c) {
                            setForm((f) => ({ ...f, customer_id: c.id }))
                            setCustomerQuery(c.name || '')
                            setShowSuggest(false)
                            e.preventDefault()
                          }
                        }
                        if (e.key === 'Escape') setShowSuggest(false)
                      }}
                    />
                    {showSuggest &&
                      customerQuery.trim() &&
                      filteredCustomers.length > 0 && (
                        <ul
                          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-neutral-300 shadow-lg bg-white"
                          role="listbox"
                        >
                          {filteredCustomers.map((c) => (
                            <li
                              key={c.id}
                              role="option"
                              aria-selected={form.customer_id === c.id}
                              className="cursor-pointer px-3 py-2 text-sm hover:bg-neutral-50"
                              onMouseDown={() => {
                                setForm((f) => ({ ...f, customer_id: c.id }))
                                setCustomerQuery(c.name || '')
                                setShowSuggest(false)
                              }}
                            >
                              <div className="font-medium">{c.name}</div>
                              <div className="text-xs text-neutral-500">
                                {c.email || c.phone || '-'}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>
                <div>
                  <Select
                    label="상태"
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                  >
                    <option value="scheduled">예약확정</option>
                    <option value="pending">대기</option>
                    <option value="cancelled">취소</option>
                    <option value="complete">완료</option>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    담당 직원(선택)
                  </label>
                  <StaffAutoComplete
                    value={form.staff_id || ''}
                    onChange={(v) =>
                      setForm((f) => {
                        if (!f) return f
                        if (v) {
                          return { ...f, staff_id: v }
                        }
                        const next = { ...f }
                        delete next.staff_id
                        return next
                      })
                    }
                  />
                </div>
                <div>
                  <Select
                    label="서비스/상품"
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
                  </Select>
                  {form.service_id && (
                    <div className="mt-1 space-y-1">
                      <div className="text-xs text-neutral-500">
                        보유중:{' '}
                        {Number(
                          holdingsByProduct[String(form.service_id)] || 0,
                        )}
                        개
                      </div>
                      {selectedProduct?.duration_minutes && (
                        <div className="text-xs text-blue-600 font-medium">
                          소요 시간: {selectedProduct.duration_minutes}분
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <Textarea
                    label="메모(선택)"
                    placeholder="고객 요청사항, 준비물 등을 입력하세요"
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                  />
                </div>

                {/* 예약 완료 시 자동 매출 생성 옵션 */}
                {form.customer_id && form.status === 'complete' && (
                  <>
                    <div className="col-span-2">
                      <CheckboxField
                        label="예약 완료 시 자동으로 매출 생성"
                        checked={autoCreateTransaction}
                        onChange={setAutoCreateTransaction}
                      />
                    </div>
                    {autoCreateTransaction && (
                      <div className="col-span-2">
                        <Input
                          label="매출 금액"
                          size="small"
                          fullWidth
                          value={transactionAmount}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/[^0-9]/g, '')
                            if (numericValue === '') {
                              setTransactionAmount('')
                            } else {
                              setTransactionAmount(Number(numericValue).toLocaleString())
                            }
                          }}
                          placeholder="금액을 입력하세요"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={loading} className="w-full md:w-auto">취소</Button>
        <Button variant="primary" onClick={save} disabled={loading} loading={loading} className="w-full md:w-auto">저장</Button>
      </ModalFooter>
    </Modal>
  )
}


