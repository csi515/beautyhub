'use client'

import { useState, useMemo } from 'react'
import { Card, Typography, Box, TextField, Chip, Stack, useTheme, useMediaQuery } from '@mui/material'
import { History, ChevronDown, ChevronUp } from 'lucide-react'
import Button from '@/app/components/ui/Button'
import { DataTable } from '@/app/components/ui/DataTable'

interface PointLedgerEntry {
  created_at: string
  delta: number
  reason?: string | null
}

interface ProductLedgerEntry {
  created_at: string
  delta: number
  reason?: string | null | undefined
  product_id: string
  notes?: string | null
  id: string
}

type LedgerEntry = (PointLedgerEntry & { type: 'points' }) | (ProductLedgerEntry & { type: 'products' })

interface Product {
  id: string
  name: string
}

interface LedgerHistorySectionProps {
  pointsLedger: PointLedgerEntry[]
  productLedger: ProductLedgerEntry[]
  products: Product[]
  onUpdateLedgerNote?: (ledgerId: string, notes: string) => void | Promise<void>
}

export default function LedgerHistorySection({
  pointsLedger,
  productLedger,
  products,
  onUpdateLedgerNote,
}: LedgerHistorySectionProps) {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)
  const [historyFilter, setHistoryFilter] = useState<'all' | 'points' | 'products'>('all')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // 통합 변동 내역
  const combinedLedger: LedgerEntry[] = useMemo(() => {
    return [
      ...pointsLedger.map(entry => ({ ...entry, type: 'points' as const })),
      ...productLedger.map(entry => ({ ...entry, type: 'products' as const }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [pointsLedger, productLedger])

  const filteredLedger = useMemo(() => {
    if (historyFilter === 'all') return combinedLedger
    return combinedLedger.filter(entry => entry.type === historyFilter)
  }, [combinedLedger, historyFilter])

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box
        component="button"
        onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
        sx={{
          w: '100%',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          '&:hover': { bgcolor: 'action.hover' },
          transition: 'background-color 200ms'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History size={20} className="text-primary-main" />
          <Typography variant="subtitle1" fontWeight={700}>변동 내역</Typography>
        </Box>
        {isHistoryExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </Box>

      {isHistoryExpanded && (
        <Box sx={{ px: 3, pb: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
            {(['all', 'points', 'products'] as const).map((filter) => (
              <Button
                key={filter}
                variant={historyFilter === filter ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setHistoryFilter(filter)}
                className="flex-1"
              >
                {filter === 'all' ? '전체' : filter === 'points' ? '포인트' : '상세상품'}
              </Button>
            ))}
          </Box>

          {isMobile ? (
            filteredLedger.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                내역이 없습니다.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {filteredLedger.map((row, i) => {
                  const dateStr = row.created_at
                    ? new Date(row.created_at).toLocaleString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'
                  const detail =
                    row.type === 'products' && row.product_id
                      ? products.find((p) => p.id === row.product_id)?.name || '-'
                      : '-'
                  return (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        py: 1.5,
                        px: 2,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {dateStr}
                        </Typography>
                        <Chip
                          label={row.type === 'points' ? '포인트' : '상품'}
                          size="small"
                          color={row.type === 'points' ? 'info' : 'success'}
                          variant="filled"
                          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                        />
                      </Box>
                      {detail !== '-' && (
                        <Typography variant="body2" noWrap>
                          {detail}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                          {row.reason || '-'}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color={(row.delta || 0) > 0 ? 'primary.main' : 'error.main'}
                        >
                          {(row.delta || 0) > 0 ? '+' : ''}
                          {(row.delta || 0).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  )
                })}
              </Stack>
            )
          ) : (
          <DataTable
            columns={[
              {
                key: 'created_at',
                header: '일시',
                width: 150,
                render: (r) => {
                  const row = r as LedgerEntry
                  return row.created_at ? new Date(row.created_at).toLocaleString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '-'
                }
              },
              {
                key: 'type',
                header: '유형',
                width: 100,
                render: (r) => {
                  const row = r as LedgerEntry
                  return (
                    <Chip
                      label={row.type === 'points' ? '포인트' : '상품'}
                      size="small"
                      color={row.type === 'points' ? 'info' : 'success'}
                      variant="filled"
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  )
                }
              },
              {
                key: 'product_id',
                header: '상품/상세',
                render: (r) => {
                  const row = r as LedgerEntry
                  if (row.type === 'products' && row.product_id) {
                    return products.find(p => p.id === row.product_id)?.name || '-'
                  }
                  return '-'
                }
              },
              {
                key: 'delta',
                header: '변동',
                align: 'right',
                width: 100,
                render: (r) => {
                  const row = r as LedgerEntry
                  return (
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={(row.delta || 0) > 0 ? 'primary.main' : 'error.main'}
                    >
                      {(row.delta || 0) > 0 ? '+' : ''}{(row.delta || 0).toLocaleString()}
                    </Typography>
                  )
                }
              },
              {
                key: 'reason',
                header: '사유',
                render: (r) => {
                  const row = r as LedgerEntry
                  return (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 150 }} noWrap>
                      {row.reason || '-'}
                    </Typography>
                  )
                }
              },
              {
                key: 'notes',
                header: '메모',
                render: (r) => {
                  const row = r as LedgerEntry
                  if (row.type === 'products') {
                    return (
                      <TextField
                        size="small"
                        variant="standard"
                        placeholder="메모 입력"
                        defaultValue={row.notes || ''}
                        onBlur={(e) => {
                          const newVal = e.target.value;
                          if (newVal !== (row.notes || '')) {
                            onUpdateLedgerNote?.(row.id, newVal);
                          }
                        }}
                        sx={{ '& .MuiInput-root': { fontSize: '0.8125rem' } }}
                      />
                    )
                  }
                  return null
                }
              }
            ]}
            data={filteredLedger as unknown as Record<string, any>[]}
            emptyMessage="내역이 없습니다."
          />
          )}
        </Box>
      )}
    </Card>
  )
}
