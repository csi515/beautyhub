'use client'

/**
 * 다중 모달 상태 관리 훅
 */

import { useState, useCallback } from 'react'

export interface UseModalsReturn<ModalKeys extends string> {
  isOpen: (key: ModalKeys) => boolean
  open: (key: ModalKeys, data?: any) => void
  close: (key: ModalKeys) => void
  closeAll: () => void
  getSelected: <T>(key: ModalKeys) => T | null
  setOpen: (key: ModalKeys, open: boolean) => void
}

/**
 * 다중 모달 상태 관리 훅
 * 여러 모달을 키 기반으로 관리
 * 
 * @example
 * const modals = useModals<'detail' | 'create' | 'settings'>()
 * modals.open('detail', product)
 * modals.isOpen('detail') // true
 */
export function useModals<ModalKeys extends string>(
  initialModals?: Partial<Record<ModalKeys, boolean>>
): UseModalsReturn<ModalKeys> {
  const [modalStates, setModalStates] = useState<Record<ModalKeys, boolean>>(
    () => {
      const initial: Record<string, boolean> = {}
      if (initialModals) {
        Object.keys(initialModals).forEach(key => {
          initial[key] = initialModals[key as ModalKeys] ?? false
        })
      }
      return initial as Record<ModalKeys, boolean>
    }
  )

  const [selectedData, setSelectedData] = useState<Record<string, any>>({})

  const isOpen = useCallback(
    (key: ModalKeys): boolean => {
      return modalStates[key] ?? false
    },
    [modalStates]
  )

  const open = useCallback((key: ModalKeys, data?: any) => {
    setModalStates(prev => ({ ...prev, [key]: true }))
    if (data !== undefined) {
      setSelectedData(prev => ({ ...prev, [key]: data }))
    }
  }, [])

  const close = useCallback((key: ModalKeys) => {
    setModalStates(prev => ({ ...prev, [key]: false }))
    setSelectedData(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const closeAll = useCallback(() => {
    setModalStates({} as Record<ModalKeys, boolean>)
    setSelectedData({})
  }, [])

  const getSelected = useCallback(
    <T,>(key: ModalKeys): T | null => {
      return (selectedData[key] as T) ?? null
    },
    [selectedData]
  )

  const setOpen = useCallback((key: ModalKeys, open: boolean) => {
    if (open) {
      setModalStates(prev => ({ ...prev, [key]: true }))
    } else {
      setModalStates(prev => ({ ...prev, [key]: false }))
      setSelectedData(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }, [])

  return {
    isOpen,
    open,
    close,
    closeAll,
    getSelected,
    setOpen,
  }
}
