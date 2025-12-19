'use client'

import { useState, useEffect } from 'react'
import { getCookie } from 'cookies-next'

export function useIsDemo() {
    const [isDemo, setIsDemo] = useState(false)

    useEffect(() => {
        // 클라이언트 사이드에서 쿠키 확인
        const demoMode = getCookie('demo_mode') === 'true'
        setIsDemo(demoMode)
    }, [])

    return isDemo
}
