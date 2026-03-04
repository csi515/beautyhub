'use client'

import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Slide from '@mui/material/Slide'
import { WifiOff } from 'lucide-react'

export default function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        // Check initial status
        setIsOnline(navigator.onLine)

        // Listen for online/offline events
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (isOnline) return null

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
                }}
            >
                <AlertTitle>오프라인 모드</AlertTitle>
                인터넷 연결이 끊겼습니다. 일부 기능이 제한될 수 있습니다.
            </Alert>
        </Slide>
    )
}
