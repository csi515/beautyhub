/**
 * Rate Limiting 유틸리티
 * 간단한 메모리 기반 Rate Limiting 구현
 * 
 * 프로덕션 환경에서는 Redis 기반 솔루션 권장:
 * - Upstash Rate Limit: https://upstash.com/docs/redis/features/ratelimiting
 * - Vercel KV: https://vercel.com/docs/storage/vercel-kv
 */

import { NextResponse } from 'next/server'

interface RateLimitEntry {
    count: number
    resetTime: number
}

class RateLimiter {
    private store: Map<string, RateLimitEntry> = new Map()
    private readonly windowMs: number
    private readonly maxRequests: number

    constructor(windowMs: number = 60000, maxRequests: number = 100) {
        this.windowMs = windowMs
        this.maxRequests = maxRequests

        // 주기적으로 만료된 항목 정리 (메모리 누수 방지)
        setInterval(() => this.cleanup(), this.windowMs)
    }

    private cleanup() {
        const now = Date.now()
        for (const [key, entry] of this.store.entries()) {
            if (entry.resetTime < now) {
                this.store.delete(key)
            }
        }
    }

    check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
        const now = Date.now()
        const entry = this.store.get(identifier)

        if (!entry || entry.resetTime < now) {
            // 새로운 윈도우 시작
            const resetTime = now + this.windowMs
            this.store.set(identifier, { count: 1, resetTime })
            return {
                allowed: true,
                remaining: this.maxRequests - 1,
                resetTime,
            }
        }

        if (entry.count >= this.maxRequests) {
            // 제한 초과
            return {
                allowed: false,
                remaining: 0,
                resetTime: entry.resetTime,
            }
        }

        // 요청 카운트 증가
        entry.count++
        return {
            allowed: true,
            remaining: this.maxRequests - entry.count,
            resetTime: entry.resetTime,
        }
    }
}

// 글로벌 Rate Limiter 인스턴스
const globalLimiter = new RateLimiter(60000, 100) // 1분에 100 요청
const strictLimiter = new RateLimiter(60000, 20) // 1분에 20 요청 (민감한 작업용)
const apiLimiter = new RateLimiter(60000, 300) // 1분에 300 요청 (API용)

export { globalLimiter, strictLimiter, apiLimiter }

/**
 * IP 주소 추출
 */
export function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')

    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    if (realIP) {
        return realIP.trim()
    }

    return 'unknown'
}

/**
 * Rate Limit 체크
 */
export function checkRateLimit(
    request: Request,
    limiter: RateLimiter = globalLimiter
): { allowed: boolean; remaining: number; resetTime: number } {
    const ip = getClientIP(request)
    return limiter.check(ip)
}

/**
 * Rate Limit 응답 헤더 추가
 */
export function addRateLimitHeaders(
    headers: Headers,
    result: { remaining: number; resetTime: number }
): void {
    headers.set('X-RateLimit-Remaining', result.remaining.toString())
    headers.set('X-RateLimit-Reset', result.resetTime.toString())
}

/**
 * Rate Limit 에러 응답
 */
export function createRateLimitResponse(resetTime: number): NextResponse {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)

    return NextResponse.json(
        {
            success: false,
            error: '요청 횟수 제한을 초과했습니다. 잠시 후 다시 시도해주세요.',
            retryAfter,
        },
        {
            status: 429,
            headers: {
                'Retry-After': retryAfter.toString(),
                'X-RateLimit-Reset': resetTime.toString(),
            },
        }
    )
}
