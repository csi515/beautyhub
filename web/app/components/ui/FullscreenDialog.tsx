/**
 * Fullscreen Dialog 컴포넌트
 * 모바일에서 전체 화면 Dialog로 표시, 데스크탑에서는 일반 Modal
 */

'use client'

import React, { useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { ArrowLeft, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { lockScroll, unlockScroll } from '@/app/lib/utils/scrollLock'
import { useHapticFeedback } from '@/app/lib/hooks/useHapticFeedback'
import { usePWA } from '@/app/lib/hooks/usePWA'

type FullscreenDialogProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
  actions?: React.ReactNode
  showBack?: boolean
  onBack?: () => void
  closeOnOutsideClick?: boolean
  disableAutoFocus?: boolean
}

/**
 * Fullscreen Dialog
 * 모바일(sm 이하): fullScreen Dialog + AppBar 헤더
 * 데스크탑(md 이상): 일반 Dialog
 */
export default function FullscreenDialog({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  actions,
  showBack = true,
  onBack,
  closeOnOutsideClick = true,
  disableAutoFocus = false,
}: FullscreenDialogProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const router = useRouter()
  const { isStandalone, isIOS } = usePWA()
  const { light } = useHapticFeedback()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
    onClose()
  }

  // 스크롤 잠금
  useEffect(() => {
    if (open) {
      lockScroll()
      if (isMobile) {
        light() // 모바일에서만 햅틱 피드백
      }
    } else {
      unlockScroll()
    }
    return () => {
      unlockScroll()
    }
  }, [open, isMobile, light])

  // 모바일: Fullscreen Dialog
  if (isMobile) {
    return (
      <Dialog
        open={open}
        onClose={closeOnOutsideClick ? onClose : undefined}
        fullScreen
        disableAutoFocus={disableAutoFocus}
        sx={{
          '& .MuiDialog-paper': {
            m: 0,
            borderRadius: 0,
            maxHeight: '100vh',
            // PWA standalone 모드: safe-area-inset 고려
            ...(isStandalone && isIOS && {
              paddingTop: 'env(safe-area-inset-top)',
            }),
          },
        }}
        TransitionProps={{
          // 화면 전환 애니메이션
          timeout: 300,
        }}
      >
        {/* AppBar 헤더 */}
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            // PWA standalone 모드: safe-area-inset 고려
            ...(isStandalone && isIOS && {
              paddingTop: 'env(safe-area-inset-top)',
            }),
          }}
        >
          <Toolbar
            sx={{
              minHeight: { xs: '56px', sm: '64px' },
              px: { xs: 1.5, sm: 2 },
              gap: 1,
            }}
          >
            {/* 뒤로가기 버튼 */}
            {showBack && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="뒤로가기"
                onClick={handleBack}
                sx={{
                  minWidth: '44px',
                  minHeight: '44px',
                  mr: 0.5,
                }}
              >
                <ArrowLeft size={20} />
              </IconButton>
            )}

            {/* 아이콘 */}
            {icon && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mr: 1,
                  color: 'primary.main',
                }}
              >
                {icon}
              </Box>
            )}

            {/* 제목 */}
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontSize: { xs: '1rem', sm: '1.125rem' },
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Typography>

            {/* 닫기 버튼 */}
            <IconButton
              edge="end"
              color="inherit"
              aria-label="닫기"
              onClick={onClose}
              sx={{
                minWidth: '44px',
                minHeight: '44px',
              }}
            >
              <X size={20} />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* 설명 */}
        {description && (
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 1,
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.default',
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {description}
            </Typography>
          </Box>
        )}

        {/* 콘텐츠 */}
        <DialogContent
          sx={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            p: { xs: 2, sm: 3 },
            // Safe area 대응
            pb: { xs: 'calc(env(safe-area-inset-bottom) + 16px)', sm: 3 },
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
            },
          }}
        >
          {children}
        </DialogContent>

        {/* 액션 버튼 */}
        {actions && (
          <DialogActions
            sx={{
              p: { xs: 2, sm: 2 },
              gap: { xs: 1, sm: 1 },
              flexShrink: 0,
              borderTop: `1px solid ${theme.palette.divider}`,
              // Safe area 대응
              pb: { xs: 'calc(env(safe-area-inset-bottom) + 8px)', sm: 2 },
            }}
          >
            {actions}
          </DialogActions>
        )}
      </Dialog>
    )
  }

  // 데스크탑: 일반 Dialog
  return (
    <Dialog
      open={open}
      onClose={closeOnOutsideClick ? onClose : undefined}
      maxWidth="md"
      fullWidth
      disableAutoFocus={disableAutoFocus}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--neutral-200)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          p: { xs: 2, sm: 3 },
          pb: { xs: 1.5, sm: 2 },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          {icon && (
            <Box sx={{ flexShrink: 0, color: 'primary.main' }}>
              {icon}
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="div" fontWeight="bold" sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                {description}
              </Typography>
            )}
          </Box>
        </Stack>
        <IconButton
          aria-label="닫기"
          onClick={onClose}
          sx={{
            flexShrink: 0,
            minWidth: '44px',
            minHeight: '44px',
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: { xs: 2, sm: 3 },
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions sx={{ p: { xs: 2, sm: 2 }, gap: { xs: 1, sm: 1 } }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  )
}
