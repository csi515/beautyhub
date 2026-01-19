/**
 * useCustomersQuery 훅 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCustomersList, useCreateCustomer } from '@/app/lib/hooks/useCustomersQuery'
import { customersApi } from '@/app/lib/api/customers'
import type { ReactNode } from 'react'

// API 모킹
vi.mock('@/app/lib/api/customers', () => ({
  customersApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useCustomersQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useCustomersList', () => {
    it('고객 목록 조회 성공', async () => {
      const mockCustomers = [
        { id: '1', name: '홍길동', phone: '010-1234-5678' },
        { id: '2', name: '김철수', phone: '010-9876-5432' },
      ]
      
      vi.mocked(customersApi.list).mockResolvedValue(mockCustomers as any)
      
      const { result } = renderHook(() => useCustomersList(), {
        wrapper: createWrapper(),
      })
      
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
      
      expect(result.current.data).toEqual(mockCustomers)
      expect(customersApi.list).toHaveBeenCalledTimes(1)
    })

    it('검색 쿼리와 함께 조회', async () => {
      const mockCustomers = [{ id: '1', name: '홍길동' }]
      vi.mocked(customersApi.list).mockResolvedValue(mockCustomers as any)
      
      const { result } = renderHook(() => useCustomersList({ search: '홍' }), {
        wrapper: createWrapper(),
      })
      
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
      
      expect(customersApi.list).toHaveBeenCalledWith({ search: '홍' })
    })
  })

  describe('useCreateCustomer', () => {
    it('고객 생성 성공', async () => {
      const newCustomer = { id: '3', name: '이영희', phone: '010-1111-2222' }
      vi.mocked(customersApi.create).mockResolvedValue(newCustomer as any)
      
      const { result } = renderHook(() => useCreateCustomer(), {
        wrapper: createWrapper(),
      })
      
      const input = { name: '이영희', phone: '010-1111-2222' }
      result.current.mutate(input)
      
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
      
      expect(customersApi.create).toHaveBeenCalledWith(input)
      expect(result.current.data).toEqual(newCustomer)
    })
  })
})

