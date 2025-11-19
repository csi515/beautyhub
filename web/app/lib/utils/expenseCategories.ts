/**
 * 지출 자동 분류 시스템
 * 자주 사용하는 지출 카테고리 관리
 */

export const DEFAULT_EXPENSE_CATEGORIES = [
  '임대료',
  '인건비',
  '재료비',
  '광고비',
  '유지보수',
  '전기세',
  '수도세',
  '인터넷비',
  '기타',
]

const STORAGE_KEY = 'expense-categories'

/**
 * 저장된 지출 카테고리 목록 가져오기
 */
export function getExpenseCategories(): string[] {
  if (typeof window === 'undefined') return DEFAULT_EXPENSE_CATEGORIES
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (error) {
    console.error('지출 카테고리 로드 실패:', error)
  }
  
  return DEFAULT_EXPENSE_CATEGORIES
}

/**
 * 지출 카테고리 저장
 */
export function saveExpenseCategories(categories: string[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
  } catch (error) {
    console.error('지출 카테고리 저장 실패:', error)
  }
}

/**
 * 메모 기반 자동 카테고리 추천
 */
export function suggestCategory(memo: string): string | null {
  const lowerMemo = memo.toLowerCase()
  
  // 키워드 매칭
  const keywordMap: Record<string, string> = {
    '임대': '임대료',
    '월세': '임대료',
    '전세': '임대료',
    '인건': '인건비',
    '급여': '인건비',
    '재료': '재료비',
    '원료': '재료비',
    '광고': '광고비',
    '홍보': '광고비',
    '마케팅': '광고비',
    '수리': '유지보수',
    '보수': '유지보수',
    '전기': '전기세',
    '수도': '수도세',
    '인터넷': '인터넷비',
    '통신': '인터넷비',
  }
  
  for (const [keyword, category] of Object.entries(keywordMap)) {
    if (lowerMemo.includes(keyword)) {
      return category
    }
  }
  
  return null
}

