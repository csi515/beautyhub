/**
 * API 미들웨어
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { UnauthorizedError } from './errors'
import { createErrorResponse } from './handlers'
import { checkRateLimit, addRateLimitHeaders, createRateLimitResponse, apiLimiter } from './rate-limit'

/**
 * 인증된 사용자 컨텍스트
 */
export interface AuthContext {
  userId: string
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
}

/**
 * 인증 미들웨어가 적용된 핸들러 타입
 */
export type AuthHandler = (
  req: NextRequest,
  context: AuthContext & { params?: Record<string, string> }
) => Promise<NextResponse> | NextResponse

/**
 * Rate Limiting 미들웨어 HOF
 * 
 * @example
 * export const POST = withRateLimit(
 *   async (req) => {
 *     // Rate limiting이 적용됨
 *     return NextResponse.json({ ok: true })
 *   },
 *   strictLimiter // 선택적으로 다른 limiter 사용
 * )
 */
export function withRateLimit(
  handler: (req: NextRequest, context?: { params?: Record<string, string> }) => Promise<NextResponse> | NextResponse,
  limiter = apiLimiter
) {
  return async (
    req: NextRequest,
    context?: { params?: Record<string, string> }
  ): Promise<NextResponse> => {
    // Rate limit 체크
    const rateLimitResult = checkRateLimit(req, limiter)

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.resetTime)
    }

    try {
      const response = await handler(req, context)

      // Rate Limit 헤더 추가
      addRateLimitHeaders(response.headers, rateLimitResult)

      return response
    } catch (error) {
      return createErrorResponse(error)
    }
  }
}

/**
 * 인증 미들웨어 HOF (Higher Order Function)
 * 
 * @example
 * export const GET = withAuth(async (req, { userId, supabase }) => {
 *   // userId와 supabase가 자동으로 주입됨
 *   return NextResponse.json({ userId })
 * })
 */
export function withAuth(handler: AuthHandler) {
  return async (
    req: NextRequest,
    context?: { params?: Record<string, string> }
  ): Promise<NextResponse> => {
    try {
      const userId = await getUserIdFromCookies()

      if (!userId) {
        throw new UnauthorizedError()
      }

      const supabase = await createSupabaseServerClient()

      return await handler(req, { userId, supabase, params: context?.params || {} })
    } catch (error) {
      return createErrorResponse(error)
    }
  }
}

/**
 * 에러 처리 미들웨어 HOF
 * 
 * @example
 * export const GET = withErrorHandling(async (req) => {
 *   // 에러가 자동으로 처리됨
 *   throw new ApiError('Something went wrong', 500)
 * })
 */
export function withErrorHandling(
  handler: (req: NextRequest, context?: { params?: Record<string, string> }) => Promise<NextResponse> | NextResponse
) {
  return async (
    req: NextRequest,
    context?: { params?: Record<string, string> }
  ): Promise<NextResponse> => {
    try {
      return await handler(req, context)
    } catch (error) {
      return createErrorResponse(error)
    }
  }
}

/**
 * 인증 및 에러 처리 미들웨어 조합
 * 
 * @example
 * export const GET = withAuthAndErrorHandling(async (req, { userId }) => {
 *   // userId가 주입되고 에러가 자동 처리됨
 *   return NextResponse.json({ userId })
 * })
 */
export function withAuthAndErrorHandling(handler: AuthHandler) {
  return withErrorHandling(withAuth(handler))
}

/**
 * 인증, Rate Limiting, 에러 처리 모두 적용
 * 
 * @example
 * export const POST = withFullProtection(async (req, { userId }) => {
 *   // 모든 보호 장치가 적용됨
 *   return NextResponse.json({ userId })
 * })
 */
export function withFullProtection(handler: AuthHandler, limiter = apiLimiter) {
  return withRateLimit(withAuth(handler), limiter)
}

