'use client'

import { useEffect, useState } from 'react'
import DetailModal from '@/app/components/common/DetailModal'
import DetailForm, { type DetailFormField } from '@/app/components/common/DetailForm'
import Select from '@/app/components/ui/Select'
import { useAppToast } from '@/app/lib/ui/toast'
import { customersApi } from '@/app/lib/api/customers'
import { transactionsApi } from '@/app/lib/api/transactions'
import type { Transaction, TransactionUpdateInput, Customer } from '@/types/entities'

type Tx = Omit<Transaction, 'amount' | 'notes'> & { amount: number | string; notes?: string | null }

export default function TransactionDetailModal({ open, onClose, item, onSaved, onDeleted }: { open: boolean; onClose: () => void; item: Transaction | null; onSaved: () => void; onDeleted: () => void }) {
  const [form, setForm] = useState<Tx | null>(item ? { ...item, amount: item.amount } : null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useAppToast()
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    setForm(item ? { ...item, amount: item.amount } : null)
  }, [item])

  useEffect(() => {
    if (!open) return
    const load = async () => {
      try {
        const data = await customersApi.list({ limit: 1000 })
        setCustomers(Array.isArray(data) ? data : [])
      } catch {
        setCustomers([])
      }
    }
    load()
  }, [open])

  const save = async () => {
    if (!form?.id) return
    try {
      setLoading(true); setError('')
      const amountValue = form.amount === '' || form.amount === null || form.amount === undefined ? null : Number(form.amount)
      if (amountValue === null) {
        setError('금액은 필수입니다.')
        setLoading(false)
        return
      }
      const payload: TransactionUpdateInput = {
        amount: amountValue,
        transaction_date: form.transaction_date || '',
        customer_id: form.customer_id || null,
      }
      if (form.notes && form.notes.trim() !== '') {
        payload.notes = form.notes.trim()
      }
      await transactionsApi.update(form.id, payload)
      onSaved(); onClose(); toast.success('거래가 저장되었습니다.')
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '에러가 발생했습니다.'
      setError(errorMessage)
      toast.error('저장 실패', errorMessage)
    } finally { setLoading(false) }
  }

  const removeItem = async () => {
    if (!form?.id) return
    try {
      await transactionsApi.delete(form.id)
      onDeleted(); onClose(); toast.success('삭제되었습니다.')
    } catch {
      toast.error('삭제 실패')
    }
  }

  if (!open || !form) return null

  const customerOptions = customers.map(c => ({ value: String(c.id), label: c.name }))

  const formFields: DetailFormField[][] = [
    [
      {
        name: 'transaction_date',
        label: '거래 일자',
        type: 'date',
        required: true,
        value: (form.transaction_date || '').slice(0, 10),
        onChange: (v) => setForm(f => f && ({ ...f, transaction_date: String(v) })),
        gridCols: 1,
      },
      {
        name: 'amount',
        label: '금액',
        type: 'number',
        required: true,
        value: form.amount ?? '',
        onChange: (v) => setForm(f => f && ({ ...f, amount: v === '' ? '' : Number(v) })),
        placeholder: '예: 12,000',
        gridCols: 1,
      },
    ],
    [
      {
        name: 'customer_id',
        label: '고객(선택)',
        type: 'select',
        value: form.customer_id || '',
        onChange: (v) => setForm(f => f && ({ ...f, customer_id: String(v) || null })),
        options: [{ value: '', label: '선택 안 함' }, ...customerOptions],
        gridCols: 2,
      },
      {
        name: 'notes',
        label: '메모(선택)',
        type: 'text',
        value: form.notes || '',
        onChange: (v) => setForm(f => f && ({ ...f, notes: String(v) })),
        placeholder: '추가 설명을 입력하세요',
        gridCols: 2,
      },
    ],
  ]

  return (
    <DetailModal
      open={open}
      onClose={onClose}
      item={form}
      title="거래 상세"
      description="거래 일자와 금액을 확인·수정합니다. 일자와 금액을 정확히 입력해주세요."
      loading={loading}
      error={error}
      onSave={save}
      onDelete={removeItem}
      confirmDeleteMessage="정말 이 거래를 삭제하시겠습니까?"
      size="lg"
    >
      <DetailForm fields={formFields} />
    </DetailModal>
  )
}
