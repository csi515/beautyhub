'use client'

/**
 * 단일 모달 상태 관리 훅
 */

import { useState, useCallback } from 'react'

export interface UseModalReturn<T = void> {
  open: boolean
  selected: T | null
  openModal: (item?: T) => void
  closeModal: () => void
  toggle: () => void
  setOpen: (open: boolean) => void
}

/**
 * 단일 모달 상태 관리 훅
 * 
 * @example
 * // 단순 모달
 * const detailModal = useModal()
 * 
 * // 데이터와 함께 사용
 * const productModal = useModal<Product>()
 * productModal.openModal(product)
 */
export function useModal<T = void>(): UseModalReturn<T> {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<T | null>(null)

  const openModal = useCallback((item?: T) => {
    if (item !== undefined) {
      setSelected(item)
    }
    setOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setOpen(false)
    setSelected(null)
  }, [])

  const toggle = useCallback(() => {
    setOpen(prev => {
      if (prev) {
        setSelected(null)
      }
      return !prev
    })
  }, [])

  return {
    open,
    selected,
    openModal,
    closeModal,
    toggle,
    setOpen,
  }
}
