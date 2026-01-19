import { useState, useEffect } from 'react'
import { customerProductsApi } from '@/app/lib/api/customer-products'
import { productsApi } from '@/app/lib/api/products'
import { useAppToast } from '@/app/lib/ui/toast'
import { getLocalizedErrorMessage } from '@/app/lib/utils/messages'
import type { CustomerProduct } from '@/app/lib/repositories/customer-products.repository'

export type Holding = CustomerProduct

export function useCustomerHoldings(customerId: string | undefined, open: boolean) {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [products, setProducts] = useState<{ id: string; name: string }[]>([])
  const [newProductId, setNewProductId] = useState<string>('')
  const [newQty, setNewQty] = useState<number>(1)
  const [newReason, setNewReason] = useState<string>('')
  const [addingProduct, setAddingProduct] = useState(false)
  const [holdingDelta, setHoldingDelta] = useState<Record<string, number>>({})
  const [holdingReason, setHoldingReason] = useState<Record<string, string>>({})
  const [productLedger, setProductLedger] = useState<{ created_at: string; delta: number; reason?: string | null | undefined; product_id: string; notes?: string | null; id: string }[]>([])
  const toast = useAppToast()

  // 데이터 로드
  useEffect(() => {
    if (!open || !customerId) return

    const loadData = async () => {
      try {
        const [holdingsData, productsData, productLedgerData] = await Promise.all([
          customerProductsApi.list(customerId),
          productsApi.list({ limit: 1000 }),
          customerProductsApi.getCustomerLedger(customerId, { limit: 100, offset: 0 })
        ])

        setHoldings(Array.isArray(holdingsData) ? holdingsData as Holding[] : [])
        setProducts(Array.isArray(productsData) ? productsData.map(p => ({ id: String(p.id), name: p.name })) : [])
        setProductLedger(Array.isArray(productLedgerData) ? productLedgerData.map(item => ({
          created_at: item.created_at || '',
          delta: item.delta || 0,
          reason: item.reason ?? null,
          product_id: item.product_id || '',
          notes: item.notes || null,
          id: item.id
        })) : [])

        const init: Record<string, number> = {}
        if (Array.isArray(holdingsData)) {
          (holdingsData as Holding[]).forEach((h) => {
            if (h?.id) init[String(h.id)] = 1
          })
        }
        setHoldingDelta(init)
      } catch (err) {
        console.error('Failed to load holdings:', err)
      }
    }

    loadData()
  }, [open, customerId])

  // Ledger 업데이트 헬퍼
  const updateProductLedger = async () => {
    if (!customerId) return
    try {
      const ledgerData = await customerProductsApi.getCustomerLedger(customerId, { limit: 100, offset: 0 })
      setProductLedger(Array.isArray(ledgerData) ? ledgerData.map(item => ({
        created_at: item.created_at || '',
        delta: item.delta || 0,
        reason: item.reason ?? null,
        product_id: item.product_id || '',
        notes: item.notes || null,
        id: item.id
      })) : [])
    } catch (err) {
      console.error('Failed to update product ledger:', err)
    }
  }

  // 보유 상품 추가
  const handleAddProduct = async () => {
    if (!newProductId || !customerId) return
    setAddingProduct(true)
    try {
      await customerProductsApi.create({
        customer_id: customerId,
        product_id: newProductId,
        quantity: newQty,
        reason: newReason || '-'
      })

      const holdingsData = await customerProductsApi.list(customerId)
      setHoldings(Array.isArray(holdingsData) ? holdingsData as Holding[] : [])
      await updateProductLedger()

      setNewProductId('')
      setNewQty(1)
      setNewReason('')
      toast.success('상품이 추가되었습니다.')
    } catch (error) {
      const message = getLocalizedErrorMessage(error, '상품 추가에 실패했습니다.')
      toast.error(message)
    } finally {
      setAddingProduct(false)
    }
  }

  // 보유 상품 증가
  const handleIncreaseHolding = async (holding: Holding) => {
    const amt = Math.abs(Number(holdingDelta[holding.id] ?? 1))
    if (!amt || !customerId) return

    const nextQty = Number(holding.quantity || 0) + amt
    const prevQty = holding.quantity

    setHoldings(list => list.map(x => x.id === holding.id ? { ...x, quantity: nextQty } : x))

    try {
      await customerProductsApi.update(holding.id, {
        quantity: nextQty,
        reason: holdingReason[holding.id] || '-'
      })

      setHoldingReason(s => ({ ...s, [holding.id]: '' }))
      setHoldingDelta(s => ({ ...s, [holding.id]: 1 }))
      await updateProductLedger()

      toast.success(`+${amt} 추가되었습니다.`)
    } catch (error) {
      setHoldings(list => list.map(x => x.id === holding.id ? { ...x, quantity: prevQty } : x))
      const message = getLocalizedErrorMessage(error, '수량 증가에 실패했습니다.')
      toast.error(message)
    }
  }

  // 보유 상품 감소
  const handleDecreaseHolding = async (holding: Holding) => {
    const amt = Math.abs(Number(holdingDelta[holding.id] ?? 1))
    if (!amt || !customerId) return

    const nextQty = Math.max(0, Number(holding.quantity || 0) - amt)
    const prevQty = holding.quantity

    setHoldings(list => list.map(x => x.id === holding.id ? { ...x, quantity: nextQty } : x))

    try {
      await customerProductsApi.update(holding.id, {
        quantity: nextQty,
        reason: holdingReason[holding.id] || '-'
      })

      setHoldingReason(s => ({ ...s, [holding.id]: '' }))
      setHoldingDelta(s => ({ ...s, [holding.id]: 1 }))
      await updateProductLedger()

      toast.success(`-${amt} 차감되었습니다.`)
    } catch (error) {
      setHoldings(list => list.map(x => x.id === holding.id ? { ...x, quantity: prevQty } : x))
      const message = getLocalizedErrorMessage(error, '수량 차감에 실패했습니다.')
      toast.error(message)
    }
  }

  // 보유 상품 삭제
  const handleDeleteHolding = async (holdingId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await customerProductsApi.delete(holdingId)
      setHoldings(list => list.filter(x => x.id !== holdingId))
      toast.success('삭제되었습니다.')
    } catch (error) {
      const message = getLocalizedErrorMessage(error, '삭제에 실패했습니다.')
      toast.error(message)
    }
  }

  // Ledger Note Update
  const handleUpdateLedgerNote = async (ledgerId: string, notes: string) => {
    if (!customerId) return
    try {
      await customerProductsApi.updateLedgerNote(ledgerId, notes)
      setProductLedger(list => list.map(item => item.id === ledgerId ? { ...item, notes } : item))
      toast.success('메모가 저장되었습니다.')
    } catch (error) {
      const message = getLocalizedErrorMessage(error, '메모 저장에 실패했습니다.')
      toast.error(message)
    }
  }

  return {
    holdings,
    products,
    newProductId,
    setNewProductId,
    newQty,
    setNewQty,
    newReason,
    setNewReason,
    addingProduct,
    holdingDelta,
    setHoldingDelta,
    holdingReason,
    setHoldingReason,
    productLedger,
    handleAddProduct,
    handleIncreaseHolding,
    handleDecreaseHolding,
    handleDeleteHolding,
    handleUpdateLedgerNote,
  }
}
