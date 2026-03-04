'use client'

import { useEffect, useState } from 'react'
import DetailModal from '@/app/components/common/DetailModal'
import DetailForm, { type DetailFormField } from '@/app/components/common/DetailForm'
import { useAppToast } from '@/app/lib/ui/toast'
import { productsApi } from '@/app/lib/api/products'
import Textarea from '@/app/components/ui/Textarea'
import type { Product as ProductEntity, ProductUpdateInput } from '@/types/entities'

type ProductForm = Omit<ProductEntity, 'price' | 'stock_count' | 'safety_stock'> & { price?: number | string; stock_count?: number | string; safety_stock?: number | string }

export default function ProductDetailModal({ open, onClose, item, onSaved, onDeleted }: { open: boolean; onClose: () => void; item: ProductEntity | null; onSaved: () => void; onDeleted: () => void }) {
  const [form, setForm] = useState<ProductForm | null>(item)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useAppToast()

  useEffect(() => { setForm(item) }, [item])

  const save = async () => {
    if (!form?.id) return
    try {
      setLoading(true); setError('')
      const priceValue = form.price === '' || form.price === null || form.price === undefined ? null : Number(form.price)
      if (priceValue === null || priceValue <= 0) {
        setError('가격은 0보다 커야 합니다.')
        setLoading(false)
        return
      }
      const body: ProductUpdateInput = {
        name: form.name,
        price: priceValue,
        active: form.active !== false,
        stock_count: form.stock_count === '' ? 0 : Number(form.stock_count),
        safety_stock: form.safety_stock === '' ? 0 : Number(form.safety_stock)
      }
      if (form.description && form.description.trim() !== '') {
        body.description = form.description.trim()
      }
      await productsApi.update(String(form.id), body)
      onSaved(); onClose(); toast.success('제품이 저장되었습니다.')
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '에러가 발생했습니다.'
      setError(errorMessage)
      toast.error('저장 실패', errorMessage)
    } finally { setLoading(false) }
  }

  const removeItem = async () => {
    if (!form?.id) return
    try {
      await productsApi.delete(String(form.id))
      onDeleted(); onClose(); toast.success('삭제되었습니다.')
    } catch {
      toast.error('삭제 실패')
    }
  }

  if (!open || !form) return null

  const formFields: DetailFormField[][] = [
    [
      {
        name: 'name',
        label: '이름',
        type: 'text',
        required: true,
        value: form.name,
        onChange: (v) => setForm(f => f && ({ ...f, name: String(v) })),
        placeholder: '예) 로션 기획세트',
        gridCols: 2,
      },
      {
        name: 'price',
        label: '가격',
        type: 'number',
        required: true,
        value: form.price ?? '',
        onChange: (v) => setForm(f => f && ({ ...f, price: v === '' ? '' : Number(v) })),
        placeholder: '예: 12,000',
        helperText: '부가세 포함 여부는 별도 표시 기준을 따릅니다.',
        gridCols: 1,
      },
      {
        name: 'stock_count',
        label: '현재 재고',
        type: 'number',
        value: form.stock_count ?? 0,
        onChange: (v) => setForm(f => f && ({ ...f, stock_count: v === '' ? '' : Number(v) })),
        gridCols: 1,
      },
      {
        name: 'safety_stock',
        label: '안전 재고',
        type: 'number',
        value: form.safety_stock ?? 5,
        onChange: (v) => setForm(f => f && ({ ...f, safety_stock: v === '' ? '' : Number(v) })),
        tooltip: '이 수량 이하로 떨어지면 재고 부족 알림',
        gridCols: 1,
      },
    ],
  ]

  return (
    <DetailModal
      open={open}
      onClose={onClose}
      item={form}
      title="제품 상세"
      description="제품의 기본 정보를 수정합니다. 이름과 가격은 필수입니다."
      loading={loading}
      error={error}
      onSave={save}
      onDelete={removeItem}
      confirmDeleteMessage="정말 이 제품을 삭제하시겠어요? 이 작업은 되돌릴 수 없습니다."
      size="lg"
    >
      <div className="space-y-3">
        <DetailForm fields={formFields} />
        <div>
          <Textarea
            label="설명(선택)"
            placeholder="간단한 특징, 용량, 구성 등을 입력하세요"
            value={form.description || ''}
            onChange={(e) => setForm(f => f && ({ ...f, description: e.target.value }))}
          />
        </div>
        <div>
          <label className="inline-flex items-center gap-1.5 text-xs">
            <input
              type="checkbox"
              checked={form.active !== false}
              onChange={(e) => setForm(f => f && ({ ...f, active: e.target.checked }))}
              className="rounded border-neutral-300"
            />
            <span>활성</span>
          </label>
        </div>
      </div>
    </DetailModal>
  )
}
