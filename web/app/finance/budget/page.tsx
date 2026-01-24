'use client'

import { useEffect, useState } from 'react'
import { Box, Container, Typography, Grid, Card, CardContent, Stack, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress, Alert, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, LinearProgress } from '@mui/material'
import StatusBadge from '../../components/common/StatusBadge'
import { DollarSign, TrendingUp, AlertCircle, Plus, Edit, Delete } from 'lucide-react'
import PageHeader, { createActionButton } from '@/app/components/common/PageHeader'
import LoadingState from '../../components/common/LoadingState'
import EmptyState from '@/app/components/ui/EmptyState'
import { useAppToast } from '@/app/lib/ui/toast'
import { format, subMonths } from 'date-fns'

interface BudgetData {
  id: string
  category: string
  month: string
  budget_amount: number
  spent_amount: number
  percentage: number
  isOverBudget: boolean
  isWarning: boolean
  remaining: number
}

interface BudgetSummary {
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  overBudgetCount: number
  warningCount: number
}

interface BudgetResponse {
  budgets: BudgetData[]
  month: string
  summary: BudgetSummary
}

export default function BudgetManagementPage() {
  const [data, setData] = useState<BudgetResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetData | null>(null)
  const [formCategory, setFormCategory] = useState('')
  const [formAmount, setFormAmount] = useState('')
  const toast = useAppToast()

  useEffect(() => {
    fetchBudgets()
  }, [selectedMonth])

  async function fetchBudgets() {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/finance/budget?month=${selectedMonth}`)

      if (!response.ok) {
        throw new Error('예산 데이터를 불러오는데 실패했습니다')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBudget = async () => {
    if (!formCategory.trim() || !formAmount.trim()) {
      toast.error('카테고리와 예산 금액을 입력해주세요.')
      return
    }

    try {
      const response = await fetch('/api/finance/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formCategory.trim(),
          month: selectedMonth,
          budget_amount: parseInt(formAmount.replace(/[^0-9]/g, '')),
        }),
      })

      if (!response.ok) {
        throw new Error('예산 생성에 실패했습니다')
      }

      toast.success('예산이 생성되었습니다.')
      setBudgetModalOpen(false)
      setFormCategory('')
      setFormAmount('')
      fetchBudgets()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '예산 생성에 실패했습니다.')
    }
  }

  const handleUpdateBudget = async () => {
    if (!editingBudget || !formAmount.trim()) {
      return
    }

    try {
      const response = await fetch(`/api/finance/budget/${editingBudget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget_amount: parseInt(formAmount.replace(/[^0-9]/g, '')),
        }),
      })

      if (!response.ok) {
        throw new Error('예산 수정에 실패했습니다')
      }

      toast.success('예산이 수정되었습니다.')
      setBudgetModalOpen(false)
      setEditingBudget(null)
      setFormCategory('')
      setFormAmount('')
      fetchBudgets()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '예산 수정에 실패했습니다.')
    }
  }

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('이 예산을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/finance/budget/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('예산 삭제에 실패했습니다')
      }

      toast.success('예산이 삭제되었습니다.')
      fetchBudgets()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '예산 삭제에 실패했습니다.')
    }
  }

  const openEditModal = (budget: BudgetData) => {
    setEditingBudget(budget)
    setFormCategory(budget.category)
    setFormAmount(budget.budget_amount.toLocaleString())
    setBudgetModalOpen(true)
  }

  const closeModal = () => {
    setBudgetModalOpen(false)
    setEditingBudget(null)
    setFormCategory('')
    setFormAmount('')
  }

  // 사용 가능한 카테고리 목록 (실제로는 지출 카테고리에서 가져와야 함)
  const availableCategories = data
    ? Array.from(new Set([
        ...data.budgets.map((b) => b.category),
        '급여', '임대료', '광고비', '유지보수', '기타',
      ])).filter(Boolean)
    : []

  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i)
    return { value: format(date, 'yyyy-MM'), label: format(date, 'yyyy년 M월') }
  })

  if (loading && !data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="예산 관리"
          description="카테고리별 월별 예산 설정 및 추적"
          icon={<DollarSign />}
          actions={[]}
        />
        <Box sx={{ mb: 4 }}>
          <LoadingState variant="card" rows={3} />
        </Box>
      </Container>
    )
  }

  if (error && !data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="예산 관리"
          description="카테고리별 월별 예산 설정 및 추적"
          icon={<DollarSign />}
          actions={[]}
        />
        <Alert
          severity="error"
          sx={{ mt: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchBudgets}>
              다시 시도
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="예산 관리"
        description="카테고리별 월별 예산 설정 및 추적"
        icon={<DollarSign />}
        actions={[
          <FormControl key="month" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>월</InputLabel>
            <Select
              value={selectedMonth}
              label="월"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>,
          createActionButton(
            '예산 추가',
            () => {
              setEditingBudget(null)
              setFormCategory('')
              setFormAmount('')
              setBudgetModalOpen(true)
            },
            'primary',
            <Plus size={18} />
          ),
        ]}
      />

      <Stack spacing={4} sx={{ mt: 4 }}>
        {/* 요약 카드 */}
        {data && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DollarSign size={20} color="#667eea" />
                    <Typography variant="body2" color="text.secondary">
                      총 예산
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700}>
                    {data.summary.totalBudget.toLocaleString()}원
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TrendingUp size={20} color="#4facfe" />
                    <Typography variant="body2" color="text.secondary">
                      총 지출
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700} color={data.summary.totalSpent > data.summary.totalBudget ? 'error.main' : 'text.primary'}>
                    {data.summary.totalSpent.toLocaleString()}원
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    예산 대비 {data.summary.totalBudget > 0 ? ((data.summary.totalSpent / data.summary.totalBudget) * 100).toFixed(1) : 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AlertCircle size={20} color={data.summary.overBudgetCount > 0 ? '#ef4444' : '#f59e0b'} />
                    <Typography variant="body2" color="text.secondary">
                      초과 예산
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700} color={data.summary.overBudgetCount > 0 ? 'error.main' : 'text.primary'}>
                    {data.summary.overBudgetCount}개
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    카테고리
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AlertCircle size={20} color="#f59e0b" />
                    <Typography variant="body2" color="text.secondary">
                      경고
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {data.summary.warningCount}개
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    80% 이상 사용
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* 예산 목록 */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error">{error}</Alert>
        )}

        {data && data.budgets.length === 0 && (
          <EmptyState
            icon={DollarSign}
            title="예산이 설정되지 않았습니다"
            description="예산 추가 버튼을 눌러 카테고리별 예산을 설정하세요."
          />
        )}

        {data && data.budgets.length > 0 && (
          <Stack spacing={2}>
            {data.budgets
              .filter((b) => b.budget_amount > 0 || b.spent_amount > 0)
              .sort((a, b) => {
                if (a.isOverBudget && !b.isOverBudget) return -1
                if (!a.isOverBudget && b.isOverBudget) return 1
                if (a.isWarning && !b.isWarning) return -1
                if (!a.isWarning && b.isWarning) return 1
                return b.percentage - a.percentage
              })
              .map((budget) => (
                <Card key={budget.id || budget.category} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {budget.category}
                          </Typography>
                          {budget.isOverBudget && (
                            <StatusBadge status="error" label="초과" />
                          )}
                          {budget.isWarning && !budget.isOverBudget && (
                            <StatusBadge status="warning" label="경고" />
                          )}
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, budget.percentage)}
                          color={budget.isOverBudget ? 'error' : budget.isWarning ? 'warning' : 'primary'}
                          sx={{ height: 8, borderRadius: 4, mb: 1 }}
                        />
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                              예산
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {budget.budget_amount.toLocaleString()}원
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                              지출
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {budget.spent_amount.toLocaleString()}원
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                              남은 금액
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color={budget.remaining < 0 ? 'error.main' : 'text.primary'}>
                              {budget.remaining.toLocaleString()}원
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">
                              사용률
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {budget.percentage.toFixed(1)}%
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                      {budget.id && (
                        <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openEditModal(budget)}
                            startIcon={<Edit size={16} />}
                          >
                            수정
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteBudget(budget.id)}
                            startIcon={<Delete size={16} />}
                          >
                            삭제
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
          </Stack>
        )}
      </Stack>

      {/* 예산 추가/수정 모달 */}
      <Dialog open={budgetModalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBudget ? '예산 수정' : '예산 추가'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="카테고리"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              fullWidth
              required
              disabled={!!editingBudget}
              placeholder="예: 급여, 임대료, 광고비"
            />
            <TextField
              label="예산 금액"
              value={formAmount}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^0-9]/g, '')
                if (numericValue === '') {
                  setFormAmount('')
                } else {
                  setFormAmount(Number(numericValue).toLocaleString())
                }
              }}
              fullWidth
              required
              placeholder="예산 금액을 입력하세요"
              InputProps={{
                endAdornment: <Typography variant="body2" color="text.secondary">원</Typography>,
              }}
            />
            {!editingBudget && availableCategories.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  빠른 선택:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {availableCategories.slice(0, 10).map((cat) => (
                    <Chip
                      key={cat}
                      label={cat}
                      size="small"
                      onClick={() => setFormCategory(cat)}
                      variant={formCategory === cat ? 'filled' : 'outlined'}
                      color={formCategory === cat ? 'primary' : 'default'}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>취소</Button>
          <Button
            variant="contained"
            onClick={editingBudget ? handleUpdateBudget : handleCreateBudget}
            disabled={!formCategory.trim() || !formAmount.trim()}
          >
            {editingBudget ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
