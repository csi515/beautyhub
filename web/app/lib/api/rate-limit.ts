/**
 * Rate Limiting ?좏떥由ы떚
 * 媛꾨떒??硫붾え由?湲곕컲 Rate Limiting 援ы쁽
 * 
 * ?꾨줈?뺤뀡 ?섍꼍?먯꽌??Redis 湲곕컲 ?붾（??沅뚯옣:
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

        // 二쇨린?곸쑝濡?留뚮즺????ぉ ?뺣━ (硫붾え由??꾩닔 諛⑹?)
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
            // ?덈줈???덈룄???쒖옉
            const resetTime = now + this.windowMs
            this.store.set(identifier, { count: 1, resetTime })
            return {
                allowed: true,
                remaining: this.maxRequests - 1,
                resetTime,
            }
        }

        if (entry.count >= this.maxRequests) {
            // ?쒗븳 珥덇낵
            return {
                allowed: false,
                remaining: 0,
                resetTime: entry.resetTime,
            }
        }

        // ?붿껌 移댁슫??利앷?
        entry.count++
        return {
            allowed: true,
            remaining: this.maxRequests - entry.count,
            resetTime: entry.resetTime,
        }
    }
}

// 湲濡쒕쾶 Rate Limiter ?몄뒪?댁뒪
const globalLimiter = new RateLimiter(60000, 100) // 1遺꾩뿉 100 ?붿껌
const strictLimiter = new RateLimiter(60000, 20) // 1遺꾩뿉 20 ?붿껌 (誘쇨컧???묒뾽??
const apiLimiter = new RateLimiter(60000, 300) // 1遺꾩뿉 300 ?붿껌 (API??

export { globalLimiter, strictLimiter, apiLimiter }

/**
 * IP 二쇱냼 異붿텧
 */
export function getClientIP(request: Request): string {
    // x-forwarded-for ?ㅻ뜑 ?뺤씤
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded && typeof forwarded === 'string') {
        const firstIP = forwarded.split(',')[0]
        if (firstIP) {
            return firstIP.trim()
        }
    }

    // x-real-ip ?ㅻ뜑 ?뺤씤
    const realIP = request.headers.get('x-real-ip')
    if (realIP && typeof realIP === 'string') {
        return realIP.trim()
    }

    return 'unknown'
}

/**
 * Rate Limit 泥댄겕
 */
export function checkRateLimit(
    request: Request,
    limiter: RateLimiter = globalLimiter
): { allowed: boolean; remaining: number; resetTime: number } {
    const ip = getClientIP(request)
    return limiter.check(ip)
}

/**
 * Rate Limit ?묐떟 ?ㅻ뜑 異붽?
 */
export function addRateLimitHeaders(
    headers: Headers,
    result: { remaining: number; resetTime: number }
): void {
    headers.set('X-RateLimit-Remaining', result.remaining.toString())
    headers.set('X-RateLimit-Reset', result.resetTime.toString())
}

/**
 * Rate Limit ?먮윭 ?묐떟
 */
export function createRateLimitResponse(resetTime: number): NextResponse {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)

    return NextResponse.json(
        {
            success: false,
            error: '?붿껌 ?잛닔 ?쒗븳??珥덇낵?덉뒿?덈떎. ?좎떆 ???ㅼ떆 ?쒕룄?댁＜?몄슂.',
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

