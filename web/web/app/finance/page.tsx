'use client'

import { useEffect, useMemo, useState, useCallback, lazy, Suspense } from 'react'
import { Pencil, Plus, Download, FileText } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { useAppToast } from '../lib/ui/toast'
import Button from '../components/ui/Button'
import { usePagination } from '../lib/hooks/usePagination'
import { exportFinanceToExcel, type FinanceExportData } from '../lib/utils/excelExport'
import { generateTaxReport } from '../lib/utils/taxReport'

// MUI Imports
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableSortLabel from '@mui/material/TableSortLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Pagination from '@mui/material/Pagination'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Fab from '@mui/material/Fab'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

import type { Expense, Transaction, TransactionCreateInput, ExpenseCreateInput } from '@/types/entities'

const ExpenseDetailModal = lazy(() => import('../components/modals/ExpenseDetailModal'))
const TransactionDetailModal = lazy(() => import('../components/modals/TransactionDetailModal'))

function isoMonthRange(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) }
}

export default function FinancePage() {
  const [{ from, to }, setRange] = useState(() => isoMonthRange())
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sortKey, setSortKey] = useState<'date' | 'amount'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 10,
    totalItems: 0,
  })
  const { page, pageSize, setPage } = pagination
  const [filterType, setFilterType] = useState<('income' | 'expense')[]>(['income', 'expense'])

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('')
      const { expensesApi } = await import('@/app/lib/api/expenses')
      const { transactionsApi } = await import('@/app/lib/api/transactions')
      const [ex, tr] = await Promise.all([
        expensesApi.list({ from, to }),
        transactionsApi.list({ limit: 500 }),
      ])
      setExpenses(Array.isArray(ex) ? ex : [])
      setTransactions(Array.isArray(tr) ? tr : [])
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '에러가 발생했습니다.'
      setError(errorMessage)
    } finally { setLoading(false) }
  }, [from, to])

  useEffect(() => { load() }, [load])

  const [incomeCategories, setIncomeCategories] = useState<string[]>([])
  const [expenseCategories, setExpenseCategories] = useState<string[]>([])

  // 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { settingsApi } = await import('@/app/lib/api/settings')
        const data = await settingsApi.get()
        if (data?.financialSettings?.incomeCategories) {
          setIncomeCategories(data.financialSettings.incomeCategories)
        }
        if (data?.financialSettings?.expenseCategories) {
          setExpenseCategories(data.financialSettings.expenseCategories)
        }
      } catch { }
    }
    loadSettings()
  }, [])

  const sumIncome = useMemo(() => transactions
    .filter(t => {
      const d = (t.transaction_date || t.created_at || '').slice(0, 10)
      return (!from || d >= from) && (!to || d <= to)
    })
    .reduce((s, t) => s + Number(t.amount || 0), 0), [transactions, from, to])

  const sumExpense = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount || 0), 0), [expenses])
  const profit = sumIncome - sumExpense

  const [newOpen, setNewOpen] = useState(false)
  const [newType, setNewType] = useState<'income' | 'expense'>('income')
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [newAmount, setNewAmount] = useState<string>('')
  const [newMemo, setNewMemo] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  const [expenseDetail, setExpenseDetail] = useState<Expense | null>(null)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [txDetail, setTxDetail] = useState<Transaction | null>(null)
  const [txOpen, setTxOpen] = useState(false)
  const toast = useAppToast()

  const combined = useMemo(() => {
    const inRange = (iso: string) => {
      const d = (iso || '').slice(0, 10)
      return (!from || d >= from) && (!to || d <= to)
    }
    const incomeRows = filterType.includes('income') ? transactions
      .filter(t => inRange(t.transaction_date || t.created_at || ''))
      .map(t => ({
        id: t.id,
        type: 'income' as const,
        date: (t.transaction_date || t.created_at || '').slice(0, 10),
        amount: Number(t.amount || 0),
        note: t.category || '',
        raw: t,
      })) : []
    const expenseRows = filterType.includes('expense') ? expenses
      .filter(e => inRange(e.expense_date || ''))
      .map(e => ({
        id: e.id,
        type: 'expense' as const,
        date: (e.expense_date || '').slice(0, 10),
        amount: Number(e.amount || 0),
        note: e.category || e.memo || '',
        raw: e,
      })) : []
    const rows = [...incomeRows, ...expenseRows]
    rows.sort((a, b) => {
      if (sortKey === 'date') {
        const dateA = a.date || ''
        const dateB = b.date || ''
        return sortDir === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA)
      }
      if (a.amount < b.amount) return sortDir === 'asc' ? -1 : 1
      if (a.amount > b.amount) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return rows
  }, [transactions, expenses, filterType, from, to, sortKey, sortDir])

  const pagedCombined = useMemo(() => {
    const start = (page - 1) * pageSize
    return combined.slice(start, start + pageSize)
  }, [combined, page, pageSize])

  const handleExportExcel = async () => {
    try {
      toast.info('엑셀 파일을 생성하는 중입니다...')
      const exportData: FinanceExportData[] = combined.map((row) => {
        const baseData = {
          date: row.date,
          type: row.type === 'income' ? '수입' as const : '지출' as const,
          amount: row.amount,
        }
        if (row.type === 'expense') {
          return {
            ...baseData,
            category: (row.raw as Expense).category,
            ...(row.note && { memo: row.note }),
          }
        } else {
          return {
            ...baseData,
            ...(row.note && { memo: row.note }),
          }
        }
      })
      const summary = {
        totalIncome: sumIncome,
        totalExpense: sumExpense,
        profit,
        period: { from, to },
      }
      exportFinanceToExcel(exportData, summary)
      toast.success('엑셀 파일이 다운로드되었습니다.')
    } catch (error) {
      console.error(error)
      toast.error('엑셀 내보내기 실패')
    }
  }

  const handleGenerateTaxReport = async () => {
    try {
      toast.info('세무 자료를 생성하는 중입니다...')
      const incomeData = transactions
        .filter(t => {
          const d = (t.transaction_date || t.created_at || '').slice(0, 10)
          return (!from || d >= from) && (!to || d <= to)
        })
        .map(t => ({
          date: (t.transaction_date || t.created_at || '').slice(0, 10),
          amount: Number(t.amount || 0),
          ...(t.customer_id && { customer: '고객' }),
          ...(t.category && { category: t.category }),
        }))
      const expenseData = expenses.map(e => ({
        date: e.expense_date,
        amount: Number(e.amount || 0),
        category: e.category,
        ...(e.memo && { memo: e.memo }),
      }))
      generateTaxReport({
        period: { from, to },
        income: incomeData,
        expense: expenseData,
      })
      toast.success('세무 자료 파일이 다운로드되었습니다.')
    } catch (error) {
      console.error(error)
      toast.error('세무 자료 생성 실패')
    }
  }

  const resetNewForm = () => {
    setNewType('income')
    setNewDate(new Date().toISOString().slice(0, 10))
    setNewAmount('')
    setNewMemo('')
    setSelectedCategory('')
  }

  const handleCreateSubmit = async () => {
    try {
      const amountValue = newAmount.replace(/[^0-9]/g, '')
      if (!amountValue || Number(amountValue) === 0) {
        toast.error('금액을 입력해주세요')
        return
      }
      const amountNumber = Number(amountValue)

      if (newType === 'income') {
        if (!selectedCategory) {
          toast.error('수입 항목을 선택해주세요')
          return
        }
        const { transactionsApi } = await import('@/app/lib/api/transactions')
        const createPayload: TransactionCreateInput = {
          transaction_date: newDate,
          amount: amountNumber,
          category: selectedCategory,
        }
        await transactionsApi.create(createPayload)
      } else {
        if (!selectedCategory) {
          toast.error('지출 항목을 선택해주세요')
          return
        }
        const { expensesApi } = await import('@/app/lib/api/expenses')
        const expensePayload: ExpenseCreateInput = {
          expense_date: newDate,
          amount: amountNumber,
          category: selectedCategory,
        }
        if (newMemo && newMemo.trim() !== '') {
          expensePayload.memo = newMemo.trim()
        }
        await expensesApi.create(expensePayload)
      }
      setNewOpen(false)
      resetNewForm()
      await load()
      toast.success('저장되었습니다.')
    } catch (err) {
      toast.error('저장 실패', err instanceof Error ? err.message : '')
    }
  }

  return (
    <Stack spacing={3}>
      {/* 헤더 영역 */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
        <Typography variant="h5" fontWeight="bold">재무 관리</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileText className="h-4 w-4" />}
            onClick={handleGenerateTaxReport}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            세무 자료 생성
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExportExcel}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            엑셀로 내보내기
          </Button>
          {/* 모바일용 */}
          <IconButton onClick={handleExportExcel} sx={{ display: { xs: 'flex', sm: 'none' } }}>
            <Download className="h-5 w-5" />
          </IconButton>
        </Stack>
      </Stack>

      {/* 요약 카드 */}
      <Grid container spacing={1}>
        <Grid item xs={4} sm={4}>
          <Card variant="outlined" sx={{ bgcolor: '#ecfdf5', borderColor: '#a7f3d0' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Typography variant="body2" color="#047857" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>월간 수입</Typography>
              <Typography variant="h5" color="#047857" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }}>
                ₩{Number(sumIncome).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4} sm={4}>
          <Card variant="outlined" sx={{ bgcolor: '#fff1f2', borderColor: '#fecdd3' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Typography variant="body2" color="#be123c" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>월간 지출</Typography>
              <Typography variant="h5" color="#be123c" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }}>
                ₩{Number(sumExpense).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4} sm={4}>
          <Card variant="outlined" sx={{
            bgcolor: profit >= 0 ? '#ecfdf5' : '#fff1f2',
            borderColor: profit >= 0 ? '#a7f3d0' : '#fecdd3'
          }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Typography variant="body2" color={profit >= 0 ? '#047857' : '#be123c'} fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>월간 순이익</Typography>
              <Typography variant="h5" color={profit >= 0 ? '#047857' : '#be123c'} fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }}>
                ₩{Number(profit).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 필터 및 기간 - 모바일에서는 접을 수 있음 */}
      <Paper sx={{ p: 2, borderRadius: 3 }} elevation={0} variant="outlined">
        <Stack spacing={2}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => { resetNewForm(); setNewOpen(true) }}
              className="flex-1"
            >
              새 수입/지출
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '필터 접기' : '필터 펼치기'}
            </Button>
          </Box>
          <Box sx={{ display: { xs: showFilters ? 'block' : 'none', md: 'block' } }}>
            <Stack spacing={2}>
              {/* 첫 번째 줄: 날짜 범위 */}
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  type="date"
                  label="시작일"
                  value={from}
                  onChange={e => setRange(r => ({ ...r, from: e.target.value }))}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
                <Typography variant="body2" color="text.secondary">~</Typography>
                <TextField
                  type="date"
                  label="종료일"
                  value={to}
                  onChange={e => setRange(r => ({ ...r, to: e.target.value }))}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
              </Stack>

              {/* 두 번째 줄: 필터 & 액션 */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                <ToggleButtonGroup
                  value={filterType}
                  onChange={(_, newFilters) => setFilterType(newFilters as ('income' | 'expense')[])}
                  size="small"
                  color="primary"
                  fullWidth={false}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  <ToggleButton value="income" sx={{ flex: 1 }}>수입</ToggleButton>
                  <ToggleButton value="expense" sx={{ flex: 1 }}>지출</ToggleButton>
                </ToggleButtonGroup>

                <Box sx={{ flexGrow: 1 }} />

                <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' }, display: { xs: 'none', md: 'flex' } }}>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="h-4 w-4" />}
                    onClick={handleExportExcel}
                  >
                    엑셀
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => { resetNewForm(); setNewOpen(true) }}
                  >
                    새 수입/지출
                  </Button>
                </Stack>
                {/* 모바일 엑셀 다운로드 버튼 (필터 내부에 유지) */}
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={handleExportExcel}
                  sx={{ display: { xs: 'flex', md: 'none' }, width: '100%' }}
                >
                  엑셀 다운로드
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* 모바일/태블릿 카드 뷰 */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Typography fontWeight="bold" mb={2}>수입/지출 내역</Typography>
        {loading && (
          <Grid container spacing={2}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Skeleton className="h-24 rounded-lg" />
              </Grid>
            ))}
          </Grid>
        )}
        {!loading && pagedCombined.length === 0 && (
          <EmptyState title="데이터가 없습니다." />
        )}
        {!loading && (
          <Grid container spacing={2}>
            {pagedCombined.map(row => (
              <Grid item xs={12} sm={6} key={`${row.type}-${row.id}`}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    height: '100%'
                  }}
                  onClick={() => {
                    if (row.type === 'income') {
                      setTxDetail(row.raw as Transaction)
                      setTxOpen(true)
                    } else {
                      setExpenseDetail(row.raw as Expense)
                      setExpenseOpen(true)
                    }
                  }}
                >
                  <CardContent sx={{ pb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                      <Chip
                        label={row.type === 'income' ? '수입' : '지출'}
                        size="small"
                        color={row.type === 'income' ? 'success' : 'error'}
                        variant="filled"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {row.date}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={row.type === 'income' ? 'success.main' : 'error.main'}
                      mb={0.5}
                    >
                      ₩{Number(row.amount || 0).toLocaleString()}
                    </Typography>
                    {row.note && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {row.note}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        {/* 페이지네이션 */}
        {!loading && combined.length > 0 && (
          <Stack direction="row" justifyContent="center" mt={3}>
            <Pagination
              count={Math.ceil(combined.length / pageSize)}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
              size="small"
              siblingCount={0}
            />
          </Stack>
        )}
      </Box>

      {/* 데스크톱 테이블 뷰 */}
      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 3, display: { xs: 'none', md: 'block' } }}>
        <Box p={2} borderBottom={1} borderColor="divider">
          <Typography fontWeight="bold">수입/지출 내역</Typography>
        </Box>
        <Table>
          <TableHead sx={{ bgcolor: 'neutral.50' }}>
            <TableRow>
              <TableCell sortDirection={sortKey === 'date' ? sortDir : false}>
                <TableSortLabel
                  active={sortKey === 'date'}
                  direction={sortKey === 'date' ? sortDir : 'asc'}
                  onClick={() => {
                    const isAsc = sortKey === 'date' && sortDir === 'asc'
                    setSortDir(isAsc ? 'desc' : 'asc')
                    setSortKey('date')
                  }}
                >
                  일자
                </TableSortLabel>
              </TableCell>
              <TableCell>유형</TableCell>
              <TableCell align="right" sortDirection={sortKey === 'amount' ? sortDir : false}>
                <TableSortLabel
                  active={sortKey === 'amount'}
                  direction={sortKey === 'amount' ? sortDir : 'asc'}
                  onClick={() => {
                    const isAsc = sortKey === 'amount' && sortDir === 'asc'
                    setSortDir(isAsc ? 'desc' : 'asc')
                    setSortKey('amount')
                  }}
                >
                  금액
                </TableSortLabel>
              </TableCell>
              <TableCell>메모/카테고리</TableCell>
              <TableCell align="center">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={5}><Skeleton className="h-10" /></TableCell>
              </TableRow>
            ))}
            {!loading && pagedCombined.map(row => (
              <TableRow key={`${row.type}-${row.id}`} hover>
                <TableCell>{row.date}</TableCell>
                <TableCell>
                  <Chip
                    label={row.type === 'income' ? '수입' : '지출'}
                    size="small"
                    color={row.type === 'income' ? 'success' : 'error'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: row.type === 'income' ? 'success.main' : 'error.main' }}>
                  ₩{Number(row.amount || 0).toLocaleString()}
                </TableCell>
                <TableCell>{row.note || '-'}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (row.type === 'income') { setTxDetail(row.raw as Transaction); setTxOpen(true) }
                      else { setExpenseDetail(row.raw as Expense); setExpenseOpen(true) }
                    }}
                    aria-label="편집"
                  >
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && combined.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <EmptyState title="데이터가 없습니다." />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* 데스크톱 페이지네이션 */}
        {!loading && combined.length > 0 && (
          <Stack direction="row" justifyContent="flex-end" p={2}>
            <Pagination
              count={Math.ceil(combined.length / pageSize)}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
            />
          </Stack>
        )}
      </TableContainer>

      {/* 신규 등록 모달 - MUI Dialog */}
      <Dialog open={newOpen} onClose={() => setNewOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>새 수입/지출</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <ToggleButtonGroup
              value={newType}
              exclusive
              onChange={(_, v) => v && setNewType(v as 'income' | 'expense')}
              fullWidth
              color="primary"
            >
              <ToggleButton value="income">수입</ToggleButton>
              <ToggleButton value="expense">지출</ToggleButton>
            </ToggleButtonGroup>

            <TextField
              label="일자"
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="금액"
              value={newAmount}
              onChange={e => {
                const numeric = e.target.value.replace(/[^0-9]/g, '')
                setNewAmount(numeric ? Number(numeric).toLocaleString('ko-KR') : '')
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">원</InputAdornment>
              }}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>{newType === 'income' ? '수입 항목' : '지출 항목'}</InputLabel>
              <Select
                value={selectedCategory}
                label={newType === 'income' ? '수입 항목' : '지출 항목'}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {(newType === 'income' ? incomeCategories : expenseCategories).map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
                {(newType === 'income' ? incomeCategories : expenseCategories).length === 0 && (
                  <MenuItem disabled value="">항목 설정이 필요합니다</MenuItem>
                )}
              </Select>
            </FormControl>

            <TextField
              label="메모 (선택)"
              value={newMemo}
              onChange={e => setNewMemo(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={() => setNewOpen(false)}>취소</Button>
          <Button variant="primary" onClick={handleCreateSubmit}>저장</Button>
        </DialogActions>
      </Dialog>


      {/* 상세 모달 (Lazy) */}
      <Suspense fallback={null}>
        {expenseOpen && <ExpenseDetailModal
          open={expenseOpen}
          item={expenseDetail}
          onClose={() => setExpenseOpen(false)}
          onSaved={load}
          onDeleted={load}
        />}
        {txOpen && <TransactionDetailModal
          open={txOpen}
          item={txDetail}
          onClose={() => setTxOpen(false)}
          onSaved={load}
          onDeleted={load}
        />}
      </Suspense>
      {error && <Typography color="error" variant="body2">{error}</Typography>}

      {/* Mobile FAB */}
      <Fab
        color="primary"
        aria-label="새 수입/지출 추가"
        sx={{
          position: 'fixed',
          bottom: { xs: 72, md: 16 },
          right: 16,
          display: { xs: 'flex', md: 'none' },
        }}
        onClick={() => { resetNewForm(); setNewOpen(true) }}
      >
        <Plus />
      </Fab>
    </Stack>
  )
}
