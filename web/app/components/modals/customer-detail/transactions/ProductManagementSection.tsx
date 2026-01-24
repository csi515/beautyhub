'use client'

import { Card, Grid, Typography, Box, Stack, TextField, InputAdornment, MenuItem, FormControl, InputLabel, Select, IconButton, Chip } from '@mui/material'
import { Plus, Minus, Package, Trash2 } from 'lucide-react'
import Button from '@/app/components/ui/Button'
import type { CustomerProduct } from '@/app/lib/repositories/customer-products.repository'

interface Product {
  id: string
  name: string
}

type Holding = CustomerProduct

interface ProductManagementSectionProps {
  holdings: Holding[]
  products: Product[]
  newProductId: string
  newQty: number
  newReason: string
  holdingDelta: Record<string, number>
  holdingReason: Record<string, string>
  addingProduct: boolean
  onChangeNewProduct: (id: string) => void
  onChangeNewQty: (qty: number) => void
  onChangeNewReason: (reason: string) => void
  onChangeHoldingDelta: (id: string, value: number) => void
  onChangeHoldingReason: (id: string, value: string) => void
  onAddProduct: () => void
  onIncrease: (holding: Holding) => void | Promise<void>
  onDecrease: (holding: Holding) => void | Promise<void>
  onDelete: (id: string) => void
}

export default function ProductManagementSection({
  holdings,
  products,
  newProductId,
  newQty,
  newReason,
  holdingDelta,
  holdingReason,
  addingProduct,
  onChangeNewProduct,
  onChangeNewQty,
  onChangeNewReason,
  onChangeHoldingDelta,
  onChangeHoldingReason,
  onAddProduct,
  onIncrease,
  onDecrease,
  onDelete,
}: ProductManagementSectionProps) {
  return (
    <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Package size={20} className="text-primary-main" />
        <Typography variant="subtitle1" fontWeight={700}>
          보유상품 관리
        </Typography>
      </Box>

      {/* 신규 상품 추가 */}
      <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 2, mb: 3 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          새로운 상품 지급
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth size="small">
              <InputLabel>상품 선택</InputLabel>
              <Select
                value={newProductId}
                onChange={(e) => onChangeNewProduct(e.target.value as string)}
                label="상품 선택"
              >
                <MenuItem value=""><em>선택 안 함</em></MenuItem>
                {products.filter(p => !holdings.some(h => h.product_id === p.id)).map(product => (
                  <MenuItem key={product.id} value={product.id}>{product.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="수량"
              type="number"
              fullWidth
              size="small"
              value={newQty || ''}
              onChange={(e) => onChangeNewQty(Number(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">개</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              onClick={onAddProduct}
              disabled={!newProductId || !newQty || newQty <= 0 || addingProduct}
              variant="primary"
              fullWidth
              leftIcon={<Plus size={18} />}
            >
              상품 지급
            </Button>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="지급 사유"
              fullWidth
              size="small"
              placeholder="사유를 입력하세요 (선택)"
              value={newReason}
              onChange={(e) => onChangeNewReason(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      {/* 보유 목록 */}
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" fontWeight={700} color="text.secondary">보유 목록 ({holdings.length})</Typography>
        </Box>

        {holdings.length === 0 ? (
          <Stack alignItems="center" spacing={2} sx={{ py: 6, bgcolor: 'background.default', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
            <Package size={48} className="text-gray-300" />
            <Box textAlign="center">
              <Typography variant="body1" fontWeight={600} color="text.secondary" gutterBottom>
                지급된 상품이 없습니다
              </Typography>
              <Typography variant="caption" color="text.disabled">
                위 입력란에서 첫 상품을 지급해보세요
              </Typography>
            </Box>
          </Stack>
        ) : (
          holdings.map(holding => (
            <Box key={holding.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Package size={16} className="text-primary-main" />
                  <Typography variant="body2" fontWeight={700}>
                    {holding.products?.name || products.find(p => p.id === holding.product_id)?.name || '알 수 없음'}
                  </Typography>
                </Box>
                <Chip
                  label={`${holding.quantity}개`}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 700, borderRadius: 1.5 }}
                />
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <TextField
                  label="수량"
                  size="small"
                  type="number"
                  value={holdingDelta[holding.id] || 1}
                  onChange={(e) => onChangeHoldingDelta(holding.id, Number(e.target.value))}
                  sx={{ width: { xs: '100%', sm: 90 } }}
                  InputProps={{ sx: { fontSize: '0.8125rem' } }}
                />
                <TextField
                  label="사유"
                  size="small"
                  placeholder="선택사항"
                  value={holdingReason[holding.id] || ''}
                  onChange={(e) => onChangeHoldingReason(holding.id, e.target.value)}
                  sx={{ flex: 1 }}
                  InputProps={{ sx: { fontSize: '0.8125rem' } }}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onIncrease(holding)}
                    leftIcon={<Plus size={16} />}
                    sx={{ minWidth: 80, fontSize: '0.8125rem', px: 1.5 }}
                  >
                    추가
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDecrease(holding)}
                    leftIcon={<Minus size={16} />}
                    sx={{ minWidth: 80, fontSize: '0.8125rem', px: 1.5 }}
                  >
                    차감
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(holding.id)}
                    sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'error.50' } }}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          ))
        )}
      </Stack>
    </Card>
  )
}
