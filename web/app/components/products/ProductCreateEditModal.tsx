'use client'

import { useState, useEffect } from 'react'
import SwipeableModal, { SwipeableModalBody, SwipeableModalFooter, SwipeableModalHeader } from '../ui/SwipeableModal'
import Button from '../ui/Button'
import { Stack, TextField, InputAdornment, FormControlLabel, Checkbox } from '@mui/material'
import { useForm } from '@/app/lib/hooks/useForm'
import { useAppToast } from '@/app/lib/ui/toast'
import type { Product } from '@/types/entities'

type ProductForm = {
  name: string
  price: number
  description: string
  active: boolean
}

type Props = {
  open: boolean
  onClose: () => void
  editing: Product | null
  onSaved: () => void
}

export default function ProductCreateEditModal({ open, onClose, editing, onSaved }: Props) {
  const toast = useAppToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<ProductForm>({
    initialValues: { name: '', price: 0, description: '', active: true },
    validationRules: {
      name: { required: true, minLength: 1 },
      price: { required: true, min: 0 },
    },
    onSubmit: async (values) => {
      try {
        setLoading(true)
        const { productsApi } = await import('@/app/lib/api/products')
        const body = { 
          name: values.name, 
          price: Number(values.price || 0), 
          description: values.description, 
          active: values.active 
        }
        if (editing?.id) {
          await productsApi.update(String(editing.id), body)
        } else {
          await productsApi.create(body)
        }
        onSaved()
        onClose()
        form.reset()
        toast.success('제품이 저장되었습니다.')
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : '에러가 발생했습니다.'
        toast.error('저장 실패', errorMessage)
      } finally {
        setLoading(false)
      }
    },
  })

  useEffect(() => {
    if (open && editing) {
      form.setValue('name', editing.name || '')
      form.setValue('price', editing.price || 0)
      form.setValue('description', editing.description || '')
      form.setValue('active', editing.active !== false)
    } else if (open && !editing) {
      form.reset()
    }
  }, [open, editing])

  const handleClose = () => {
    if (!loading) {
      form.reset()
      onClose()
    }
  }

  return (
    <SwipeableModal
      open={open}
      onClose={handleClose}
      size="fullscreen"
    >
      <SwipeableModalHeader
        title={editing ? '제품 수정' : '제품 추가'}
        description="제품의 기본 정보를 입력하세요. 이름과 가격은 필수입니다."
        onClose={handleClose}
      />
      <SwipeableModalBody>
        <Stack spacing={{ xs: 2.5, sm: 3 }} sx={{ mt: 1 }}>
          <TextField
            label="이름"
            fullWidth
            required
            value={form.values.name}
            onChange={e => {
              form.setValue('name', e.target.value)
              form.setTouched('name', true)
            }}
            onBlur={() => form.validateField('name')}
            error={Boolean(form.errors.name && form.touched.name)}
            helperText={form.errors.name && form.touched.name ? form.errors.name : undefined}
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
            label="가격"
            fullWidth
            required
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
            label="설명 (선택)"
            fullWidth
            multiline
            rows={3}
            placeholder="간단한 특징, 용량, 구성 등을 입력하세요"
            value={form.values.description || ''}
            onChange={e => form.setValue('description', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: { xs: '16px', sm: '14px' },
              },
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.values.active}
                onChange={e => form.setValue('active', e.target.checked)}
                sx={{
                  '& .MuiSvgIcon-root': {
                    fontSize: { xs: '24px', sm: '24px' },
                  },
                }}
              />
            }
            label="활성 상태"
            sx={{
              minHeight: '44px',
              '& .MuiFormControlLabel-label': {
                fontSize: { xs: '0.9375rem', sm: '1rem' },
              },
            }}
          />
        </Stack>
      </SwipeableModalBody>
      <SwipeableModalFooter>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={loading}
          fullWidth
          sx={{ 
            minHeight: '44px', 
            fontSize: { xs: '0.9375rem', sm: '1rem' }
          }}
        >
          취소
        </Button>
        <Button
          variant="primary"
          onClick={() => form.handleSubmit()}
          disabled={loading || !form.isValid}
          fullWidth
          sx={{ 
            minHeight: '44px', 
            fontSize: { xs: '0.9375rem', sm: '1rem' }
          }}
        >
          저장
        </Button>
      </SwipeableModalFooter>
    </SwipeableModal>
  )
}
