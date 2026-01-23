'use client'

/**
 * 모달 변형 훅
 * 모바일/데스크탑에 맞는 모달 컴포넌트 결정
 * 스크롤 잠금, 햅틱 피드백 자동 처리
 */

import { useEffect, useMemo } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'
import { lockScroll, unlockScroll } from '../utils/scrollLock'
import { useHapticFeedback } from './useHapticFeedback'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'fullscreen'

export interface UseModalVariantOptions {
  open: boolean
  size?: ModalSize
  closeOnOutsideClick?: boolean
  disableAutoFocus?: boolean
  onClose: () => void
}

export interface UseModalVariantReturn {
  variant: 'dialog' | 'drawer' | 'fullscreen'
  isMobile: boolean
  drawerProps: {
    anchor: 'bottom'
    open: boolean
    onClose: () => void
    onOpen: () => void
    disableSwipeToOpen: boolean
    ModalProps: {
      keepMounted: boolean
    }
    sx: {
      '& .MuiDrawer-paper': {
        maxHeight: string
        borderTopLeftRadius: number
        borderTopRightRadius: number
        overflow: string
      }
    }
  }
  dialogProps: {
    open: boolean
    onClose?: () => void
    maxWidth: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
    fullWidth: boolean
    fullScreen?: boolean
    disableAutoFocus: boolean
    sx: any
  }
}

/**
 * 모달 변형 훅
 * 모바일/데스크탑에 맞는 모달 컴포넌트 결정
 * 
 * UX 규칙:
 * - 모바일 + fullscreen: Dialog fullScreen
 * - 모바일 + 그 외: SwipeableDrawer (bottom)
 * - 데스크탑: Dialog
 * - 스크롤 잠금, 햅틱 피드백 자동 처리
 * 
 * @example
 * const modal = useModalVariant({ size, open, onClose })
 * if (modal.variant === 'fullscreen') {
 *   return <Dialog {...modal.dialogProps}>...</Dialog>
 * }
 */
export function useModalVariant(
  options: UseModalVariantOptions
): UseModalVariantReturn {
  const { open, size = 'lg', closeOnOutsideClick = true, disableAutoFocus = false, onClose } = options

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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

  // 모달 변형 결정
  const variant = useMemo(() => {
    if (isMobile && size === 'fullscreen') {
      return 'fullscreen'
    }
    if (isMobile) {
      return 'drawer'
    }
    return 'dialog'
  }, [isMobile, size])

  // 스크롤 잠금 처리
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

  const drawerProps = useMemo(
    () => ({
      anchor: 'bottom' as const,
      open,
      onClose,
      onOpen: () => {},
      disableSwipeToOpen: true,
      ModalProps: {
        keepMounted: false,
      },
      sx: {
        '& .MuiDrawer-paper': {
          maxHeight: size === 'full' ? '100%' : '90vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          overflow: 'visible',
        },
      },
    }),
    [open, onClose, size]
  )

  const dialogProps = useMemo(
    () => ({
      open,
      onClose: closeOnOutsideClick ? onClose : undefined,
      maxWidth: getMaxWidth(),
      fullWidth: true,
      fullScreen: variant === 'fullscreen',
      disableAutoFocus,
      sx:
        variant === 'fullscreen'
          ? {
              '& .MuiDialog-paper': {
                m: 0,
                borderRadius: 0,
                maxHeight: '100vh',
              },
            }
          : {
              '& .MuiDialog-paper': {
                borderRadius: 'var(--radius-2xl)',
                boxShadow: 'var(--shadow-modal)',
                border: '1px solid var(--neutral-200)',
              },
            },
    }),
    [open, onClose, closeOnOutsideClick, disableAutoFocus, variant]
  )

  return {
    variant,
    isMobile,
    drawerProps,
    dialogProps,
  }
}
