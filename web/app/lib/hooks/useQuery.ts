/**
 * React Query 기반 커스텀 훅
 * 기존 API 클라이언트와 통합
 */

import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'

/**
 * API 함수 타입
 */
type QueryFn<T> = () => Promise<T>

/**
 * React Query를 사용한 데이터 조회 훅
 * 
 * @example
 * const { data, isLoading, error } = useAppQuery({
 *   queryKey: ['customers', searchQuery],
 *   queryFn: () => customersApi.list({ search: searchQuery }),
 * })
 */
export function useAppQuery<TData>(
  options: Omit<UseQueryOptions<TData>, 'queryFn'> & {
    queryFn: QueryFn<TData>
  }
) {
  return useQuery<TData>({
    ...options,
    queryFn: options.queryFn,
  })
}

/**
 * React Query를 사용한 데이터 변경 훅
 * 
 * @example
 * const mutation = useAppMutation({
 *   mutationFn: (input: CustomerCreateInput) => customersApi.create(input),
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({ queryKey: ['customers'] })
 *   },
 * })
 */
export function useAppMutation<TData, TVariables>(
  options: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>(options)
}

/**
 * 쿼리 키 팩토리
 * 타입 안전한 쿼리 키 생성
 */
export const queryKeys = {
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (filters?: { search?: string }) => [...queryKeys.customers.lists(), filters] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.customers.details(), id] as const,
  },
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters?: { limit?: number }) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },
  appointments: {
    all: ['appointments'] as const,
    lists: () => [...queryKeys.appointments.all, 'list'] as const,
    list: (filters?: { from?: string; to?: string }) => [...queryKeys.appointments.lists(), filters] as const,
    details: () => [...queryKeys.appointments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.appointments.details(), id] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (filters?: { from?: string; to?: string }) => [...queryKeys.transactions.lists(), filters] as const,
    details: () => [...queryKeys.transactions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
  },
  expenses: {
    all: ['expenses'] as const,
    lists: () => [...queryKeys.expenses.all, 'list'] as const,
    list: (filters?: { from?: string; to?: string }) => [...queryKeys.expenses.lists(), filters] as const,
    details: () => [...queryKeys.expenses.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.expenses.details(), id] as const,
  },
  settings: {
    all: ['settings'] as const,
    detail: () => [...queryKeys.settings.all, 'detail'] as const,
  },
  consultationNotes: {
    all: ['consultationNotes'] as const,
    lists: () => [...queryKeys.consultationNotes.all, 'list'] as const,
    list: (customerId: string, filters?: { limit?: number; offset?: number }) => [...queryKeys.consultationNotes.lists(), customerId, filters] as const,
  },
  customerPhotos: {
    all: ['customerPhotos'] as const,
    lists: () => [...queryKeys.customerPhotos.all, 'list'] as const,
    list: (customerId: string, filters?: { photo_type?: string }) => [...queryKeys.customerPhotos.lists(), customerId, filters] as const,
  },
  appointmentReminders: {
    all: ['appointmentReminders'] as const,
    lists: () => [...queryKeys.appointmentReminders.all, 'list'] as const,
    list: (filters?: { upcoming?: boolean; appointment_id?: string }) => [...queryKeys.appointmentReminders.lists(), filters] as const,
  },
  appointmentTemplates: {
    all: ['appointmentTemplates'] as const,
    lists: () => [...queryKeys.appointmentTemplates.all, 'list'] as const,
    list: (filters?: { search?: string }) => [...queryKeys.appointmentTemplates.lists(), filters] as const,
  },
  inactiveCustomers: {
    all: ['inactiveCustomers'] as const,
    list: (days?: number) => [...queryKeys.inactiveCustomers.all, days] as const,
  },
} as const

