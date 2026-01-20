/**
 * 재무 관련 타입 정의
 */

/**
 * 예산 엔티티
 */
export interface Budget {
  id: string
  owner_id: string
  category: string
  month: string // YYYY-MM 형식
  budget_amount: number
  spent_amount: number
  created_at?: string
  updated_at?: string
}

/**
 * 예산 생성/수정 DTO
 */
export interface BudgetCreateInput {
  category: string
  month: string
  budget_amount: number
}

export interface BudgetUpdateInput {
  budget_amount?: number
  spent_amount?: number
}

/**
 * 재무 생성 폼 타입
 */
export interface FinanceCreateForm {
  newType: 'income' | 'expense'
  newDate: string
  newAmount: string
  selectedCategory: string
  newMemo: string
}

/**
 * 재무 통합 행 타입 (수입/지출 통합)
 */
export interface FinanceCombinedRow {
  id: string
  type: 'income' | 'expense'
  date: string
  amount: number
  memo?: string
  category?: string
  raw?: any
}

/**
 * 재무 모달 상태 타입
 */
export interface FinanceModalState {
  newOpen: boolean
  expenseOpen: boolean
  txOpen: boolean
  expenseDetail: any | null
  txDetail: any | null
}

/**
 * 재무 날짜 범위 타입
 */
export interface FinanceDateRange {
  from: string
  to: string
}

/**
 * 재무 상태 타입
 */
export interface FinanceState {
  expenses: any[]
  transactions: any[]
  loading: boolean
  error: string
  incomeCategories: string[]
  expenseCategories: string[]
}

/**
 * 재무 필터 타입
 */
export interface FinanceFilters {
  filterType: ('income' | 'expense')[]
  sortKey: 'date' | 'amount'
  sortDir: 'asc' | 'desc'
  showFilters: boolean
}
