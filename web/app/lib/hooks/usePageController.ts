/**
 * 공통 페이지 컨트롤러 훅
 * 페이지의 컨트롤러 역할을 표준화
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { PageControllerConfig, PageControllerState } from '../patterns/page-controller'

export interface UsePageControllerReturn<TData, TViewProps> {
  data: TData | null
  loading: boolean
  error: Error | null
  viewProps: TViewProps | null
  refetch: () => Promise<void>
}

/**
 * 페이지 컨트롤러 훅
 * 데이터 로딩, 상태 관리, View props 변환을 담당
 * 
 * @example
 * const { viewProps, loading, error, refetch } = usePageController({
 *   loadData: async () => {
 *     const { productsApi } = await import('@/app/lib/api/products')
 *     return await productsApi.list()
 *   },
 *   mapToViewProps: (data) => ({
 *     products: data,
 *     onRefresh: refetch
 *   })
 * })
 */
export function usePageController<TData, TViewProps>(
  config: PageControllerConfig<TData, TViewProps>
): UsePageControllerReturn<TData, TViewProps> {
  const [state, setState] = useState<PageControllerState<TData>>({
    data: null,
    loading: true,
    error: null
  })

  const load = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const data = await config.loadData()
      setState({ data, loading: false, error: null })
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      setState(prev => ({ ...prev, loading: false, error: err }))
      config.onError?.(err)
    }
  }, [config])

  useEffect(() => {
    load()
  }, [load])

  const viewProps = useMemo(() => {
    if (!state.data) return null
    return config.mapToViewProps(state.data)
  }, [state.data, config])

  return {
    ...state,
    viewProps,
    refetch: load
  }
}
