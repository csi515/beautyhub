'use client'

import { X } from 'lucide-react'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  maxHeight?: number
  swipeToClose?: boolean
  ariaLabelledBy?: string
}

type BottomSheetHeaderProps = {
  title: string
  description?: string
  onClose?: () => void
  children?: React.ReactNode
}

type BottomSheetBodyProps = {
  children: React.ReactNode
}

type BottomSheetFooterProps = {
  children: React.ReactNode
}

export function BottomSheet({
  open,
  onClose,
  children,
  maxHeight = 90,
  swipeToClose = true,
  ariaLabelledBy = 'bottom-sheet-title',
}: BottomSheetProps) {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      disableDiscovery={!swipeToClose}
      ModalProps={{
        keepMounted: true,
      }}
      PaperProps={{
        sx: {
          width: '100%',
          maxHeight: `${maxHeight}vh`,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          pb: 'env(safe-area-inset-bottom)',
        },
      }}
      aria-labelledby={ariaLabelledBy}
    >
      <Box sx={{ pt: 1.25, pb: 0.5, display: 'flex', justifyContent: 'center' }} aria-hidden="true">
        <Box sx={{ width: 48, height: 6, borderRadius: 999, bgcolor: 'divider' }} />
      </Box>
      {children}
    </SwipeableDrawer>
  )
}

export function BottomSheetHeader({ title, description, onClose, children }: BottomSheetHeaderProps) {
  return (
    <Box sx={{ px: 2, pt: 0.5, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography id="bottom-sheet-title" variant="subtitle1" fontWeight={700} color="text.primary">
              {title}
            </Typography>
            {children}
          </Stack>
          {description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
        {onClose ? (
          <IconButton
            aria-label="닫기"
            onClick={onClose}
            size="small"
            sx={{
              mt: -0.25,
              mr: -0.25,
              minWidth: 44,
              minHeight: 44,
            }}
          >
            <X size={20} />
          </IconButton>
        ) : null}
      </Stack>
    </Box>
  )
}

export function BottomSheetBody({ children }: BottomSheetBodyProps) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        overflowY: 'auto',
        flex: 1,
        overscrollBehavior: 'contain',
      }}
    >
      {children}
    </Box>
  )
}

export function BottomSheetFooter({ children }: BottomSheetFooterProps) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.25,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {children}
    </Box>
  )
}

