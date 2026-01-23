/**
 * 필터 전용 Bottom Sheet 컴포넌트
 * 모바일에서 필터를 Bottom Sheet로 표시
 */

'use client'

import { ReactNode } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { X, Filter } from 'lucide-react'
import { usePWA } from '@/app/lib/hooks/usePWA'

interface FilterBottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  activeFilterCount?: number
  onReset?: () => void
}

/**
 * 필터 전용 Bottom Sheet
 * 모바일(sm 이하)에서만 Bottom Sheet로 표시, 데스크탑에서는 children을 그대로 렌더링
 */
export default function FilterBottomSheet({
  open,
  onClose,
  title = '필터',
  description,
  children,
  activeFilterCount = 0,
  onReset,
}: FilterBottomSheetProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { isStandalone } = usePWA()

  // 데스크탑에서는 children을 그대로 렌더링
  if (!isMobile) {
    return <>{children}</>
  }

  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        onOpen={() => {}}
        disableSwipeToOpen
        ModalProps={{
          keepMounted: false,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            maxHeight: '90vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: 'visible',
            // PWA standalone 모드: safe-area-inset 고려
            ...(isStandalone && {
              paddingBottom: 'env(safe-area-inset-bottom)',
            }),
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: '90vh',
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

          {/* 헤더 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              px: 2,
              py: 1.5,
              pb: 1,
              flexShrink: 0,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
              <Filter size={20} color={theme.palette.text.secondary} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {title}
                </Typography>
                {description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, fontSize: '0.875rem' }}
                  >
                    {description}
                  </Typography>
                )}
              </Box>
              {activeFilterCount > 0 && (
                <Box
                  sx={{
                    minWidth: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {activeFilterCount}
                </Box>
              )}
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
          </Box>

          {/* 필터 콘텐츠 */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              px: 2,
              py: 2,
              // Safe area 대응
              pb: { xs: 'calc(env(safe-area-inset-bottom) + 16px)', sm: 2 },
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
              },
            }}
          >
            <Stack spacing={{ xs: 1.5, sm: 2 }}>
              {children}
              {activeFilterCount > 0 && onReset && (
                <Box
                  sx={{
                    pt: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <IconButton
                    onClick={onReset}
                    sx={{
                      width: '100%',
                      minHeight: '44px',
                      justifyContent: 'flex-start',
                      color: 'text.secondary',
                    }}
                  >
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      필터 초기화
                    </Typography>
                  </IconButton>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>
      </SwipeableDrawer>
    </>
  )
}
