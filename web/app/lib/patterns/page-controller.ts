/**
 * 공통 페이지 컨트롤러 패턴 정의
 * 페이지는 컨트롤러 역할만 하도록 구조화
 */

export interface PageControllerConfig<TData, TViewProps> {
  // 인증 확인
  requireAuth?: boolean
  
  // 데이터 로딩
  loadData: () => Promise<TData>
  
  // View에 전달할 props 변환
  mapToViewProps: (data: TData) => TViewProps
  
  // 에러 처리
  onError?: (error: Error) => void
}

export interface PageControllerState<TData> {
  data: TData | null
  loading: boolean
  error: Error | null
}

/**
 * 페이지 컨트롤러 기본 인터페이스
 * 모든 페이지 컨트롤러는 이 패턴을 따름
 */
export interface BasePageController {
  // 인증 확인
  checkAuth?: () => Promise<boolean>
  
  // 날짜/파라미터 결정
  getParams?: () => Record<string, unknown>
  
  // 데이터 로딩 결정
  determineDataToLoad?: () => Promise<string[]>
}
