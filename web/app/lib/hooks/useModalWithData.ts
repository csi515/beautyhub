'use client'

/**
 * 모달과 데이터를 함께 관리하는 훅
 * 모달 열 때 데이터 설정, 닫을 때 데이터 초기화
 */

import { useState, useCallback } from 'react'

export interface UseModalWithDataReturn<T> {
  open: boolean
  data: T | null
  openModal: (data: T) => void
  closeModal: () => void
  updateData: (data: Partial<T>) => void
}

/**
 * 모달과 데이터를 함께 관리하는 훅
 * 
 * @example
 * const productModal = useModalWithData<Product>()
 * productModal.openModal(product)
 * <Modal open={productModal.open} onClose={productModal.closeModal}>
 *   {productModal.data && <ProductForm product={productModal.data} />}
 * </Modal>
 */
export function useModalWithData<T>(): UseModalWithDataReturn<T> {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<T | null>(null)

  const openModal = useCallback((newData: T) => {
    setData(newData)
    setOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setOpen(false)
    setData(null)
  }, [])

  const updateData = useCallback((partialData: Partial<T>) => {
    setData(prev => {
      if (prev === null) {
        return partialData as T
      }
      return { ...prev, ...partialData }
    })
  }, [])

  return {
    open,
    data,
    openModal,
    closeModal,
    updateData,
  }
}
