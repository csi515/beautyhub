'use client'

import { useState } from 'react'
import { Box, Button, Fab, Dialog, DialogTitle, DialogContent, Stack, TextField, Chip, Grid, Typography } from '@mui/material'
import { Search, UserPlus, Calendar, Mic, MicOff, X } from 'lucide-react'
import { useVoiceSearch } from '@/app/lib/hooks/useVoiceSearch'
import { useRouter } from 'next/navigation'

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  shortcut?: string
}

export default function QuickActions() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { isListening, transcript, startListening, stopListening, reset } = useVoiceSearch()
  const router = useRouter()

  const quickActions: QuickAction[] = [
    {
      id: 'new-appointment',
      label: '예약 추가',
      icon: <Calendar size={20} />,
      action: () => {
        // 예약 추가 모달 열기 로직
        router.push('/appointments')
      },
      shortcut: 'N',
    },
    {
      id: 'new-customer',
      label: '고객 추가',
      icon: <UserPlus size={20} />,
      action: () => {
        router.push('/customers')
      },
      shortcut: 'C',
    },
    {
      id: 'search',
      label: '검색',
      icon: <Search size={20} />,
      action: () => {
        setSearchOpen(true)
      },
      shortcut: '/',
    },
  ]

  const handleVoiceSearch = () => {
    if (isListening) {
      stopListening()
    } else {
      reset()
      startListening()
    }
  }

  // 음성 인식 결과를 검색어에 반영
  if (transcript && !isListening) {
    setSearchQuery(transcript)
    reset()
  }

  return (
    <>
      {/* 플로팅 액션 버튼 (모바일) */}
      <Box
        sx={{
          position: 'fixed',
          bottom: { 
            xs: 'calc(64px + env(safe-area-inset-bottom, 0px) + 16px)', 
            md: 80 
          },
          right: 16,
          zIndex: 1099, // 하단 네비게이션(zIndex: 1100) 바로 아래
          display: { xs: 'flex', md: 'none' },
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {quickActions.map((action) => (
          <Fab
            key={action.id}
            color="primary"
            size="medium"
            onClick={action.action}
            sx={{
              boxShadow: 3,
            }}
            aria-label={action.label}
          >
            {action.icon}
          </Fab>
        ))}
      </Box>

      {/* 빠른 검색 다이얼로그 */}
      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          빠른 검색
          <Button
            onClick={() => setSearchOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            size="small"
          >
            <X size={18} />
          </Button>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              placeholder="검색어를 입력하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={handleVoiceSearch}
                    size="small"
                    color={isListening ? 'error' : 'inherit'}
                    startIcon={isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  >
                    {isListening ? '중지' : '음성'}
                  </Button>
                ),
              }}
            />
            {isListening && (
              <Chip
                label="음성 인식 중..."
                color="primary"
                icon={<Mic size={16} />}
              />
            )}
            {transcript && (
              <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                <Typography variant="body2" color="primary.main">
                  인식된 내용: {transcript}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                빠른 검색:
              </Typography>
              <Grid container spacing={1} sx={{ mt: 1 }}>
                {['예약', '고객', '제품', '거래'].map((term) => (
                  <Grid item key={term}>
                    <Chip
                      label={term}
                      size="small"
                      onClick={() => setSearchQuery(term)}
                      variant={searchQuery === term ? 'filled' : 'outlined'}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}
