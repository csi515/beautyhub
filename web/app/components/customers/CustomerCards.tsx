'use client'

import { Pencil, Phone, Mail, Package } from 'lucide-react'
import { Box, Card, CardContent, Typography, Stack, IconButton, Divider } from '@mui/material'
import CustomerHoldingsBadge from '../CustomerHoldingsBadge'
import StatusBadge from '../common/StatusBadge'
import LoadingState from '../common/LoadingState'
import EmptyState from '../ui/EmptyState'
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
  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <Stack spacing={{ xs: 1.5, sm: 2 }}>
        {loading && <LoadingState variant="list" rows={3} />}
        {!loading && paginatedCustomers.map((c) => (
          <Card 
            key={c.id} 
            sx={{ 
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:active': {
                transform: 'scale(0.98)',
                boxShadow: 2,
              },
              '&:hover': {
                boxShadow: 4,
              }
            }} 
            variant="outlined"
            onClick={() => onCustomerClick(c)}
          >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: { xs: 2, sm: 2.5 } }}>
              {/* 헤더: 이름, 상태, 편집 버튼 */}
              <Stack 
                direction="row" 
                alignItems="center" 
                justifyContent="space-between" 
                mb={1.5}
                sx={{ minHeight: '44px' }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="h6" 
                    fontWeight={600}
                    sx={{ 
                      fontSize: { xs: '1.125rem', sm: '1.25rem' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {c.name}
                  </Typography>
                  <StatusBadge
                    status={c.active !== false ? 'active' : 'inactive'}
                    variant="outlined"
                  />
                </Stack>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCustomerClick(c)
                  }}
                  aria-label="고객 수정"
                  sx={{ 
                    minWidth: '44px', 
                    minHeight: '44px',
                    ml: 1,
                    flexShrink: 0
                  }}
                >
                  <Pencil className="h-5 w-5" />
                </IconButton>
              </Stack>

              {/* 연락처 정보 */}
              <Stack spacing={1.5} mb={1.5}>
                {c.phone && (
                  <Stack 
                    direction="row" 
                    alignItems="center" 
                    spacing={1.5} 
                    sx={{ 
                      color: 'text.secondary',
                      minHeight: '32px'
                    }}
                  >
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: { xs: '0.9375rem', sm: '1rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (c.phone) window.location.href = `tel:${c.phone}`
                      }}
                    >
                      {c.phone}
                    </Typography>
                  </Stack>
                )}
                {c.email && (
                  <Stack 
                    direction="row" 
                    alignItems="center" 
                    spacing={1.5} 
                    sx={{ 
                      color: 'text.secondary',
                      minHeight: '32px'
                    }}
                  >
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: { xs: '0.9375rem', sm: '1rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (c.email) window.location.href = `mailto:${c.email}`
                      }}
                    >
                      {c.email}
                    </Typography>
                  </Stack>
                )}
              </Stack>

              <Divider sx={{ my: { xs: 1, sm: 1.5 } }} />

              {/* 하단: 보유상품 및 포인트 */}
              <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center"
                sx={{ minHeight: '44px' }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                  <Package className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                  <Box sx={{ minWidth: 0 }}>
                    <CustomerHoldingsBadge customerId={c.id} />
                  </Box>
                </Stack>
                <Typography 
                  fontWeight={700} 
                  color="warning.main"
                  sx={{ 
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                    flexShrink: 0,
                    ml: 2
                  }}
                >
                  {Number(pointsByCustomer[c.id] ?? 0).toLocaleString()} P
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
        {!loading && customers.length === 0 && (
          <EmptyState
            title="등록된 고객이 없습니다"
            description="새로운 고객을 추가하여 시작하세요"
          />
        )}
      </Stack>
    </Box>
  )
}
