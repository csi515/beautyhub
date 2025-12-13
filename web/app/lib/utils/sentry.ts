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

let Sentry: any = null

// Sentry 동적 import
async function getSentry() {
    if (Sentry) return Sentry

    try {
        Sentry = await import('@sentry/nextjs')
        return Sentry
    } catch (error) {
        console.warn('Sentry 패키지를 찾을 수 없습니다. npm install @sentry/nextjs를 실행해주세요.')
        return null
    }
}

// Sentry 초기화 (클라이언트 사이드)
export async function initSentry() {
    if (!SENTRY_DSN) {
        console.warn('Sentry DSN이 설정되지 않았습니다. 에러 추적이 비활성화됩니다.')
        return
    }

    const SentrySDK = await getSentry()
    if (!SentrySDK) return

    SentrySDK.init({
        dsn: SENTRY_DSN,
        environment: ENVIRONMENT,

        // 성능 모니터링 샘플링 비율 (0.0 ~ 1.0)
        // 프로덕션에서는 낮은 값으로 설정하여 비용 절감
        tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

        // 세션 리플레이 샘플링 비율
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,

        // 통합 설정
        integrations: [
            new SentrySDK.BrowserTracing({
                // 자동으로 트레이스할 URL 패턴
                tracePropagationTargets: ['localhost', /^https:\/\/.*\.vercel\.app/],
            }),
            new SentrySDK.Replay({
                // 민감한 정보 마스킹
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],

        // 에러 필터링 (특정 에러 무시)
        beforeSend(event: any, hint: any) {
            // 개발 환경에서는 콘솔에만 출력
            if (ENVIRONMENT === 'development') {
                console.error('Sentry Error:', hint.originalException || hint.syntheticException)
                return null
            }

            // 네트워크 오류 중 일부 무시
            const error = hint.originalException as Error
            if (error?.message?.includes('Failed to fetch')) {
                return null
            }

            return event
        },

        // 개인정보 보호
        beforeBreadcrumb(breadcrumb: any) {
            // URL에서 민감한 정보 제거
            if (breadcrumb.category === 'navigation') {
                const url = breadcrumb.data?.to
                if (url) {
                    // 쿼리 파라미터 제거
                    breadcrumb.data.to = url.split('?')[0]
                }
            }
            return breadcrumb
        },
    })
}

// 수동으로 에러 캡처
export async function captureError(error: Error, context?: Record<string, any>) {
    if (!SENTRY_DSN) return

    const SentrySDK = await getSentry()
    if (!SentrySDK) return

    SentrySDK.captureException(error, {
        extra: context,
    })
}

// 사용자 정보 설정
export async function setSentryUser(user: { id: string; email?: string; role?: string }) {
    if (!SENTRY_DSN) return

    const SentrySDK = await getSentry()
    if (!SentrySDK) return

    SentrySDK.setUser({
        id: user.id,
        email: user.email,
        role: user.role,
    })
}

// 사용자 정보 제거
export async function clearSentryUser() {
    if (!SENTRY_DSN) return

    const SentrySDK = await getSentry()
    if (!SentrySDK) return

    SentrySDK.setUser(null)
}

// 커스텀 이벤트 추적
export async function trackEvent(eventName: string, data?: Record<string, any>) {
    if (!SENTRY_DSN) return

    const SentrySDK = await getSentry()
    if (!SentrySDK) return

    SentrySDK.captureMessage(eventName, {
        level: 'info',
        extra: data,
    })
}
