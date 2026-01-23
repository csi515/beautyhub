/**
 * 페이지 경로에서 제목을 추출하는 유틸리티
 */

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': '대시보드',
  '/customers': '고객 관리',
  '/products': '제품 관리',
  '/appointments': '예약 관리',
  '/finance': '재무 관리',
  '/staff': '직원 관리',
  '/inventory': '재고 관리',
  '/payroll': '급여 관리',
  '/settings': '설정',
  '/analytics': '분석',
  '/analytics/products': '제품 분석',
  '/analytics/appointments': '예약 분석',
  '/analytics/customer-segmentation': '고객 세분화',
  '/finance/budget': '예산',
  '/finance/forecast': '예측',
  '/finance/reports': '보고서',
  '/inventory/expiry': '유통기한 관리',
  '/settings/audit': '감사 로그',
  '/settings/backup': '백업',
  '/admin': '관리자',
  '/admin/users': '사용자 관리',
}

/**
 * 경로에서 페이지 제목을 가져옴
 */
export function getPageTitle(pathname: string): string | null {
  // 정확한 매칭
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname]
  }

  // 동적 경로 처리 (예: /customers/[id], /staff/[id])
  const pathSegments = pathname.split('/').filter(Boolean)
  
  if (pathSegments.length >= 2) {
    const basePath = `/${pathSegments[0]}`
    if (PAGE_TITLES[basePath]) {
      return PAGE_TITLES[basePath]
    }
  }

  // 기본 경로
  if (pathname === '/') {
    return '홈'
  }

  return null
}
