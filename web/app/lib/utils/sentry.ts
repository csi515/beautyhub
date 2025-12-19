/**
 * Sentry 설정 파일
 * 에러 추적 및 모니터링을 위한 Sentry 초기화
 * 
 * 사용하기 전에 다음 패키지를 설치해야 합니다:
 * npm install @sentry/nextjs
 * 
 * 그리고 환경 변수를 설정해야 합니다:
 * NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
 */

const SENTRY_DSN = process.env['NEXT_PUBLIC_SENTRY_DSN']
const ENVIRONMENT = process.env.NODE_ENV || 'development'

let Sentry: typeof import('@sentry/nextjs') | null = null

// Sentry 동적 import (패키지가 없어도 빌드 에러 없음)
async function getSentry() {
    if (Sentry) return Sentry

    try {
        // 동적 import로 패키지 존재 여부 확인
        const sentryModule = await import('@sentry/nextjs')
        Sentry = sentryModule
        return Sentry
    } catch (error) {
        console.warn('Sentry 패키지를 찾을 수 없습니다. 에러 추적이 비활성화됩니다.')
        return null
    }
}

// Sentry 초기화 (클라이언트 사이드)
export async function initSentry() {
    if (!SENTRY_DSN) {
        // Sentry DSN 미설정 시 조용히 스킵
        return
    }

    const SentrySDK = await getSentry()
    if (!SentrySDK) return

    try {
        SentrySDK.init({
            dsn: SENTRY_DSN,
            environment: ENVIRONMENT,
            tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,
        })
    } catch (error) {
        console.error('Sentry 초기화 실패:', error)
    }
}

// 수동으로 에러 캡처
export async function captureError(error: Error, context?: Record<string, any>) {
    if (!SENTRY_DSN) return

    const SentrySDK = await getSentry()
    if (!SentrySDK) return

    try {
        SentrySDK.captureException(error, {
            extra: context as any,
        })
    } catch (err) {
        console.error('Sentry 에러 캡처 실패:', err)
    }
}

// 사용자 정보 설정
export async function setSentryUser(user: { id: string; email?: string; role?: string }) {
    if (!SENTRY_DSN) return

    const SentrySDK = await getSentry()
    if (!SentrySDK) return

    try {
        SentrySDK.setUser({
            id: user.id,
            ...(user.email && { email: user.email }),
            ...(user.role && { role: user.role }),
        })
    } catch (error) {
        console.error('Sentry 사용자 설정 실패:', error)
    }
}

// 사용자 정보 제거
export async function clearSentryUser() {
    if (!SENTRY_DSN) return

    const SentrySDK = await getSentry()
    if (!SentrySDK) return

    try {
        SentrySDK.setUser(null)
    } catch (error) {
        console.error('Sentry 사용자 제거 실패:', error)
    }
}

// 커스텀 이벤트 추적
export async function trackEvent(eventName: string, data?: Record<string, any>) {
    if (!SENTRY_DSN) return

    const SentrySDK = await getSentry()
    if (!SentrySDK) return

    try {
        SentrySDK.captureMessage(eventName, {
            level: 'info',
            extra: data as any,
        })
    } catch (error) {
        console.error('Sentry 이벤트 추적 실패:', error)
    }
}
