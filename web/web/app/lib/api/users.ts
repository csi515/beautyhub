/**
 * 사용자 관리 API (슈퍼 관리자 전용)
 */

import { User, UserStatus, UserUpdateInput } from '@/types/entities'

/**
 * Supabase 클라이언트를 받아서 사용자 관리 API를 제공하는 함수
 */
export function createUsersApi(supabase: any) {
    return {
        /**
         * 모든 사용자 목록 조회 (슈퍼 관리자 전용)
         */
        async list(): Promise<User[]> {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                throw new Error(`사용자 목록 조회 실패: ${error.message}`)
            }

            return data || []
        },

        /**
         * 사용자 상태 업데이트 (슈퍼 관리자 전용)
         * @param userId - 업데이트할 사용자 ID
         * @param status - 새로운 상태 값
         */
        async updateStatus(userId: string, status: UserStatus): Promise<void> {
            const { error } = await supabase
                .from('users')
                .update({ status })
                .eq('id', userId)

            if (error) {
                throw new Error(`사용자 상태 업데이트 실패: ${error.message}`)
            }
        },

        /**
         * 사용자 정보 업데이트 (슈퍼 관리자 전용)
         * @param userId - 업데이트할 사용자 ID
         * @param input - 업데이트할 필드들
         */
        async update(userId: string, input: UserUpdateInput): Promise<void> {
            const { error } = await supabase
                .from('users')
                .update(input)
                .eq('id', userId)

            if (error) {
                throw new Error(`사용자 정보 업데이트 실패: ${error.message}`)
            }
        },

        /**
         * 특정 사용자 조회
         * @param userId - 조회할 사용자 ID
         */
        async getById(userId: string): Promise<User | null> {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (error) {
                throw new Error(`사용자 조회 실패: ${error.message}`)
            }

            return data
        },
    }
}

/**
 * 기본 사용자 API 인스턴스 생성 헬퍼
 * 클라이언트 컴포넌트에서 Supabase 클라이언트를 생성하여 사용
 */
export async function getUsersApi() {
    if (typeof window === 'undefined') {
        throw new Error('사용자 API는 클라이언트 사이드에서만 사용할 수 있습니다.')
    }

    const { createSupabaseBrowserClient } = await import('@/lib/supabase/client')
    const supabase = createSupabaseBrowserClient()

    return createUsersApi(supabase)
}
