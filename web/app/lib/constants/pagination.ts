/**
 * 페이지네이션 공통 상수
 * 리스트/테이블 페이지의 기본 페이지 크기
 */
export const DEFAULT_PAGE_SIZE = {
  tablet: 8,
  desktop: 12,
} as const

/** 재고 페이지용 (API limit 별도) */
export const INVENTORY_PAGE_SIZE = {
  tablet: 12,
  desktop: 20,
} as const
