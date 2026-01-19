'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Button, Stack } from '@mui/material'
import { WifiOff, RefreshCw, Home } from 'lucide-react'

/**
 * 오프라인 페이지
 * 네트워크 연결이 없을 때 표시되는 페이지
 */
export default function OfflinePage() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    // 초기 온라인 상태 확인
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine)
    }

    // 온라인/오프라인 이벤트 리스너
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 네트워크 상태 확인
  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache',
      })
      if (response.ok) {
        setIsOnline(true)
        // 연결이 복구되면 홈으로 이동
        setTimeout(() => {
          router.push('/')
        }, 500)
      } else {
        setIsOnline(false)
      }
    } catch {
      setIsOnline(false)
    } finally {
      setIsChecking(false)
    }
  }

  // 온라인 상태로 복구되면 자동으로 홈으로 이동
  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => {
        router.push('/')
      }, 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isOnline, router])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
        textAlign: 'center',
        bgcolor: 'background.default',
      }}
    >
      <WifiOff size={64} className="text-neutral-400 mb-4" />
      
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        오프라인 상태입니다
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        인터넷 연결을 확인해주세요. 네트워크가 복구되면 자동으로 다시 시도합니다.
      </Typography>

      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<Home size={20} />}
          onClick={() => router.push('/')}
        >
          홈으로
        </Button>
        <Button
          variant="contained"
          startIcon={<RefreshCw size={20} className={isChecking ? 'animate-spin' : ''} />}
          onClick={checkConnection}
          disabled={isChecking}
        >
          {isChecking ? '확인 중...' : '다시 시도'}
        </Button>
      </Stack>

      {isOnline && (
        <Typography variant="body2" color="success.main" sx={{ mt: 3 }}>
          연결이 복구되었습니다. 잠시 후 이동합니다...
        </Typography>
      )}
    </Box>
  )
}
