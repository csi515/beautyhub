'use client'

import React, { createContext, useContext, useId } from 'react'
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
import {
  BottomSheet,
  BottomSheetHeader,
  BottomSheetBody,
  BottomSheetFooter,
} from '@/app/components/ui/BottomSheet'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

type ModalProps = {
  open: boolean
  onClose: () => void
  size?: ModalSize
  children: React.ReactNode
  closeOnOutsideClick?: boolean
  disableAutoFocus?: boolean
  fullScreenOnMobile?: boolean
  mobileMaxHeight?: number
}

type RenderMode = 'dialog' | 'sheet'

type AdaptiveModalContextValue = { mode: RenderMode; titleId: string }
const AdaptiveModalContext = createContext<AdaptiveModalContextValue>({ mode: 'dialog', titleId: 'modal-title' })

function useAdaptiveModalMode() {
  return useContext(AdaptiveModalContext)
}

function AdaptiveModal({
  open,
  onClose,
  size = 'lg',
  children,
  closeOnOutsideClick = true,
  disableAutoFocus = false,
  fullScreenOnMobile = true,
  mobileMaxHeight = 90,
  ...props
}: ModalProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const shouldUseSheet = isMobile && fullScreenOnMobile
  const titleId = useId()

  const getMaxWidth = (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false => {
    if (size === 'full') return false
    const sizeMap: Record<string, 'xs' | 'sm' | 'md' | 'lg' | 'xl'> = {
      sm: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'xl',
    }
    return sizeMap[size] || 'lg'
  }

  if (shouldUseSheet) {
    return (
      <AdaptiveModalContext.Provider value={{ mode: 'sheet', titleId }}>
        <BottomSheet
          open={open}
          onClose={onClose}
          swipeToClose={closeOnOutsideClick}
          maxHeight={mobileMaxHeight}
        >
          {children}
        </BottomSheet>
      </AdaptiveModalContext.Provider>
    )
  }

  return (
    <AdaptiveModalContext.Provider value={{ mode: 'dialog', titleId }}>
      <Dialog
        open={open}
        onClose={closeOnOutsideClick ? onClose : undefined}
        maxWidth={getMaxWidth()}
        fullWidth
        fullScreen={false}
        disableAutoFocus={disableAutoFocus}
        aria-labelledby={titleId}
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        {...props}
      >
        {children}
      </Dialog>
    </AdaptiveModalContext.Provider>
  )
}

type ModalHeaderProps = {
  title: string
  description?: string
  icon?: React.ReactNode
  onClose?: () => void
  children?: React.ReactNode
}

function ModalHeader({ title, description, icon, onClose, children }: ModalHeaderProps) {
  const { mode, titleId } = useAdaptiveModalMode()

  if (mode === 'sheet') {
    return (
      <BottomSheetHeader title={title} {...(description ? { description } : {})} {...(onClose ? { onClose } : {})}>
        {children}
      </BottomSheetHeader>
    )
  }

  return (
    <DialogTitle
      id={titleId}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: 3,
        pb: 2,
        flexShrink: 0,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
        {icon && (
          <Box sx={{ flexShrink: 0, mt: 0.5, display: 'flex' }}>
            {icon}
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" component="div" fontWeight="bold" color="text.primary">
              {title}
            </Typography>
            {children}
          </Stack>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
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
            mr: -0.5,
          }}
        >
          <X size={20} />
        </IconButton>
      )}
    </DialogTitle>
  )
}

type ModalBodyProps = {
  children: React.ReactNode
}

function ModalBody({ children }: ModalBodyProps) {
  const { mode } = useAdaptiveModalMode()

  if (mode === 'sheet') {
    return <BottomSheetBody>{children}</BottomSheetBody>
  }

  return (
    <DialogContent
      dividers
      sx={{
        p: 3,
        overflowY: 'auto',
        flex: '1 1 auto',
        minHeight: 0,
      }}
    >
      {children}
    </DialogContent>
  )
}

type ModalFooterProps = {
  children: React.ReactNode
}

function ModalFooter({ children }: ModalFooterProps) {
  const { mode } = useAdaptiveModalMode()

  if (mode === 'sheet') {
    return <BottomSheetFooter>{children}</BottomSheetFooter>
  }

  return (
    <DialogActions
      sx={{
        p: 2,
        gap: 1,
        flexShrink: 0,
      }}
    >
      {children}
    </DialogActions>
  )
}

export { AdaptiveModal, AdaptiveModal as Modal, ModalHeader, ModalBody, ModalFooter }
export default AdaptiveModal
