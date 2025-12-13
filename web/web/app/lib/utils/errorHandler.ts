/**
 * 통일된 에러 처리 유틸리티
 */

import { getLocalizedErrorMessage } from './messages'

export interface AppError {
  message: string
  code?: string
  status?: number
  originalError?: unknown
}

/**
 * 에러를 AppError 형식으로 변환
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof Error) {
    return {
      message: error.message,
      originalError: error,
    }
  }

  if (typeof error === 'string') {
    return {
      message: error,
    }
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const code = 'code' in error ? String((error as Record<string, unknown>)['code']) : undefined
    const status = 'status' in error ? Number((error as Record<string, unknown>)['status']) : undefined

    return {
      message: String(error.message),
      ...(code ? { code } : {}),
      ...(status ? { status } : {}),
      originalError: error,
    }
  }

  return {
    message: '알 수 없는 오류가 발생했습니다.',
    originalError: error,
  }
}

/**
 * 사용자 친화적인 에러 메시지로 변환
 * 새로운 현지화 유틸리티 사용
 */
export function getUserFriendlyMessage(error: AppError | unknown): string {
  // 새로운 현지화 함수 사용
  return getLocalizedErrorMessage(error, '오류가 발생했습니다.')
}

/**
 * 에러 로깅 (개발 환경에서만 상세 로그)
 */
export function logError(context: string, error: AppError): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, {
      message: error.message,
      code: error.code,
      status: error.status,
      originalError: error.originalError,
    })
  } else {
    // 프로덕션에서는 간단한 로그만
    console.error(`[${context}]`, error.message)
  }
}

