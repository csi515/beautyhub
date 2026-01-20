'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material'
import Button from '../ui/Button'
import { FinanceCreateForm } from '@/types/finance'

interface FinanceCreateModalProps {
  open: boolean
  onClose: () => void
  form: FinanceCreateForm
  onFormChange: (updates: Partial<FinanceCreateForm>) => void
  incomeCategories: string[]
  expenseCategories: string[]
  onSubmit: (incomeCategories: string[], expenseCategories: string[]) => Promise<boolean>
}

export default function FinanceCreateModal({
  open,
  onClose,
  form,
  onFormChange,
  incomeCategories,
  expenseCategories,
  onSubmit
}: FinanceCreateModalProps) {
  const handleSubmit = async () => {
    const success = await onSubmit(incomeCategories, expenseCategories)
    if (success) {
      onClose()
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      fullScreen={false}
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 },
          borderRadius: { xs: 3, sm: 3 },
        }
      }}
    >
      <DialogTitle sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' }, pb: { xs: 1, sm: 1.5 } }}>
        새 수입/지출
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={{ xs: 2.5, sm: 3 }} sx={{ mt: 1 }}>
          <ToggleButtonGroup
            value={form.newType}
            exclusive
            onChange={(_, v) => v && onFormChange({ newType: v as 'income' | 'expense' })}
            fullWidth
            color="primary"
            sx={{
              '& .MuiToggleButton-root': {
                minHeight: '44px',
                fontSize: { xs: '0.9375rem', sm: '1rem' },
              },
            }}
          >
            <ToggleButton value="income">수입</ToggleButton>
            <ToggleButton value="expense">지출</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="일자"
            type="date"
            value={form.newDate}
            onChange={e => onFormChange({ newDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
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
            label="금액"
            value={form.newAmount}
            onChange={e => {
              const numeric = e.target.value.replace(/[^0-9]/g, '')
              onFormChange({ newAmount: numeric ? Number(numeric).toLocaleString('ko-KR') : '' })
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">원</InputAdornment>
            }}
            fullWidth
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: '44px',
                fontSize: { xs: '16px', sm: '14px' },
              },
            }}
          />

          <FormControl fullWidth>
            <InputLabel shrink>{form.newType === 'income' ? '수입 항목' : '지출 항목'}</InputLabel>
            <Select
              value={form.selectedCategory}
              label={form.newType === 'income' ? '수입 항목' : '지출 항목'}
              onChange={(e) => onFormChange({ selectedCategory: e.target.value })}
              sx={{
                minHeight: '44px',
                '& .MuiSelect-select': {
                  fontSize: { xs: '16px', sm: '14px' },
                },
              }}
            >
              {(form.newType === 'income' ? incomeCategories : expenseCategories).map(c => (
                <MenuItem key={c} value={c} sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>{c}</MenuItem>
              ))}
              {(form.newType === 'income' ? incomeCategories : expenseCategories).length === 0 && (
                <MenuItem disabled value="" sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>항목 설정이 필요합니다</MenuItem>
              )}
            </Select>
          </FormControl>

          <TextField
            label="메모 (선택)"
            value={form.newMemo}
            onChange={e => onFormChange({ newMemo: e.target.value })}
            fullWidth
            multiline
            rows={2}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: { xs: '16px', sm: '14px' },
              },
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: { xs: 2, sm: 2 }, gap: 1 }}>
        <Button variant="secondary" onClick={onClose} sx={{ minHeight: '44px', flex: { xs: 1, sm: 'none' } }}>취소</Button>
        <Button variant="primary" onClick={handleSubmit} sx={{ minHeight: '44px', flex: { xs: 1, sm: 'none' } }}>저장</Button>
      </DialogActions>
    </Dialog>
  )
}
