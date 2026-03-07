'use client'

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material'
import { Button } from '@mui/material'
import type { Product } from '../hooks/useInventoryData'

interface StockAdjustmentModalProps {
    open: boolean
    onClose: () => void
    product: Product | null
    quantity: number
    type: 'purchase' | 'sale' | 'adjustment'
    memo: string
    onQuantityChange: (quantity: number) => void
    onTypeChange: (type: 'purchase' | 'sale' | 'adjustment') => void
    onMemoChange: (memo: string) => void
    onSave: () => void
    saving: boolean
}

export default function StockAdjustmentModal({
    open,
    onClose,
    product,
    quantity,
    type,
    memo,
    onQuantityChange,
    onTypeChange,
    onMemoChange,
    onSave,
    saving,
}: StockAdjustmentModalProps) {
    const parseType = (value: string): 'purchase' | 'sale' | 'adjustment' => {
        if (value === 'purchase' || value === 'sale' || value === 'adjustment') {
            return value
        }
        return 'adjustment'
    }

    const handleClose = () => {
        if (!saving) {
            onClose()
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>재고 조정 - {product?.name}</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>조정 유형</InputLabel>
                        <Select
                            value={type}
                            onChange={(e) => onTypeChange(parseType(e.target.value))}
                            label="조정 유형"
                            disabled={saving}
                        >
                            <MenuItem value="adjustment">직접 입력</MenuItem>
                            <MenuItem value="purchase">입고</MenuItem>
                            <MenuItem value="sale">출고</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label={type === 'adjustment' ? '재고 수량' : '수량 변경'}
                        type="number"
                        value={quantity}
                        onChange={(e) => onQuantityChange(Number(e.target.value))}
                        fullWidth
                        disabled={saving}
                        helperText={
                            type === 'adjustment'
                                ? '현재 재고를 직접 입력하세요'
                                : `현재 재고: ${product?.stock_count ?? 0}`
                        }
                    />

                    <TextField
                        label="메모"
                        value={memo}
                        onChange={(e) => onMemoChange(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        disabled={saving}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="outlined" disabled={saving}>
                    취소
                </Button>
                <Button onClick={onSave} variant="contained" color="primary" disabled={saving}>
                    {saving ? '저장 중...' : '저장'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
