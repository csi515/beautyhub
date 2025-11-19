/**
 * 상품 관련 React Query 훅
 */

import { useAppQuery, useAppMutation, queryKeys } from './useQuery'
import { productsApi } from '../api/products'
import type { Product, ProductCreateInput, ProductUpdateInput } from '@/types/entities'
import type { ProductsListQuery } from '@/types/api'
import { useQueryClient } from '@tanstack/react-query'

/**
 * 상품 목록 조회
 */
export function useProductsList(query?: ProductsListQuery) {
  return useAppQuery<Product[]>({
    queryKey: queryKeys.products.list(query),
    queryFn: () => productsApi.list(query),
  })
}

/**
 * 상품 상세 조회
 */
export function useProductDetail(id: string | null) {
  return useAppQuery<Product>({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: () => {
      if (!id) throw new Error('Product ID is required')
      return productsApi.get(id)
    },
    enabled: !!id,
  })
}

/**
 * 상품 생성
 */
export function useCreateProduct() {
  const queryClient = useQueryClient()
  
  return useAppMutation<Product, ProductCreateInput>({
    mutationFn: (input) => productsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() })
    },
  })
}

/**
 * 상품 수정
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient()
  
  return useAppMutation<Product, { id: string; input: ProductUpdateInput }>({
    mutationFn: ({ id, input }) => productsApi.update(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(data.id) })
    },
  })
}

/**
 * 상품 삭제
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient()
  
  return useAppMutation<{ ok: boolean }, string>({
    mutationFn: (id) => productsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() })
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(id) })
    },
  })
}

