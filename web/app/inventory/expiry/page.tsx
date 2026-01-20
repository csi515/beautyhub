'use client'

import { useEffect, useState } from 'react'
import { Box, Container, Typography, Grid, Card, CardContent, Stack, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Calendar, AlertTriangle, Clock, Plus } from 'lucide-react'
import PageHeader, { createActionButton } from '@/app/components/common/PageHeader'
import MobileDataCard from '@/app/components/ui/MobileDataCard'
import LoadingState from '../../components/common/LoadingState'
import EmptyState from '@/app/components/ui/EmptyState'
import { useAppToast } from '@/app/components/ui/Toast'
import { showNotification } from '@/app/lib/utils/notifications'

interface BatchData {
  id: string
  product_id: string
  product_name: string
  batch_number: string
  quantity: number
  expiry_date: string
  purchase_date?: string | null
  days_until_expiry: number
  is_expired: boolean
  is_expiring_soon: boolean
}

interface ExpiryResponse {
  batches: BatchData[]
  summary: {
    total: number
    expired: number
    expiringSoon: number
    days: number
  }
}

export default function InventoryExpiryPage() {
  const [data, setData] = useState<ExpiryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    product_id: '',
    batch_number: '',
    quantity: '',
    expiry_date: '',
    purchase_date: '',
    notes: '',
  })
  const toast = useAppToast()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    fetchData()
  }, [days])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/inventory/expiry?days=${days}`)

      if (!response.ok) {
        throw new Error('유통기한 데이터를 불러오는데 실패했습니다')
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

  // 유통기한 임박 알림 체크
  useEffect(() => {
    if (data && data.batches.length > 0) {
      data.batches.forEach((batch) => {
        if (batch.is_expiring_soon && !batch.is_expired) {
          showNotification({
            title: '유통기한 임박 알림',
            body: `${batch.product_name} (배치: ${batch.batch_number})의 유통기한이 ${batch.days_until_expiry}일 남았습니다.`,
            type: 'low_stock',
            tag: `expiry-${batch.id}`,
            requireInteraction: false,
          })
        }
        if (batch.is_expired) {
          showNotification({
            title: '유통기한 만료 알림',
            body: `${batch.product_name} (배치: ${batch.batch_number})의 유통기한이 만료되었습니다.`,
            type: 'out_of_stock',
            tag: `expired-${batch.id}`,
            requireInteraction: true,
          })
        }
      })
    }
  }, [data])

  const handleCreateBatch = async () => {
    if (!formData.product_id || !formData.batch_number || !formData.expiry_date || !formData.quantity) {
      toast.error('필수 항목을 모두 입력해주세요.')
      return
    }

    try {
      const response = await fetch('/api/inventory/expiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: formData.product_id,
          batch_number: formData.batch_number,
          quantity: parseInt(formData.quantity.replace(/[^0-9]/g, '')),
          expiry_date: formData.expiry_date,
          purchase_date: formData.purchase_date || null,
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) {
        throw new Error('배치 생성에 실패했습니다')
      }

      toast.success('배치가 생성되었습니다.')
      setBatchModalOpen(false)
      setFormData({
        product_id: '',
        batch_number: '',
        quantity: '',
        expiry_date: '',
        purchase_date: '',
        notes: '',
      })
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '배치 생성에 실패했습니다.')
    }
  }

  if (loading && !data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="유통기한 관리"
          description="제품 유통기한 등록 및 추적"
          icon={<Calendar />}
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
          title="유통기한 관리"
          description="제품 유통기한 등록 및 추적"
          icon={<Calendar />}
          actions={[]}
        />
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="유통기한 관리"
        description="제품 유통기한 등록 및 추적"
        icon={<Calendar />}
        actions={[
          createActionButton(
            '기간 설정',
            () => {},
            'secondary',
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 }, minHeight: { xs: '44px', sm: 'auto' } }}>
              <InputLabel shrink>알림 기간</InputLabel>
              <Select
                value={days}
                label="알림 기간"
                onChange={(e) => setDays(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  minHeight: { xs: '44px', sm: 'auto' },
                  '& .MuiSelect-select': {
                    fontSize: { xs: '16px', sm: '14px' },
                  },
                }}
              >
                <MenuItem value={7} sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>7일</MenuItem>
                <MenuItem value={14} sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>14일</MenuItem>
                <MenuItem value={30} sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>30일</MenuItem>
                <MenuItem value={60} sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>60일</MenuItem>
              </Select>
            </FormControl>
          ),
          createActionButton(
            '배치 추가',
            () => setBatchModalOpen(true),
            'primary',
            <Plus size={18} />
          ),
        ]}
      />

      <Stack spacing={4} sx={{ mt: 4 }}>
        {/* 요약 카드 */}
        {data && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Calendar size={20} color="#667eea" />
                    <Typography variant="body2" color="text.secondary">
                      총 배치 수
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700}>
                    {data.summary.total}개
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AlertTriangle size={20} color="#ef4444" />
                    <Typography variant="body2" color="text.secondary">
                      만료된 배치
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    {data.summary.expired}개
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Clock size={20} color="#f59e0b" />
                    <Typography variant="body2" color="text.secondary">
                      임박 배치
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {data.summary.expiringSoon}개
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {days}일 이내
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error">{error}</Alert>
        )}

        {data && data.batches.length === 0 && (
          <EmptyState
            icon={Calendar}
            title="등록된 배치가 없습니다"
            description="배치 추가 버튼을 눌러 유통기한을 등록하세요."
          />
        )}

        {data && data.batches.length > 0 && (
          <>
            {isMobile ? (
              <Stack spacing={2}>
                {data.batches.map((batch) => (
                  <MobileDataCard
                    key={batch.id}
                    title={batch.product_name}
                    subtitle={`배치: ${batch.batch_number} | 수량: ${batch.quantity}개`}
                    status={{
                      label: batch.is_expired
                        ? '만료'
                        : batch.is_expiring_soon
                        ? `${batch.days_until_expiry}일 남음`
                        : '정상',
                      color: batch.is_expired ? 'error' : batch.is_expiring_soon ? 'warning' : 'primary',
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>제품명</TableCell>
                      <TableCell>배치 번호</TableCell>
                      <TableCell>수량</TableCell>
                      <TableCell>유통기한</TableCell>
                      <TableCell>구매일</TableCell>
                      <TableCell>상태</TableCell>
                      <TableCell>남은 일수</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.batches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell>{batch.product_name}</TableCell>
                        <TableCell>{batch.batch_number}</TableCell>
                        <TableCell>{batch.quantity.toLocaleString()}개</TableCell>
                        <TableCell>{batch.expiry_date}</TableCell>
                        <TableCell>{batch.purchase_date || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={batch.is_expired ? '만료' : batch.is_expiring_soon ? '임박' : '정상'}
                            size="small"
                            color={batch.is_expired ? 'error' : batch.is_expiring_soon ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color={batch.is_expired ? 'error.main' : batch.is_expiring_soon ? 'warning.main' : 'text.primary'}
                          >
                            {batch.is_expired ? '만료' : `${batch.days_until_expiry}일`}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Stack>

      {/* 배치 추가 모달 */}
      <Dialog 
        open={batchModalOpen} 
        onClose={() => setBatchModalOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            borderRadius: { xs: 3, sm: 3 },
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' }, pb: { xs: 1, sm: 1.5 } }}>
          배치 추가
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={{ xs: 2.5, sm: 3 }} sx={{ mt: 1 }}>
            <TextField
              label="제품 ID"
              value={formData.product_id}
              onChange={(e) => setFormData((f) => ({ ...f, product_id: e.target.value }))}
              fullWidth
              required
              placeholder="제품 ID를 입력하세요"
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: '44px',
                  fontSize: { xs: '16px', sm: '14px' },
                },
              }}
              inputProps={{
                style: { fontSize: '16px' },
              }}
            />
            <TextField
              label="배치 번호"
              value={formData.batch_number}
              onChange={(e) => setFormData((f) => ({ ...f, batch_number: e.target.value }))}
              fullWidth
              required
              placeholder="예: BATCH-2024-001"
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: '44px',
                  fontSize: { xs: '16px', sm: '14px' },
                },
              }}
              inputProps={{
                style: { fontSize: '16px' },
              }}
            />
            <TextField
              label="수량"
              value={formData.quantity}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^0-9]/g, '')
                setFormData((f) => ({ ...f, quantity: numericValue }))
              }}
              fullWidth
              required
              type="number"
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                style: { fontSize: '16px' },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: '44px',
                  fontSize: { xs: '16px', sm: '14px' },
                },
              }}
            />
            <TextField
              label="유통기한"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData((f) => ({ ...f, expiry_date: e.target.value }))}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: '44px',
                  fontSize: { xs: '16px', sm: '14px' },
                },
              }}
              inputProps={{
                style: { fontSize: '16px' },
              }}
            />
            <TextField
              label="구매일 (선택)"
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData((f) => ({ ...f, purchase_date: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: '44px',
                  fontSize: { xs: '16px', sm: '14px' },
                },
              }}
              inputProps={{
                style: { fontSize: '16px' },
              }}
            />
            <TextField
              label="메모 (선택)"
              value={formData.notes}
              onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: { xs: '16px', sm: '14px' },
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 2 }, gap: 1 }}>
          <Button 
            onClick={() => setBatchModalOpen(false)}
            sx={{ 
              minHeight: '44px', 
              flex: { xs: 1, sm: 'none' },
              fontSize: { xs: '0.9375rem', sm: '1rem' }
            }}
          >
            취소
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateBatch} 
            disabled={!formData.product_id || !formData.batch_number || !formData.expiry_date || !formData.quantity}
            sx={{ 
              minHeight: '44px', 
              flex: { xs: 1, sm: 'none' },
              fontSize: { xs: '0.9375rem', sm: '1rem' }
            }}
          >
            추가
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
