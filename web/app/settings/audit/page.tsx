'use client'

import { useEffect, useState } from 'react'
import { Box, Container, Typography, Card, CardContent, Stack, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TextField, CircularProgress, Alert, Pagination, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { FileSearch, Filter } from 'lucide-react'
import PageHeader from '@/app/components/common/PageHeader'
import MobileDataCard from '@/app/components/ui/MobileDataCard'
import { CardSkeleton } from '@/app/components/ui/SkeletonLoader'
import EmptyState from '@/app/components/ui/EmptyState'
import { format } from 'date-fns'

interface AuditLog {
  id: string
  action_type: string
  resource_type: string
  resource_id?: string | null
  description?: string | null
  user_id?: string | null
  created_at: string
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    action_type: '',
    resource_type: '',
    from: '',
    to: '',
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    fetchLogs()
  }, [filters, page])

  async function fetchLogs() {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: '50',
        offset: String((page - 1) * 50),
      })

      if (filters.action_type) params.append('action_type', filters.action_type)
      if (filters.resource_type) params.append('resource_type', filters.resource_type)
      if (filters.from) params.append('from', filters.from)
      if (filters.to) params.append('to', filters.to)

      const response = await fetch(`/api/audit/logs?${params.toString()}`)

      if (!response.ok) {
        throw new Error('감사 로그를 불러오는데 실패했습니다')
      }

      const result = await response.json()
      setLogs(result.logs || [])
      
      // 총 페이지 수 계산 (간단히 50개씩)
      setTotalPages(Math.ceil((result.logs?.length || 0) / 50))
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'create':
        return 'success'
      case 'update':
        return 'primary'
      case 'delete':
        return 'error'
      case 'view':
        return 'default'
      case 'export':
        return 'info'
      default:
        return 'default'
    }
  }

  const actionLabels: Record<string, string> = {
    create: '생성',
    update: '수정',
    delete: '삭제',
    view: '조회',
    export: '내보내기',
    login: '로그인',
    logout: '로그아웃',
    backup: '백업',
    restore: '복구',
  }

  const resourceLabels: Record<string, string> = {
    customer: '고객',
    appointment: '예약',
    transaction: '거래',
    product: '제품',
    staff: '직원',
    expense: '지출',
    inventory: '재고',
    payroll: '급여',
    settings: '설정',
    system: '시스템',
  }

  if (loading && logs.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        <PageHeader
          title="감사 로그"
          description="시스템 작업 기록 및 변경 이력"
          icon={<FileSearch />}
          actions={[]}
        />
        <Box sx={{ mb: 4 }}>
          <CardSkeleton count={3} />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="감사 로그"
        description="시스템 작업 기록 및 변경 이력"
        icon={<FileSearch />}
        actions={[]}
      />

      <Stack spacing={4} sx={{ mt: 4 }}>
        {/* 필터 */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Filter size={20} />
              <Typography variant="h6" fontWeight={600}>
                필터
              </Typography>
            </Box>
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>작업 유형</InputLabel>
                <Select
                  value={filters.action_type}
                  label="작업 유형"
                  onChange={(e) => setFilters((f) => ({ ...f, action_type: e.target.value }))}
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="create">생성</MenuItem>
                  <MenuItem value="update">수정</MenuItem>
                  <MenuItem value="delete">삭제</MenuItem>
                  <MenuItem value="view">조회</MenuItem>
                  <MenuItem value="export">내보내기</MenuItem>
                  <MenuItem value="backup">백업</MenuItem>
                  <MenuItem value="restore">복구</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>리소스 유형</InputLabel>
                <Select
                  value={filters.resource_type}
                  label="리소스 유형"
                  onChange={(e) => setFilters((f) => ({ ...f, resource_type: e.target.value }))}
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="customer">고객</MenuItem>
                  <MenuItem value="appointment">예약</MenuItem>
                  <MenuItem value="transaction">거래</MenuItem>
                  <MenuItem value="product">제품</MenuItem>
                  <MenuItem value="staff">직원</MenuItem>
                  <MenuItem value="expense">지출</MenuItem>
                  <MenuItem value="inventory">재고</MenuItem>
                  <MenuItem value="system">시스템</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="시작 날짜"
                type="date"
                size="small"
                value={filters.from}
                onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
              <TextField
                label="종료 날짜"
                type="date"
                size="small"
                value={filters.to}
                onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
            </Stack>
          </CardContent>
        </Card>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error">{error}</Alert>
        )}

        {logs.length === 0 && !loading && (
          <EmptyState
            icon={FileSearch}
            title="감사 로그가 없습니다"
            description="필터 조건을 변경해보세요."
          />
        )}

        {logs.length > 0 && (
          <>
            {isMobile ? (
              <Stack spacing={2}>
                {logs.map((log) => (
                  <MobileDataCard
                    key={log.id}
                    title={actionLabels[log.action_type] || log.action_type}
                    subtitle={`${resourceLabels[log.resource_type] || log.resource_type}${log.description ? ` - ${log.description}` : ''}`}
                    status={{
                      label: format(new Date(log.created_at), 'yyyy-MM-dd HH:mm'),
                      color: getActionColor(log.action_type) as any,
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>작업 유형</TableCell>
                      <TableCell>리소스</TableCell>
                      <TableCell>설명</TableCell>
                      <TableCell>날짜</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Chip
                            label={actionLabels[log.action_type] || log.action_type}
                            size="small"
                            color={getActionColor(log.action_type) as any}
                          />
                        </TableCell>
                        <TableCell>
                          {resourceLabels[log.resource_type] || log.resource_type}
                        </TableCell>
                        <TableCell>{log.description || '-'}</TableCell>
                        <TableCell>
                          {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Stack>
    </Container>
  )
}
