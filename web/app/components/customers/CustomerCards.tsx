'use client'

import { Box, List, ListItemButton, ListItemText, Typography, Stack, useTheme, useMediaQuery } from '@mui/material'
import StatusBadge from '../common/StatusBadge'
import LoadingState from '../common/LoadingState'
import EmptyState from '../ui/EmptyState'
import { useSwipe } from '@/app/lib/hooks/useSwipe'
import { useHapticFeedback } from '@/app/lib/hooks/useHapticFeedback'
import { type Customer } from '@/types/entities'

interface CustomerCardsProps {
  customers: Customer[]
  paginatedCustomers: Customer[]
  loading: boolean
  pointsByCustomer: Record<string, number>
  onCustomerClick: (customer: Customer) => void
}

export default function CustomerCards({
  customers,
  paginatedCustomers,
  loading,
  pointsByCustomer,
  onCustomerClick
}: CustomerCardsProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { light } = useHapticFeedback()

  if (loading) {
    return (
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <LoadingState variant="list" rows={3} />
      </Box>
    )
  }

  if (customers.length === 0) {
    return (
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <EmptyState
          title="등록된 고객이 없습니다"
          description="새로운 고객을 추가하여 시작하세요"
        />
      </Box>
    )
  }

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <List sx={{ p: 0 }}>
        {paginatedCustomers.map((c) => {
          const points = Number(pointsByCustomer[c.id] ?? 0).toLocaleString()
          const contactParts: string[] = []
          if (c.phone) contactParts.push(c.phone)
          if (c.email) contactParts.push(c.email)
          const secondaryText = contactParts.length > 0 
            ? `${contactParts.join(' • ')} • ${points} P`
            : `${points} P`

          const swipeHandlers = useSwipe({
            onSwipeLeft: () => {
              if (isMobile) {
                light()
                onCustomerClick(c)
              }
            },
            threshold: 50,
          })

          return (
            <ListItemButton
              key={c.id}
              {...(isMobile ? swipeHandlers : {})}
              onClick={() => onCustomerClick(c)}
              sx={{
                minHeight: 72,
                py: 2,
                px: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:active': {
                  bgcolor: 'action.selected',
                  transform: 'scale(0.98)',
                  transition: 'transform 0.1s ease-out',
                },
              }}
            >
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{
                        fontSize: '1rem',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.name}
                    </Typography>
                    <StatusBadge
                      status={c.active !== false ? 'active' : 'inactive'}
                      variant="outlined"
                    />
                  </Stack>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: '0.875rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {secondaryText}
                  </Typography>
                }
              />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )
}
