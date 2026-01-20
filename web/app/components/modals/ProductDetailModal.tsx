'use client'

import { useEffect, useState } from 'react'
import Modal, { ModalBody, ModalFooter, ModalHeader } from '../ui/Modal'
import Button from '../ui/Button'
import Textarea from '../ui/Textarea'
import { useAppToast } from '@/app/lib/ui/toast'
import { productsApi } from '@/app/lib/api/products'
import { Info } from 'lucide-react'
import { Alert, Tooltip } from '@mui/material'
import ConfirmDialog from '../ui/ConfirmDialog'
import type { Product as ProductEntity, ProductUpdateInput } from '@/types/entities'

type ProductForm = Omit<ProductEntity, 'price' | 'stock_count' | 'safety_stock'> & { price?: number | string; stock_count?: number | string; safety_stock?: number | string }

export default function ProductDetailModal({ open, onClose, item, onSaved, onDeleted }: { open: boolean; onClose: () => void; item: ProductEntity | null; onSaved: () => void; onDeleted: () => void }) {
  const [form, setForm] = useState<ProductForm | null>(item)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
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
      // description은 값이 있을 때만 포함
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
  return (
    <Modal open={open} onClose={onClose} size="lg">
      <ModalHeader title="제품 상세" description="제품의 기본 정보를 수정합니다. 이름과 가격은 필수입니다." onClose={onClose} />
      <ModalBody>
        <div className="space-y-3">
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          <div className="space-y-2">
            <div className="space-y-2">
              <div className="grid gap-2 sm:gap-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">이름 <span className="text-rose-600">*</span></label>
                  <input
                    className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-base sm:text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 placeholder:text-neutral-400 touch-manipulation"
                    placeholder="예) 로션 기획세트"
                    value={form.name}
                    onChange={e => setForm(f => f && ({ ...f, name: e.target.value }))}
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">가격 <span className="text-rose-600">*</span></label>
                  <input
                    className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-base sm:text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 text-right placeholder:text-neutral-400 touch-manipulation"
                    type="number"
                    min="0"
                    placeholder="예: 12,000"
                    autoComplete="off"
                    inputMode="numeric"
                    value={form.price === null || form.price === undefined || form.price === '' ? '' : form.price}
                    onChange={e => {
                      const val = e.target.value
                      setForm(f => f && ({ ...f, price: val === '' ? '' : (isNaN(Number(val)) ? '' : Number(val)) }))
                    }}
                    onFocus={e => e.target.select()}
                    style={{ fontSize: '16px' }}
                  />
                  <p className="mt-1 text-xs sm:text-sm text-neutral-400">부가세 포함 여부는 별도 표시 기준을 따릅니다.</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1">현재 재고</label>
                  <input
                    className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-base sm:text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 text-right placeholder:text-neutral-400 touch-manipulation"
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={form.stock_count ?? 0}
                    onChange={e => setForm(f => f && ({ ...f, stock_count: e.target.value === '' ? '' : Number(e.target.value) }))}
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs sm:text-sm font-medium text-neutral-700 mb-1">
                    안전 재고
                    <Tooltip title="이 수량 이하로 떨어지면 재고 부족 알림" arrow>
                      <Info size={16} className="text-neutral-400 cursor-help" style={{ minWidth: '16px', minHeight: '16px' }} />
                    </Tooltip>
                  </label>
                  <input
                    className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-base sm:text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 text-right placeholder:text-neutral-400 touch-manipulation"
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={form.safety_stock ?? 5}
                    onChange={e => setForm(f => f && ({ ...f, safety_stock: e.target.value === '' ? '' : Number(e.target.value) }))}
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>
              <div>
                <Textarea
                  label="설명(선택)"
                  placeholder="간단한 특징, 용량, 구성 등을 입력하세요"
                  value={form.description || ''}
                  onChange={e => setForm(f => f && ({ ...f, description: e.target.value }))}
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm sm:text-base min-h-[44px]">
                <input 
                  type="checkbox" 
                  checked={form.active !== false} 
                  onChange={e => setForm(f => f && ({ ...f, active: e.target.checked }))}
                  style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px' }}
                />
                <span>활성</span>
              </label>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button 
          variant="secondary" 
          onClick={onClose} 
          disabled={loading} 
          sx={{ 
            minHeight: '44px', 
            flex: { xs: 1, sm: 'none' },
            fontSize: { xs: '0.9375rem', sm: '1rem' }
          }}
        >
          취소
        </Button>
        <Button 
          variant="danger" 
          onClick={() => setConfirmOpen(true)} 
          disabled={loading} 
          sx={{ 
            minHeight: '44px', 
            flex: { xs: 1, sm: 'none' },
            fontSize: { xs: '0.9375rem', sm: '1rem' }
          }}
        >
          삭제
        </Button>
        <Button 
          variant="primary" 
          onClick={save} 
          disabled={loading} 
          sx={{ 
            minHeight: '44px', 
            flex: { xs: 1, sm: 'none' },
            fontSize: { xs: '0.9375rem', sm: '1rem' }
          }}
        >
          저장
        </Button>
      </ModalFooter>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={removeItem}
        title="제품 삭제"
        description="정말 이 제품을 삭제하시겠어요? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
      />
    </Modal>
  )
}
