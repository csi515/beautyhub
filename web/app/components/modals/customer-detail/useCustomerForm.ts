import { useState, useEffect, useCallback, useRef } from 'react'
import { customersApi } from '@/app/lib/api/customers'
import { useAppToast } from '@/app/lib/ui/toast'
import type { Customer } from '@/types/entities'

export function useCustomerForm(
  item: Customer | null,
  onSaved: () => void,
  onClose: () => void
) {
  const [form, setForm] = useState<Customer | null>(item)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useAppToast()
  const [features, setFeatures] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string; email?: string }>({})
  
  // 자동 저장
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (item) {
      setForm(item)
      setFeatures(item.features || '')
      setError('')
      setFieldErrors({})
    }
  }, [item])

  // 검증 함수
  const validateForm = useCallback((body: { name: string; phone?: string | null; email?: string | null }) => {
    const errors: { phone?: string; email?: string } = {}

    if (!body.name || !body.name.trim()) {
      throw new Error('이름은 필수입니다.')
    }

    if (!body.phone || !body.phone.trim()) {
      throw new Error('전화번호는 필수입니다.')
    }

    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/
    if (!phoneRegex.test(body.phone.trim())) {
      errors.phone = '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)'
    }

    if (body.email && body.email.trim()) {
      const emailRegex = /.+@.+\..+/
      if (!emailRegex.test(body.email.trim())) {
        errors.email = '올바른 이메일 형식이 아닙니다 (예: example@email.com)'
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      throw new Error(Object.values(errors)[0])
    }

    return errors
  }, [])

  // 자동 저장 함수
  const autoSave = useCallback(async () => {
    if (!form?.id) return

    try {
      setSaving(true)
      const body: { name: string; phone?: string | null; email?: string | null; address?: string | null; features?: string } = {
        name: (form.name || '').trim(),
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null
      }

      if (features && features.trim() !== '') {
        body.features = features.trim()
      }

      // 검증 (에러가 있어도 저장하지 않음)
      if (!body.name || !body.phone || !body.phone.trim()) return

      const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/
      const errors: { phone?: string; email?: string } = {}
      
      if (!phoneRegex.test(body.phone.trim())) {
        errors.phone = '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)'
      }

      if (body.email && body.email.trim()) {
        const emailRegex = /.+@.+\..+/
        if (!emailRegex.test(body.email.trim())) {
          errors.email = '올바른 이메일 형식이 아닙니다 (예: example@email.com)'
        }
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        return
      }

      await customersApi.update(form.id, body)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '저장에 실패했습니다.'
      toast.error(errorMessage)
    } finally {
      setTimeout(() => setSaving(false), 500)
    }
  }, [form, features, toast])

  // 자동 저장 트리거
  useEffect(() => {
    if (!form?.id) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave()
    }, 1000)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [form, features, autoSave])

  // 신규 고객 생성
  const createAndClose = async () => {
    if (form?.id) return

    try {
      setLoading(true)
      setError('')
      setFieldErrors({})

      if (!form) throw new Error('잘못된 입력입니다.')

      const body: { name: string; phone?: string | null; email?: string | null; address?: string | null; features?: string } = {
        name: (form.name || '').trim(),
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null
      }

      if (features && features.trim() !== '') {
        body.features = features.trim()
      }

      validateForm(body)
      await customersApi.create(body)

      onSaved()
      onClose()
      toast.success('고객이 생성되었습니다.')
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '에러가 발생했습니다.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 고객 삭제
  const removeItem = async () => {
    if (!form?.id) return

    try {
      await customersApi.delete(form.id)
      onSaved()
      onClose()
      toast.success('고객이 삭제되었습니다.')
    } catch (error) {
      const message = error instanceof Error ? error.message : '삭제에 실패했습니다.'
      toast.error(message)
    }
  }

  return {
    form,
    setForm,
    loading,
    saving,
    error,
    features,
    setFeatures,
    fieldErrors,
    createAndClose,
    removeItem,
  }
}
