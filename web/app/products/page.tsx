"use client"

import { useEffect, useState, useMemo, lazy, Suspense, useCallback } from 'react'
import { Plus, Search } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
import { CardSkeleton } from '../components/ui/SkeletonLoader'
import { useAppToast } from '../lib/ui/toast'
import { SUCCESS_MESSAGES, getLocalizedErrorMessage } from '../lib/utils/messages'
import Button from '../components/ui/Button'
import Modal, { ModalBody, ModalFooter, ModalHeader } from '../components/ui/Modal'
import { useSearch } from '../lib/hooks/useSearch'
import { useSort } from '../lib/hooks/useSort'
import { usePagination } from '../lib/hooks/usePagination'
import { useIsTablet } from '../lib/hooks/useBreakpoint'
import { DEFAULT_PAGE_SIZE } from '../lib/constants/pagination'
import { useForm } from '../lib/hooks/useForm'
import { formatCurrency } from '../lib/utils/format'
// MUI 레이아웃 유틸리티 (허용)
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Grid from '@mui/material/Grid'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Pagination from '@mui/material/Pagination'
import FormControl from '@mui/material/FormControl'
// 공통 컴포넌트
import Card from '../components/ui/Card'
import FilterCard from '../components/common/FilterCard'
import ErrorState from '../components/common/ErrorState'
import PageContainer from '../components/layout/PageContainer'
import PageIntro from '../components/common/PageIntro'

const ProductDetailModal = lazy(() => import('../components/modals/ProductDetailModal'))

import type { Product } from '@/types/entities'

type ProductForm = {
  name: string
  price: number
  description: string
  active: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isTablet = useIsTablet()
  const { sortFn } = useSort<Product & Record<string, unknown>>({
    initialKey: 'name',
    initialDirection: 'asc',
  })
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: isTablet ? DEFAULT_PAGE_SIZE.tablet : DEFAULT_PAGE_SIZE.desktop,
    totalItems: 0,
  })
  const { page, pageSize, setPage } = pagination
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)
  const toast = useAppToast()
  const { query, debouncedQuery, setQuery } = useSearch({ debounceMs: 300 })
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  // Price range filter
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const form = useForm<ProductForm>({
    initialValues: { name: '', price: 0, description: '', active: true },
    validationRules: {
      name: { required: true, minLength: 1 },
      price: { required: true, min: 0 },
    },
    onSubmit: async (values) => {
      try {
        setLoading(true); setError('')
        const { productsApi } = await import('@/app/lib/api/products')
        const body = { name: values.name, price: Number(values.price || 0), description: values.description, active: values.active }
        if (editing?.id) {
          await productsApi.update(String(editing.id), body)
        } else {
          await productsApi.create(body)
        }
        await load()
        setShowModal(false)
        setEditing(null)
        form.reset()
        toast.success(SUCCESS_MESSAGES.saved)
      } catch (e: unknown) {
        const errorMessage = getLocalizedErrorMessage(e)
        setError(errorMessage)
        toast.error('저장 실패', errorMessage)
      } finally { setLoading(false) }
    },
  })

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('')
      const { productsApi } = await import('@/app/lib/api/products')
      const rows = await productsApi.list(debouncedQuery ? { search: debouncedQuery } : {})
      setProducts(Array.isArray(rows) ? rows as Product[] : [])
    } catch (e: unknown) {
      const errorMessage = getLocalizedErrorMessage(e)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery])

  useEffect(() => { load() }, [load])

  // 검색/조건 적용된 데이터
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search query
      if (debouncedQuery.trim()) {
        const qLower = debouncedQuery.trim().toLowerCase()
        const matchesName = (p.name || '').toLowerCase().includes(qLower)
        const matchesDesc = (p.description || '').toLowerCase().includes(qLower)
        if (!matchesName && !matchesDesc) return false
      }

      // Status filter
      if (statusFilter === 'active' && !p.active) return false
      if (statusFilter === 'inactive' && p.active) return false

      // Price range filter
      if (minPrice && (p.price ?? 0) < Number(minPrice)) return false
      if (maxPrice && (p.price ?? 0) > Number(maxPrice)) return false

      return true
    })
  }, [products, debouncedQuery, statusFilter, minPrice, maxPrice])

  // 정렬된 데이터
  const sortedProducts = useMemo(() => {
    return sortFn(filteredProducts as (Product & Record<string, unknown>)[])
  }, [filteredProducts, sortFn])

  // 페이지네이션된 데이터
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return sortedProducts.slice(start, end)
  }, [sortedProducts, page, pageSize])

  // totalPages 계산 (검색 결과 기준)
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))

  const handleResetFilters = () => {
    setStatusFilter('all')
    setMinPrice('')
    setMaxPrice('')
    setQuery('')
  }


  // 페이지 변경 시 검색 조건 변경으로 인해 현재 페이지가 유효 범위를 벗어나면 첫 페이지로 이동
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1)
    }
  }, [totalPages, page, setPage])

  const openCreate = () => {
    setEditing(null)
    form.reset()
    setShowModal(true)
  }

  return (
    <PageContainer maxWidth="xl" fullScreenOnTablet>
    <Stack spacing={2} sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageIntro description="판매 상품·서비스를 등록하고 관리합니다" count={filteredProducts.length} />
      <Box sx={{ flexShrink: 0 }}>
      <FilterCard>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              placeholder="상품명 또는 설명으로 검색"
              value={query}
              onChange={e => setQuery(e.target.value)}
              size="small"
              fullWidth
              sx={{
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  fontSize: { xs: '16px', md: '14px' },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="h-4 w-4 text-neutral-400" />
                  </InputAdornment>
                ),
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
              onClick={openCreate}
              sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              상품 추가
            </Button>
        </Stack>
        <Stack spacing={1}>
            <Grid container spacing={{ xs: 0.75, sm: 1.5, md: 2 }} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl size="small" fullWidth>
                <Select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  displayEmpty
                >
                  <MenuItem value="all">전체 상태</MenuItem>
                  <MenuItem value="active">활성</MenuItem>
                  <MenuItem value="inactive">비활성</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                placeholder="최소 가격"
                type="number"
                size="small"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">₩</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                placeholder="최대 가격"
                type="number"
                size="small"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">₩</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                {(statusFilter !== 'all' || minPrice || maxPrice || query) && (
                  <Button variant="ghost" onClick={handleResetFilters} size="sm">
                    초기화
                  </Button>
                )}
              </Stack>
            </Grid>
            </Grid>
        </Stack>
      </FilterCard>
      </Box>

      {error && (
        <ErrorState
          message={error}
          onRetry={load}
          retryLabel="다시 시도"
        />
      )}

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      {loading ? (
        <CardSkeleton count={8} />
      ) : (
      <Grid container spacing={{ xs: 0.75, sm: 1.5, md: 2 }}>
        {paginatedProducts.map((p) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={String(p.id)}>
            <Card hover sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1.5 }}>
              <Stack spacing={1} sx={{ flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Chip
                    label={p.active ? '활성' : '비활성'}
                    size="small"
                    color={p.active ? 'success' : 'default'}
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.625rem' }}
                  />
                </Stack>
                <Typography variant="subtitle2" component="h3" fontWeight="bold" noWrap title={p.name}>
                  {p.name}
                </Typography>
                <Typography variant="body2" color="primary.main" fontWeight="bold">
                  {formatCurrency(p.price || 0)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1, pt: 1 }}>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => { setSelected(p); setDetailOpen(true) }}
                  fullWidth
                >
                  상세보기
                </Button>
              </Stack>
            </Card>
          </Grid>
        ))}
        {filteredProducts.length === 0 && (
          <Grid item xs={12}>
            <EmptyState
              title={products.length === 0 ? "상품이 없습니다." : "검색 결과가 없습니다."}
              description={products.length === 0 ? "상품을 추가해보세요." : "다른 검색어로 시도해보세요."}
              {...(products.length === 0 && { actionLabel: "상품 추가", onAction: openCreate })}
            />
          </Grid>
        )}
      </Grid>
      )}
      </Box>

      {/* 페이지네이션 */}
      {!loading && filteredProducts.length > 0 && (
        <Box sx={{ flexShrink: 0 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="body2" color="text.secondary">
            총 {filteredProducts.length}개
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
              size="medium"
              siblingCount={1}
              shape="rounded"
              sx={{
                '& .MuiPagination-ul': {
                  flexWrap: 'nowrap',
                },
              }}
            />
          </Stack>
        </Stack>
        </Box>
      )}

      {showModal && (
        <Modal
          open={showModal}
          onClose={() => { setShowModal(false); setEditing(null) }}
          size="lg"
        >
          <ModalHeader
            title={editing ? '상품 수정' : '상품 추가'}
            description="상품의 기본 정보를 입력하세요. 이름과 가격은 필수입니다."
          />
          <ModalBody>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="이름 *"
                fullWidth
                value={form.values.name}
                onChange={e => {
                  form.setValue('name', e.target.value)
                  form.setTouched('name', true)
                }}
                onBlur={() => form.validateField('name')}
                error={Boolean(form.errors.name && form.touched.name)}
                helperText={form.errors.name && form.touched.name ? form.errors.name : undefined}
              />
              <TextField
                label="가격 *"
                fullWidth
                type="number"
                value={form.values.price}
                onChange={e => {
                  form.setValue('price', Number(e.target.value) || 0)
                  form.setTouched('price', true)
                }}
                onBlur={() => form.validateField('price')}
                error={Boolean(form.errors.price && form.touched.price)}
                helperText={form.errors.price && form.touched.price ? form.errors.price : "부가세 포함 여부는 별도 표시 기준을 따릅니다."}
                InputProps={{
                  endAdornment: <InputAdornment position="end">원</InputAdornment>,
                }}
              />
              <TextField
                label="설명 (선택)"
                fullWidth
                multiline
                rows={3}
                placeholder="간단한 특징, 용량, 구성 등을 입력하세요"
                value={form.values.description || ''}
                onChange={e => form.setValue('description', e.target.value)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.values.active}
                    onChange={e => form.setValue('active', e.target.checked)}
                  />
                }
                label="활성 상태"
              />
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false)
                setEditing(null)
                form.reset()
              }}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={() => form.handleSubmit()}
              disabled={loading || !form.isValid}
            >
              저장
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {detailOpen && (
        <Suspense fallback={null}>
          <ProductDetailModal
            open={detailOpen}
            item={selected}
            onClose={() => setDetailOpen(false)}
            onSaved={load}
            onDeleted={load}
          />
        </Suspense>
      )}

      {/* Mobile FAB */}
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 80, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: 1000,
          display: { xs: 'block', md: 'none' }
        }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={openCreate}
          aria-label="상품 추가"
          sx={{
            borderRadius: '50%',
            width: 56,
            height: 56,
            minWidth: 56,
            padding: 0,
            boxShadow: 4,
            '& .lucide': {
              margin: 0
            }
          }}
        >
          <Plus size={24} />
        </Button>
      </Box>
    </Stack>
    </PageContainer>
  )
}
