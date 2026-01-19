'use client'

import { useState, useEffect } from 'react'
import { settingsApi } from '../api/settings'

/**
 * 샵 이름을 가져오는 훅
 * 설정에서 storeName을 가져오고, 없으면 기본값 "BeautyHub" 반환
 */
export function useShopName(): string {
    const [shopName, setShopName] = useState<string>('BeautyHub')

    useEffect(() => {
        const loadShopName = async () => {
            try {
                const settings = await settingsApi.get()
                if (settings?.businessProfile?.storeName) {
                    setShopName(settings.businessProfile.storeName)
                }
            } catch (error) {
                // 에러 발생 시 기본값 유지
                console.error('Failed to load shop name:', error)
            }
        }

        loadShopName()
    }, [])

    return shopName
}
