/**
 * API 응답 캐싱 유틸리티
 * Next.js unstable_cache를 사용하여 API 응답을 캐싱합니다.
 */

import { unstable_cache } from 'next/cache'

/**
 * 캐시 태그 생성
 */
export function createCacheTag(resource: string, userId?: string): string {
    return userId ? `${resource}:${userId}` : resource
}

/**
 * 여러 캐시 태그 생성
 */
export function createCacheTags(resource: string, userId?: string): string[] {
    const tags = [resource]
    if (userId) {
        tags.push(`${resource}:${userId}`)
        tags.push(`user:${userId}`)
    }
    return tags
}

/**
 * 캐시된 데이터 가져오기
 * 
 * @example
 * const products = await getCachedData(
 *   () => repository.findAll(),
 *   ['products', userId],
 *   300 // 5분
 * )
 */
export async function getCachedData<T>(
    fetcher: () => Promise<T>,
    keys: string[],
    revalidate: number = 60,
    tags?: string[]
): Promise<T> {
    const cachedFn = unstable_cache(
        fetcher,
        keys,
        {
            revalidate,
            tags: tags || keys,
        }
    )

    return cachedFn()
}

/**
 * 캐시 무효화
 */
export async function revalidateCache(tags: string | string[]) {
    const { revalidateTag } = await import('next/cache')
    const tagArray = Array.isArray(tags) ? tags : [tags]

    for (const tag of tagArray) {
        revalidateTag(tag)
    }
}

/**
 * 사용자별 캐시 무효화
 */
export async function revalidateUserCache(userId: string, resources?: string[]) {
    if (resources && resources.length > 0) {
        const tags = resources.flatMap(resource => createCacheTags(resource, userId))
        await revalidateCache(tags)
    } else {
        // 사용자의 모든 캐시 무효화
        await revalidateCache(`user:${userId}`)
    }
}

/**
 * 리소스별 캐시 무효화
 */
export async function revalidateResourceCache(resource: string, userId?: string) {
    const tags = createCacheTags(resource, userId)
    await revalidateCache(tags)
}

/**
 * 캐시 설정 헬퍼
 */
export const CacheConfig = {
    // 정적 데이터 (거의 변경되지 않음)
    static: {
        revalidate: 3600, // 1시간
    },
    // 준정적 데이터 (가끔 변경됨)
    semiStatic: {
        revalidate: 300, // 5분
    },
    // 동적 데이터 (자주 변경됨)
    dynamic: {
        revalidate: 60, // 1분
    },
    // 실시간 데이터 (캐싱 안함)
    realtime: {
        revalidate: 0, // 캐싱 안함
    },
} as const

/**
 * 리소스별 캐시 설정
 */
export const ResourceCacheConfig = {
    products: CacheConfig.semiStatic,
    customers: CacheConfig.dynamic,
    staff: CacheConfig.semiStatic,
    appointments: CacheConfig.realtime, // 예약은 실시간으로 확인 필요
    transactions: CacheConfig.dynamic,
    expenses: CacheConfig.dynamic,
    settings: CacheConfig.static,
} as const

/**
 * 타입 안전한 캐시 키 생성
 */
export type ResourceType = keyof typeof ResourceCacheConfig

export function createResourceCacheKey(
    resource: ResourceType,
    userId: string,
    ...additionalKeys: string[]
): string[] {
    return [resource, userId, ...additionalKeys]
}
