/**
 * 반응형 spacing 유틸리티
 * breakpoint별 spacing 값을 일관되게 관리
 * 
 * 모바일(xs~sm): 8~12px 수준
 * 웹(md 이상): 16~32px 수준
 */

export interface ResponsiveSpacing {
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
}

/**
 * 반응형 spacing 값 반환
 * MUI의 spacing prop에 직접 사용 가능
 * 
 * @example
 * <Stack spacing={getResponsiveSpacing({ xs: 1, sm: 1.5, md: 3 })}>
 */
export const getResponsiveSpacing = (values: ResponsiveSpacing): ResponsiveSpacing => {
  return values
}

/**
 * 섹션 간 간격 (페이지 최상위 레이아웃용)
 * 모바일: 8~12px, 웹: 24~32px
 */
export const sectionSpacing: ResponsiveSpacing = {
  xs: 1,      // 8px
  sm: 1.5,    // 12px
  md: 3,      // 24px
  lg: 4,      // 32px
}

/**
 * 컴포넌트 간 간격 (내부 컴포넌트용)
 * 모바일: 8px, 웹: 16px
 */
export const componentSpacing: ResponsiveSpacing = {
  xs: 1,      // 8px
  sm: 1,      // 8px
  md: 2,      // 16px
  lg: 2,      // 16px
}

/**
 * 카드 내부 간격
 * 모바일: 8~12px, 웹: 16px
 */
export const cardSpacing: ResponsiveSpacing = {
  xs: 1,      // 8px
  sm: 1.5,    // 12px
  md: 2,      // 16px
  lg: 2,      // 16px
}
