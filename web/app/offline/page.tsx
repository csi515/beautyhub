/**
 * 오프라인 페이지
 * 네트워크 연결이 없을 때 표시되는 페이지
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Container, Typography, Button, Stack, Card, CardContent } from '@mui/material'
import { WifiOff, RefreshCw, Home } from 'lucide-react'
import StandardPageLayout from '../components/common/StandardPageLayout'

export default function OfflinePage() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    // 초기 상태 확인
    setIsOnline(navigator.onLine)

    // 네트워크 상태 변경 감지
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    if (navigator.onLine) {
      router.refresh()
    } else {
      // 오프라인 상태에서도 재시도 (캐시된 페이지 로드)
      router.push('/')
    }
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <StandardPageLayout maxWidth="sm">
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WifiOff size={64} color="#9ca3af" />
          </Box>

          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              오프라인 상태입니다
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              인터넷 연결을 확인하고 다시 시도해주세요.
            </Typography>
          </Box>

          <Card sx={{ width: '100%', maxWidth: 400 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  사용 가능한 기능
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    • 캐시된 페이지 보기
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • 이전에 본 콘텐츠 확인
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • 오프라인 모드 사용
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Stack direction="row" spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Home size={20} />}
              onClick={handleGoHome}
              sx={{ minHeight: '44px' }}
            >
              홈으로
            </Button>
            <Button
              variant="contained"
              fullWidth
              startIcon={<RefreshCw size={20} />}
              onClick={handleRetry}
              disabled={!isOnline && !navigator.onLine}
              sx={{ minHeight: '44px' }}
            >
              다시 시도
            </Button>
          </Stack>

          {isOnline && (
            <Typography variant="caption" color="success.main">
              인터넷 연결이 복구되었습니다. 페이지를 새로고침합니다...
            </Typography>
          )}
        </Stack>
      </Container>
    </StandardPageLayout>
  )
}
