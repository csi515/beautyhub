'use client'

import { useEffect, useState } from 'react'
import DetailModal from '@/app/components/common/DetailModal'
import DetailForm, { type DetailFormField } from '@/app/components/common/DetailForm'
import Select from '@/app/components/ui/Select'
import { expensesApi } from '@/app/lib/api/expenses'
import { getExpenseCategories, suggestCategory } from '@/app/lib/utils/expenseCategories'
import { useAppToast } from '@/app/lib/ui/toast'
import { SUCCESS_MESSAGES, CONFIRMATION_MESSAGES, getLocalizedErrorMessage } from '@/app/lib/utils/messages'
import type { Expense, ExpenseUpdateInput } from '@/types/entities'

type ExpenseForm = Omit<Expense, 'amount' | 'memo'> & { amount: number | string; memo?: string | null }

export default function ExpenseDetailModal({ open, onClose, item, onSaved, onDeleted }: { open: boolean; onClose: () => void; item: Expense | null; onSaved: () => void; onDeleted: () => void }) {
  const [form, setForm] = useState<ExpenseForm | null>(item ? { ...item, amount: item.amount } : null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories] = useState<string[]>(getExpenseCategories())
  const toast = useAppToast()

  useEffect(() => {
    setForm(item ? { ...item, amount: item.amount } : null)
  }, [item])

  useEffect(() => {
    if (!item && form?.memo && !form.category) {
      const suggested = suggestCategory(form.memo)
      if (suggested) {
        setForm(f => f ? { ...f, category: suggested } : null)
      }
    }
  }, [form?.memo, form?.category, item])

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
      const body: ExpenseUpdateInput = {
        expense_date: form.expense_date,
        amount: amountValue,
        category: form.category || '',
      }
      if (form.memo && form.memo.trim() !== '') {
        body.memo = form.memo.trim()
      }
      await expensesApi.update(form.id, body)
      onSaved(); onClose(); toast.success(SUCCESS_MESSAGES.updated('지출'))
    } catch (e: unknown) {
      const errorMessage = getLocalizedErrorMessage(e)
      setError(errorMessage)
      toast.error('저장 실패', errorMessage)
    } finally { setLoading(false) }
  }

  const removeItem = async () => {
    if (!form?.id) return
    try {
      await expensesApi.delete(form.id)
      onDeleted(); onClose(); toast.success(SUCCESS_MESSAGES.deleted('지출'))
    } catch (e) {
      toast.error(getLocalizedErrorMessage(e))
    }
  }

  if (!open || !form) return null

  const categoryOptions = categories.map(cat => ({ value: cat, label: cat }))

  const formFields: DetailFormField[][] = [
    [
      {
        name: 'expense_date',
        label: '지출 일자',
        type: 'date',
        required: true,
        value: form.expense_date,
        onChange: (v) => setForm(f => f && ({ ...f, expense_date: String(v) })),
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
        name: 'category',
        label: '카테고리(선택)',
        type: 'select',
        value: form.category || '',
        onChange: (v) => setForm(f => f && ({ ...f, category: String(v) })),
        options: categoryOptions,
        gridCols: 2,
        customRender: () => (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-neutral-700 mb-0.5">카테고리(선택)</label>
            <div className="flex gap-2">
              <Select
                value={form.category || ''}
                onChange={(e) => setForm(f => f && ({ ...f, category: e.target.value }))}
                className="flex-1"
              >
                <option value="">선택하세요</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
              <input
                className="h-9 flex-1 rounded-lg border border-neutral-300 px-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                placeholder="직접 입력"
                value={form.category || ''}
                onChange={(e) => setForm(f => f && ({ ...f, category: e.target.value }))}
              />
            </div>
          </div>
        ),
      },
      {
        name: 'memo',
        label: '메모(선택)',
        type: 'text',
        value: form.memo || '',
        onChange: (v) => {
          const memoValue = String(v)
          setForm(f => {
            if (!f) return null
            const updated = { ...f, memo: memoValue }
            if (memoValue && !f.category) {
              const suggested = suggestCategory(memoValue)
              if (suggested) {
                updated.category = suggested
              }
            }
            return updated
          })
        },
        placeholder: '추가 설명을 입력하세요 (자동 분류 지원)',
        gridCols: 2,
      },
    ],
  ]

  return (
    <DetailModal
      open={open}
      onClose={onClose}
      item={form}
      title="지출 상세"
      description="지출 일자와 금액을 확인·수정합니다. 일자와 금액은 필수입니다."
      loading={loading}
      error={error}
      onSave={save}
      onDelete={removeItem}
      confirmDeleteMessage={CONFIRMATION_MESSAGES.delete('지출 내역')}
      size="lg"
    >
      <div className="space-y-3">
        <DetailForm fields={formFields} />
        {form.memo && !form.category && suggestCategory(form.memo) && (
          <p className="text-xs text-blue-600">
            추천 카테고리: {suggestCategory(form.memo)}
          </p>
        )}
      </div>
    </DetailModal>
  )
}
