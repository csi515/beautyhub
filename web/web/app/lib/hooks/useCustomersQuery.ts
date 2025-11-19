/**
 * 고객 관련 React Query 훅
 * 
 * @example
 * // 고객 목록 조회
 * const { data: customers, isLoading } = useCustomersList({ search: '김' })
 * 
 * // 고객 상세 조회
 * const { data: customer } = useCustomerDetail('customer-id')
 * 
 * // 고객 생성
 * const createMutation = useCreateCustomer()
 * createMutation.mutate({ name: '홍길동', phone: '010-1234-5678' })
 */

import { useAppQuery, useAppMutation, queryKeys } from './useQuery'
import { customersApi } from '../api/customers'
import type { Customer, CustomerCreateInput, CustomerUpdateInput } from '@/types/entities'
import type { CustomersListQuery } from '@/types/api'
import { useQueryClient } from '@tanstack/react-query'

/**
 * 고객 목록 조회
 */
export function useCustomersList(query?: CustomersListQuery) {
  return useAppQuery<Customer[]>({
    queryKey: queryKeys.customers.list(query),
    queryFn: () => customersApi.list(query),
  })
}

/**
 * 고객 상세 조회
 */
export function useCustomerDetail(id: string | null) {
  return useAppQuery<Customer>({
    queryKey: queryKeys.customers.detail(id ?? ''),
    queryFn: () => {
      if (!id) throw new Error('Customer ID is required')
      return customersApi.get(id)
    },
    enabled: !!id,
  })
}

/**
 * 고객 생성
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient()
  
  return useAppMutation<Customer, CustomerCreateInput>({
    mutationFn: (input) => customersApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() })
    },
  })
}

/**
 * 고객 수정
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  
  return useAppMutation<Customer, { id: string; input: CustomerUpdateInput }>({
    mutationFn: ({ id, input }) => customersApi.update(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(data.id) })
    },
  })
}

/**
 * 고객 삭제
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  
  return useAppMutation<{ ok: boolean }, string>({
    mutationFn: (id) => customersApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() })
      queryClient.removeQueries({ queryKey: queryKeys.customers.detail(id) })
    },
  })
}

