/**
 * 인증 리다이렉트 URL 생성 유틸리티
 * localhost 방지 및 환경 변수 우선순위 적용
 */

/**
 * 환경 변수 우선순위:
 * 1. NEXT_PUBLIC_SITE_URL (프로덕션 도메인)
 * 2. NEXT_PUBLIC_BASE_URL (대체)
 * 3. VERCEL_URL (Vercel 배포 시)
 * 4. window.location.origin (최후의 수단, localhost 체크)
 */
export function getAuthRedirectTo(path: string): string {
  // path가 이미 전체 URL인 경우 그대로 반환
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // path가 /로 시작하지 않으면 추가
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  // 서버 사이드에서는 환경 변수만 사용
  if (typeof window === 'undefined') {
    const { getEnv } = require('@/app/lib/env')
    const siteUrl = getEnv.siteUrl()
    const baseUrl = getEnv.baseUrl()
    const vercelUrl = process.env.VERCEL_URL

    // 우선순위에 따라 URL 선택
    if (siteUrl && !isLocalhost(siteUrl)) {
      return `${siteUrl}${normalizedPath}`
    }
    if (baseUrl && !isLocalhost(baseUrl)) {
      return `${baseUrl}${normalizedPath}`
    }
    if (vercelUrl && !isLocalhost(vercelUrl)) {
      return `https://${vercelUrl}${normalizedPath}`
    }

    // 서버 사이드에서 localhost는 허용하지 않음
    throw new Error(
      'NEXT_PUBLIC_SITE_URL 또는 NEXT_PUBLIC_BASE_URL 환경 변수가 설정되지 않았거나 localhost입니다. 프로덕션 환경에서는 반드시 설정해야 합니다.'
    )
  }

  // 클라이언트 사이드
  const { getEnv } = require('@/app/lib/env')
  const siteUrl = getEnv.siteUrl()
  const baseUrl = getEnv.baseUrl()
  const vercelUrl = process.env.VERCEL_URL

  // 우선순위에 따라 URL 선택
  if (siteUrl && !isLocalhost(siteUrl)) {
    return `${siteUrl}${normalizedPath}`
  }
  if (baseUrl && !isLocalhost(baseUrl)) {
    return `${baseUrl}${normalizedPath}`
  }
  if (vercelUrl && !isLocalhost(vercelUrl)) {
    return `https://${vercelUrl}${normalizedPath}`
  }

  // 최후의 수단: window.location.origin 사용 (localhost 체크)
  const origin = window.location.origin
  if (isLocalhost(origin)) {
    console.warn(
      '⚠️ localhost로 리다이렉트 URL이 생성되었습니다. 프로덕션 환경에서는 NEXT_PUBLIC_SITE_URL 환경 변수를 설정해야 합니다.'
    )
  }

  return `${origin}${normalizedPath}`
}

/**
 * URL이 localhost인지 확인
 */
function isLocalhost(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('localhost:') ||
      hostname.startsWith('127.0.0.1:')
    )
  } catch {
    // URL 파싱 실패 시 문자열 검사
    return (
      url.includes('localhost') ||
      url.includes('127.0.0.1') ||
      url.includes('0.0.0.0')
    )
  }
}
