'use client'

import React, { useEffect, useState } from 'react'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { X } from 'lucide-react'
import { lockScroll, unlockScroll } from '@/app/lib/utils/scrollLock'
import { useHapticFeedback } from '@/app/lib/hooks/useHapticFeedback'

type SwipeableModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'fullscreen'

type SwipeableModalProps = {
  open: boolean
  onClose: () => void
  size?: SwipeableModalSize
  children: React.ReactNode
  closeOnOutsideClick?: boolean
  disableAutoFocus?: boolean
}

/**
 * SwipeableModal 컴포넌트
 * 모바일(sm 이하): SwipeableDrawer (anchor="bottom")
 * 데스크탑(md 이상): Dialog
 */
function SwipeableModal({
  open,
  onClose,
  size = 'lg',
  children,
  closeOnOutsideClick = true,
  disableAutoFocus = false,
  ...props
}: SwipeableModalProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [drawerOpen, setDrawerOpen] = useState(false)
  
  // 햅틱 피드백
  const { light } = useHapticFeedback()

  // size를 MUI maxWidth로 매핑
  const getMaxWidth = (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false => {
    if (size === 'full' || size === 'fullscreen') return false
    const sizeMap: Record<string, 'xs' | 'sm' | 'md' | 'lg' | 'xl'> = {
      sm: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'xl',
    }
    return sizeMap[size] || 'lg'
  }

  // Drawer 상태 동기화
  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(open)
    }
  }, [open, isMobile])

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

  // 모바일: fullscreen일 때 Dialog 사용, 그 외에는 SwipeableDrawer
  if (isMobile) {
    // fullscreen: Dialog fullScreen 사용
    if (size === 'fullscreen') {
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
            },
          }}
          TransitionProps={{
            timeout: 300,
          }}
        >
          {children}
        </Dialog>
      )
    }

    // 그 외: SwipeableDrawer 사용
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={drawerOpen}
        onClose={onClose}
        onOpen={() => {}}
        disableSwipeToOpen
        ModalProps={{
          keepMounted: false,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            maxHeight: size === 'full' ? '100%' : '90vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: 'visible',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: size === 'full' ? '100%' : '90vh',
            overflow: 'hidden',
          }}
        >
          {/* Swipe indicator */}
          <Box
            sx={{
              width: 40,
              height: 4,
              bgcolor: 'divider',
              borderRadius: 2,
              mx: 'auto',
              mt: 1.5,
              mb: 1,
            }}
          />
          {children}
        </Box>
      </SwipeableDrawer>
    )
  }

  // 데스크탑: Dialog
  return (
    <Dialog
      open={open}
      onClose={closeOnOutsideClick ? onClose : undefined}
      maxWidth={getMaxWidth()}
      fullWidth
      disableAutoFocus={disableAutoFocus}
      aria-labelledby="swipeable-modal-title"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--neutral-200)',
        },
        ...((props as any).sx || {}),
      }}
      {...props}
    >
      {children}
    </Dialog>
  )
}

type SwipeableModalHeaderProps = {
  title: string
  description?: string
  icon?: React.ReactNode
  onClose?: () => void
  children?: React.ReactNode
}

function SwipeableModalHeader({ title, description, icon, onClose, children }: SwipeableModalHeaderProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (isMobile) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          p: { xs: 2, sm: 3 },
          pb: { xs: 1.5, sm: 2 },
          flexShrink: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
          {icon && (
            <Box sx={{ flexShrink: 0, mt: 0.5, display: 'flex' }}>
              {icon}
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography 
                variant="h6" 
                component="div" 
                fontWeight="bold" 
                color="text.primary"
                id="swipeable-modal-title"
                sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
              >
                {title}
              </Typography>
              {children}
            </Stack>
            {description && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: 0.5, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Stack>
        {onClose && (
          <IconButton
            aria-label="닫기"
            onClick={onClose}
            size="small"
            sx={{
              flexShrink: 0,
              color: 'text.secondary',
              alignSelf: 'flex-start',
              mt: -0.5,
              mr: { xs: -0.5, sm: -0.5 },
              minWidth: '44px',
              minHeight: '44px',
            }}
          >
            <X size={20} />
          </IconButton>
        )}
      </Box>
    )
  }

  // 데스크탑: DialogTitle 사용
  return (
    <DialogTitle
      id="swipeable-modal-title"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: { xs: 2, sm: 3 },
        pb: { xs: 1.5, sm: 2 },
        flexShrink: 0,
      }}
    >
      <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
        {icon && (
          <Box sx={{ flexShrink: 0, mt: 0.5, display: 'flex' }}>
            {icon}
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography 
              variant="h6" 
              component="div" 
              fontWeight="bold" 
              color="text.primary"
              sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
            >
              {title}
            </Typography>
            {children}
          </Stack>
          {description && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mt: 0.5, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
            >
              {description}
            </Typography>
          )}
        </Box>
      </Stack>
      {onClose && (
        <IconButton
          aria-label="닫기"
          onClick={onClose}
          size="small"
          sx={{
            flexShrink: 0,
            color: 'text.secondary',
            alignSelf: 'flex-start',
            mt: -0.5,
            mr: { xs: -0.5, sm: -0.5 },
            minWidth: '44px',
            minHeight: '44px',
          }}
        >
          <X size={20} />
        </IconButton>
      )}
    </DialogTitle>
  )
}

type SwipeableModalBodyProps = {
  children: React.ReactNode
  sx?: any
}

function SwipeableModalBody({ children, sx }: SwipeableModalBodyProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (isMobile) {
    return (
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          flex: 1,
          // Safe area 대응
          pb: { xs: 'calc(env(safe-area-inset-bottom) + 16px)', sm: 3 },
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
          },
          ...sx,
        }}
      >
        {children}
      </Box>
    )
  }

  // 데스크탑: DialogContent 사용
  return (
    <DialogContent
      dividers
      sx={{
        p: { xs: 2, sm: 3 },
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        // Safe area 대응
        pb: { xs: 'calc(env(safe-area-inset-bottom) + 16px)', sm: 3 },
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        },
        ...sx,
      }}
    >
      {children}
    </DialogContent>
  )
}

type SwipeableModalFooterProps = {
  children: React.ReactNode
  sx?: any
}

function SwipeableModalFooter({ children, sx }: SwipeableModalFooterProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (isMobile) {
    return (
      <Box
        sx={{
          p: { xs: 2, sm: 2 },
          gap: { xs: 1, sm: 1 },
          flexShrink: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          // Safe area 대응
          pb: { xs: 'calc(env(safe-area-inset-bottom) + 8px)', sm: 2 },
          ...sx,
        }}
      >
        {children}
      </Box>
    )
  }

  // 데스크탑: DialogActions 사용
  return (
    <DialogActions
      sx={{
        p: { xs: 2, sm: 2 },
        gap: { xs: 1, sm: 1 },
        flexShrink: 0,
        // Safe area 대응
        pb: { xs: 'calc(env(safe-area-inset-bottom) + 8px)', sm: 2 },
        ...sx,
      }}
    >
      {children}
    </DialogActions>
  )
}

export { SwipeableModal, SwipeableModalHeader, SwipeableModalBody, SwipeableModalFooter }
export default SwipeableModal
