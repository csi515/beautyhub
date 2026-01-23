'use client'

/**
 * 선택 상태 관리 훅
 * 단일/다중 선택, Set/Array 기반 선택 지원
 */

import { useState, useCallback, useMemo } from 'react'

export interface UseSelectionOptions {
  multiple?: boolean
  useSet?: boolean
}

export interface UseSelectionReturn<T extends string | number> {
  selected: Set<T> | T[]
  selectedCount: number
  isSelected: (id: T) => boolean
  toggle: (id: T) => void
  select: (id: T) => void
  deselect: (id: T) => void
  selectAll: (ids: T[]) => void
  clear: () => void
  setSelected: (ids: T[] | Set<T>) => void
}

/**
 * 선택 상태 관리 훅
 * 
 * @example
 * // Set 기반 다중 선택
 * const selection = useSelection<string>({ useSet: true })
 * selection.toggle(productId)
 * selection.selectAll(productIds)
 * 
 * // Array 기반 다중 선택
 * const selection = useSelection<string>({ useSet: false })
 */
export function useSelection<T extends string | number>(
  options: UseSelectionOptions = {}
): UseSelectionReturn<T> {
  const { multiple = true, useSet = true } = options

  const [selectedSet, setSelectedSet] = useState<Set<T>>(new Set())
  const [selectedArray, setSelectedArray] = useState<T[]>([])

  const selected = useSet ? selectedSet : selectedArray

  const selectedCount = useMemo(() => {
    return useSet ? selectedSet.size : selectedArray.length
  }, [useSet, selectedSet, selectedArray])

  const isSelected = useCallback(
    (id: T): boolean => {
      if (useSet) {
        return selectedSet.has(id)
      } else {
        return selectedArray.includes(id)
      }
    },
    [useSet, selectedSet, selectedArray]
  )

  const toggle = useCallback(
    (id: T) => {
      if (useSet) {
        setSelectedSet(prev => {
          const next = new Set(prev)
          if (next.has(id)) {
            next.delete(id)
          } else {
            if (multiple) {
              next.add(id)
            } else {
              return new Set([id])
            }
          }
          return next
        })
      } else {
        setSelectedArray(prev => {
          if (prev.includes(id)) {
            return prev.filter(item => item !== id)
          } else {
            if (multiple) {
              return [...prev, id]
            } else {
              return [id]
            }
          }
        })
      }
    },
    [useSet, multiple]
  )

  const select = useCallback(
    (id: T) => {
      if (useSet) {
        setSelectedSet(prev => {
          const next = new Set(prev)
          next.add(id)
          return next
        })
      } else {
        setSelectedArray(prev => {
          if (prev.includes(id)) {
            return prev
          }
          return multiple ? [...prev, id] : [id]
        })
      }
    },
    [useSet, multiple]
  )

  const deselect = useCallback(
    (id: T) => {
      if (useSet) {
        setSelectedSet(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      } else {
        setSelectedArray(prev => prev.filter(item => item !== id))
      }
    },
    [useSet]
  )

  const selectAll = useCallback(
    (ids: T[]) => {
      if (useSet) {
        setSelectedSet(new Set(ids))
      } else {
        setSelectedArray([...ids])
      }
    },
    [useSet]
  )

  const clear = useCallback(() => {
    if (useSet) {
      setSelectedSet(new Set())
    } else {
      setSelectedArray([])
    }
  }, [useSet])

  const setSelected = useCallback(
    (ids: T[] | Set<T>) => {
      if (useSet) {
        setSelectedSet(ids instanceof Set ? ids : new Set(ids))
      } else {
        setSelectedArray(ids instanceof Set ? Array.from(ids) : ids)
      }
    },
    [useSet]
  )

  return {
    selected,
    selectedCount,
    isSelected,
    toggle,
    select,
    deselect,
    selectAll,
    clear,
    setSelected,
  }
}
