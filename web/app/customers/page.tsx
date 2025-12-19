'use client'

import { Pencil, Plus, Search, Phone, Mail, Package } from 'lucide-react'
import { useEffect, useState, useMemo, lazy, Suspense, useCallback } from 'react'
import EmptyState from '../components/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import CustomerHoldingsBadge from '../components/CustomerHoldingsBadge'
import Button from '../components/ui/Button'
import type { Customer } from '@/types/entities'
import { useSearch } from '../lib/hooks/useSearch'
import { usePagination } from '../lib/hooks/usePagination'
import { useSort } from '../lib/hooks/useSort'

// MUI Imports
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableSortLabel from '@mui/material/TableSortLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Pagination from '@mui/material/Pagination'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Fab from '@mui/material/Fab'

const CustomerDetailModal = lazy(() => import('../components/modals/CustomerDetailModal'))

export default function CustomersPage() {
  const [rows, setRows] = useState<Customer[]>([])
  const { query, debouncedQuery, setQuery } = useSearch({ debounceMs: 300 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Customer | null>(null)

  const { sortKey, sortDirection, toggleSort, sortFn } = useSort<Customer & Record<string, unknown>>({
    initialKey: 'name',
    initialDirection: 'asc',
  })

  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 10,
    totalItems: rows.length,
  })
  const { page, pageSize, setPage, setPageSize } = pagination
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const [pointsByCustomer, setPointsByCustomer] = useState<Record<string, number>>({})

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('')
      const { customersApi } = await import('@/app/lib/api/customers')
      const data = await customersApi.list(debouncedQuery ? { search: debouncedQuery } : {})
      setRows(Array.isArray(data) ? data : [])
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '에러가 발생했습니다.'
      setError(errorMessage)
    } finally { setLoading(false) }
  }, [debouncedQuery])

  useEffect(() => { load() }, [load])

  // 정렬된 데이터
  const sortedRows = useMemo(() => {
    return sortFn(rows as (Customer & Record<string, unknown>)[])
  }, [rows, sortFn])

  // 페이지네이션된 데이터
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return sortedRows.slice(start, end)
  }, [sortedRows, page, pageSize])

  // 포인트 조회 최적화
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const { pointsApi } = await import('@/app/lib/api/points')
        const pairs = await Promise.all(paginatedRows.map(async (c) => {
          try {
            const data = await pointsApi.getBalance(c.id, { withLedger: false })
            const balance = Number(data?.balance || 0)
            return [c.id, balance] as [string, number]
          } catch {
            return [c.id, 0] as [string, number]
          }
        }))
        setPointsByCustomer(prev => ({ ...prev, ...Object.fromEntries(pairs) }))
      } catch { }
    }
    if (paginatedRows.length) fetchPoints()
  }, [paginatedRows])

  return (
    <Stack spacing={3}>
      {/* 헤더 및 검색 */}
      <Paper sx={{ p: 2, borderRadius: 3 }} elevation={0} variant="outlined">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <TextField
            placeholder="이름, 이메일 또는 전화번호로 검색"
            value={query}
            onChange={e => setQuery(e.target.value)}
            size="small"
            fullWidth
            sx={{
              maxWidth: { sm: 400 },
              '& .MuiOutlinedInput-root': {
                fontSize: { xs: '16px', md: '14px' },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="h-4 w-4 text-neutral-400" />
                  </InputAdornment>
                ),
              },
            }}
            inputProps={{
              autoComplete: 'off',
              autoCorrect: 'off',
              autoCapitalize: 'off',
            }}
          />
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setSelected({ id: '', owner_id: '', name: '', phone: '', email: '', address: '' } as Customer)
              setDetailOpen(true)
            }}
            fullWidth={false}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            새 고객
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
          <AlertTitle>오류 발생</AlertTitle>
          {error}
        </Alert>
      )}

      {/* 모바일 카드 뷰 (md 미만) */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Stack spacing={2}>
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
          {!loading && paginatedRows.map((c) => (
            <Card key={c.id} sx={{ borderRadius: 3 }} variant="outlined">
              <CardContent sx={{ pb: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="h6" fontWeight="bold">{c.name}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => { setSelected(c); setDetailOpen(true) }}
                    aria-label="고객 수정"
                    sx={{ minWidth: { xs: 44, md: 'auto' }, minHeight: { xs: 44, md: 'auto' } }}
                  >
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                </Stack>
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
                    <Phone className="h-4 w-4" />
                    <Typography variant="body2">{c.phone || '-'}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
                    <Mail className="h-4 w-4" />
                    <Typography variant="body2" noWrap>{c.email || '-'}</Typography>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Package className="h-4 w-4 text-neutral-400" />
                      <CustomerHoldingsBadge customerId={c.id} />
                    </Stack>
                    <Typography fontWeight="bold" color="warning.main">
                      {Number(pointsByCustomer[c.id] ?? 0).toLocaleString()} P
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>

      {/* 데스크톱 테이블 뷰 (md 이상) */}
      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 3, display: { xs: 'none', md: 'block' } }}>
        <Table>
          <TableHead sx={{ bgcolor: 'neutral.50' }}>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortKey === 'name'}
                  direction={sortKey === 'name' ? sortDirection : 'asc'}
                  onClick={() => toggleSort('name')}
                >
                  이름
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortKey === 'phone'}
                  direction={sortKey === 'phone' ? sortDirection : 'asc'}
                  onClick={() => toggleSort('phone')}
                >
                  연락처
                </TableSortLabel>
              </TableCell>
              <TableCell>이메일</TableCell>
              <TableCell>보유상품</TableCell>
              <TableCell align="right">포인트</TableCell>
              <TableCell align="center">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={6}><Skeleton className="h-10" /></TableCell>
              </TableRow>
            ))}
            {!loading && paginatedRows.map((c) => (
              <TableRow
                key={c.id}
                hover
                onClick={() => { setSelected(c); setDetailOpen(true) }}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell title={c.name} sx={{ fontWeight: 500 }}>{c.name}</TableCell>
                <TableCell>{c.phone || '-'}</TableCell>
                <TableCell>{c.email || '-'}</TableCell>
                <TableCell><CustomerHoldingsBadge customerId={c.id} /></TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {Number(pointsByCustomer[c.id] ?? 0).toLocaleString()}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); setSelected(c); setDetailOpen(true) }}
                    aria-label="고객 수정"
                    sx={{ minWidth: { xs: 44, md: 'auto' }, minHeight: { xs: 44, md: 'auto' } }}
                  >
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <EmptyState
                    title="고객 데이터가 없습니다."
                    actionLabel="새 고객"
                    actionOnClick={() => {
                      setSelected({ id: '', owner_id: '', name: '', phone: '', email: '', address: '' } as Customer)
                      setDetailOpen(true)
                    }}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 페이지네이션 (공통) */}
      {!loading && rows.length > 0 && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            총 {rows.length}명 · {page} / {totalPages} 페이지
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small">
              <Select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                sx={{ minWidth: 100, bgcolor: 'background.paper' }}
              >
                <MenuItem value={10}>10개씩</MenuItem>
                <MenuItem value={20}>20개씩</MenuItem>
                <MenuItem value={50}>50개씩</MenuItem>
              </Select>
            </FormControl>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
              shape="rounded"
              size="medium"
              siblingCount={1}
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPagination-ul': {
                  flexWrap: 'nowrap',
                },
              }}
            />
          </Stack>
        </Stack>
      )}

      {detailOpen && (
        <Suspense fallback={null}>
          <CustomerDetailModal
            open={detailOpen}
            item={selected}
            onClose={() => setDetailOpen(false)}
            onSaved={load}
            onDeleted={load}
          />
        </Suspense>
      )}

      {/* Mobile FAB */}
      <Fab
        color="primary"
        aria-label="새 고객 추가"
        sx={{
          position: 'fixed',
          bottom: { xs: 72, md: 16 },
          right: 16,
          display: { xs: 'flex', md: 'none' },
        }}
        onClick={() => {
          setSelected({ id: '', owner_id: '', name: '', phone: '', email: '', address: '' } as Customer)
          setDetailOpen(true)
        }}
      >
        <Plus className="h-5 w-5" />
      </Fab>
    </Stack>
  )
}
