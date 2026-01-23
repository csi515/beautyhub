/**
 * 페이지별 헤더 정보를 전역으로 관리하는 Context
 * 모바일에서 TopBar가 페이지별 정보를 동적으로 표시하기 위해 사용
 */

'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface PageHeaderInfo {
  title?: string
  icon?: ReactNode
  showBack?: boolean
  onBack?: () => void
  onFilter?: () => void
  filterBadge?: number
  actions?: ReactNode | ReactNode[]
  // 데스크탑에서도 사용할 수 있는 추가 정보
  description?: string
}

interface PageHeaderContextValue {
  headerInfo: PageHeaderInfo | null
  setHeaderInfo: (info: PageHeaderInfo | null) => void
  clearHeaderInfo: () => void
}

const PageHeaderContext = createContext<PageHeaderContextValue | undefined>(undefined)

/**
 * PageHeaderContext Provider
 * AppShell에서 제공하여 모든 페이지에서 헤더 정보를 설정할 수 있도록 함
 */
export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [headerInfo, setHeaderInfo] = useState<PageHeaderInfo | null>(null)

  const clearHeaderInfo = useCallback(() => {
    setHeaderInfo(null)
  }, [])

  return (
    <PageHeaderContext.Provider
      value={{
        headerInfo,
        setHeaderInfo,
        clearHeaderInfo,
      }}
    >
      {children}
    </PageHeaderContext.Provider>
  )
}

/**
 * PageHeaderContext를 사용하는 훅
 */
export function usePageHeader() {
  const context = useContext(PageHeaderContext)
  if (context === undefined) {
    throw new Error('usePageHeader must be used within a PageHeaderProvider')
  }
  return context
}
