'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Slide from '@mui/material/Slide'
import { WifiOff, Wifi } from 'lucide-react'
import { usePWA } from '@/app/lib/hooks/usePWA'

export default function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(true)
    const [wasOffline, setWasOffline] = useState(false)
    const [isReconnecting, setIsReconnecting] = useState(false)
    const router = useRouter()
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const { isStandalone, isIOS } = usePWA()

    useEffect(() => {
        // Check initial status
        const initialOnline = navigator.onLine
        setIsOnline(initialOnline)
        setWasOffline(!initialOnline)

        // 실제 네트워크 연결 확인 함수
        const checkNetworkConnection = async () => {
            try {
                const response = await fetch('/api/health', {
                    method: 'HEAD',
                    cache: 'no-cache',
                    signal: AbortSignal.timeout(3000), // 3초 타임아웃
                })
                return response.ok
            } catch {
                return false
            }
        }

        const handleOnline = async () => {
            // navigator.onLine이 true여도 실제 연결 확인
            const actuallyOnline = await checkNetworkConnection()
            
            if (actuallyOnline && wasOffline) {
                // 오프라인에서 온라인으로 전환 시
                setIsReconnecting(true)
                setIsOnline(true)
                setWasOffline(false)
                // 약간의 지연 후 자동 새로고침 (사용자가 알 수 있도록)
                reconnectTimeoutRef.current = setTimeout(() => {
                    router.refresh()
                    setIsReconnecting(false)
                }, 1500)
            } else {
                setIsOnline(actuallyOnline)
            }
        }

        const handleOffline = () => {
            setIsOnline(false)
            setWasOffline(true)
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
                reconnectTimeoutRef.current = null
            }
        }

        // 주기적으로 네트워크 상태 확인 (오프라인일 때만)
        let intervalId: NodeJS.Timeout | null = null
        if (!navigator.onLine) {
            intervalId = setInterval(async () => {
                const online = await checkNetworkConnection()
                if (online) {
                    handleOnline()
                }
            }, 5000) // 5초마다 확인
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            if (intervalId) {
                clearInterval(intervalId)
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
        }
    }, [router, wasOffline])

    // 온라인 상태이고 재연결 중이 아닐 때는 표시하지 않음
    if (isOnline && !isReconnecting) return null

    // 재연결 중 표시
    if (isReconnecting && isOnline) {
        return (
            <Slide direction="down" in={isReconnecting} mountOnEnter unmountOnExit>
                <Alert
                    severity="success"
                    icon={<Wifi size={20} />}
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        borderRadius: 0,
                        boxShadow: 2,
                        // PWA standalone 모드: safe-area-inset 고려
                        ...(isStandalone && isIOS && {
                            paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
                        }),
                    }}
                >
                    <AlertTitle>연결 복구됨</AlertTitle>
                    인터넷 연결이 복구되었습니다. 페이지를 새로고침합니다...
                </Alert>
            </Slide>
        )
    }

    // 오프라인 상태 표시
    if (!isOnline) {
        return (
            <Slide direction="down" in={!isOnline} mountOnEnter unmountOnExit>
                <Alert
                    severity="warning"
                    icon={<WifiOff size={20} />}
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        borderRadius: 0,
                        boxShadow: 2,
                        // PWA standalone 모드: safe-area-inset 고려
                        ...(isStandalone && isIOS && {
                            paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
                        }),
                    }}
                >
                    <AlertTitle>오프라인 모드</AlertTitle>
                    인터넷 연결이 끊겼습니다. 일부 기능이 제한될 수 있습니다.
                </Alert>
            </Slide>
        )
    }

    return null
}
