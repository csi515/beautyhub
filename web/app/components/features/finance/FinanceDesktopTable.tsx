'use client'

import { Pencil, Plus } from 'lucide-react'
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Typography,
  Paper,
  Stack,
  Pagination,
  IconButton,
  Chip
} from '@mui/material'
import { TableSkeleton } from '@/app/components/ui/SkeletonLoader'
import EmptyState from '@/app/components/ui/EmptyState'
import Button from '@/app/components/ui/Button'
import { FinanceCombinedRow } from '@/types/finance'

interface FinanceDesktopTableProps {
  loading: boolean
  pagedCombined: FinanceCombinedRow[]
  combined: FinanceCombinedRow[]
  sortKey: 'date' | 'amount'
  sortDir: 'asc' | 'desc'
  page: number
  pageSize: number
  onSortToggle: (key: 'date' | 'amount') => void
  onPageChange: (page: number) => void
  onItemClick: (row: FinanceCombinedRow) => void
  onCreateNew?: () => void
}

export default function FinanceDesktopTable({
  loading,
  pagedCombined,
  combined,
  sortKey,
  sortDir,
  page,
  pageSize,
  onSortToggle,
  onPageChange,
  onItemClick,
  onCreateNew
}: FinanceDesktopTableProps) {
  return (
    <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 3, display: { xs: 'none', md: 'block' } }}>
      <Box p={2} borderBottom={1} borderColor="divider" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography fontWeight="bold">수입/지출 내역</Typography>
        {onCreateNew && (
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={onCreateNew}>
            수입/지출 입력
          </Button>
        )}
      </Box>
      {loading ? (
        <Box sx={{ p: 2.5 }}>
          <TableSkeleton rows={5} cols={5} />
        </Box>
      ) : (
      <Table sx={{ '& .MuiTableCell-root': { py: { md: 1 } } }}>
        <TableHead sx={{ bgcolor: 'neutral.50' }}>
          <TableRow>
            <TableCell sortDirection={sortKey === 'date' ? sortDir : false}>
              <TableSortLabel
                active={sortKey === 'date'}
                direction={sortKey === 'date' ? sortDir : 'asc'}
                onClick={() => onSortToggle('date')}
              >
                일자
              </TableSortLabel>
            </TableCell>
            <TableCell>유형</TableCell>
            <TableCell align="right" sortDirection={sortKey === 'amount' ? sortDir : false}>
              <TableSortLabel
                active={sortKey === 'amount'}
                direction={sortKey === 'amount' ? sortDir : 'asc'}
                onClick={() => onSortToggle('amount')}
              >
                금액
              </TableSortLabel>
            </TableCell>
            <TableCell>메모/카테고리</TableCell>
            <TableCell align="center">관리</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pagedCombined.map(row => (
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
                  onClick={() => onItemClick(row)}
                  aria-label="편집"
                >
                  <Pencil className="h-4 w-4" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {combined.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <EmptyState title="데이터가 없습니다." />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      )}
      {/* 데스크톱 페이지네이션 */}
      {!loading && combined.length > 0 && (
        <Stack direction="row" justifyContent="flex-end" p={2}>
          <Pagination
            count={Math.ceil(combined.length / pageSize)}
            page={page}
            onChange={(_, p) => onPageChange(p)}
            color="primary"
          />
        </Stack>
      )}
    </TableContainer>
  )
}
