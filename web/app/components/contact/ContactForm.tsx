'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import {
    Box,
    TextField,
    Button,
    Stack,
    Alert,
    CircularProgress,
} from '@mui/material'
import { Send } from 'lucide-react'

// 글자 수 제한 상수
const LIMITS = {
    NAME: 50,
    EMAIL: 100,
    PHONE: 20,
    SUBJECT: 100,
    MESSAGE: 2000,
}

interface FormData {
    name: string
    email: string
    phone: string
    subject: string
    message: string
}

interface FormErrors {
    name?: string
    email?: string
    phone?: string
    subject?: string
    message?: string
}

export default function ContactForm() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<{
        type: 'success' | 'error'
        message: string
    } | null>(null)

    // 입력값 변경 핸들러
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        // 입력 시 해당 필드의 에러 제거
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    // 클라이언트 측 유효성 검사
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = '이름을 입력해주세요.'
        } else if (formData.name.length > LIMITS.NAME) {
            newErrors.name = `이름은 최대 ${LIMITS.NAME}자까지 입력 가능합니다.`
        }

        if (!formData.email.trim()) {
            newErrors.email = '이메일을 입력해주세요.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '올바른 이메일 형식이 아닙니다.'
        } else if (formData.email.length > LIMITS.EMAIL) {
            newErrors.email = `이메일은 최대 ${LIMITS.EMAIL}자까지 입력 가능합니다.`
        }

        if (formData.phone && formData.phone.length > LIMITS.PHONE) {
            newErrors.phone = `전화번호는 최대 ${LIMITS.PHONE}자까지 입력 가능합니다.`
        }

        if (!formData.subject.trim()) {
            newErrors.subject = '제목을 입력해주세요.'
        } else if (formData.subject.length > LIMITS.SUBJECT) {
            newErrors.subject = `제목은 최대 ${LIMITS.SUBJECT}자까지 입력 가능합니다.`
        }

        if (!formData.message.trim()) {
            newErrors.message = '문의 내용을 입력해주세요.'
        } else if (formData.message.length > LIMITS.MESSAGE) {
            newErrors.message = `문의 내용은 최대 ${LIMITS.MESSAGE}자까지 입력 가능합니다.`
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // 폼 제출 핸들러
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setSubmitStatus(null)

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch('/api/inquiries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (response.ok) {
                setSubmitStatus({
                    type: 'success',
                    message: data.message || '문의가 성공적으로 접수되었습니다.',
                })
                // 폼 초기화
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: '',
                })
            } else {
                setSubmitStatus({
                    type: 'error',
                    message: data.error || '문의 등록 중 오류가 발생했습니다.',
                })
            }
        } catch (error) {
            setSubmitStatus({
                type: 'error',
                message: '서버와의 통신 중 오류가 발생했습니다.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
                {submitStatus && (
                    <Alert severity={submitStatus.type} onClose={() => setSubmitStatus(null)}>
                        {submitStatus.message}
                    </Alert>
                )}

                <TextField
                    required
                    fullWidth
                    name="name"
                    label="이름"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={
                        errors.name || `${formData.name.length}/${LIMITS.NAME}자`
                    }
                    disabled={isSubmitting}
                    inputProps={{
                        maxLength: LIMITS.NAME,
                    }}
                />

                <TextField
                    required
                    fullWidth
                    name="email"
                    label="이메일"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={
                        errors.email || `${formData.email.length}/${LIMITS.EMAIL}자`
                    }
                    disabled={isSubmitting}
                    inputProps={{
                        maxLength: LIMITS.EMAIL,
                    }}
                />

                <TextField
                    fullWidth
                    name="phone"
                    label="전화번호 (선택)"
                    value={formData.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={
                        errors.phone || `${formData.phone.length}/${LIMITS.PHONE}자`
                    }
                    disabled={isSubmitting}
                    inputProps={{
                        maxLength: LIMITS.PHONE,
                    }}
                />

                <TextField
                    required
                    fullWidth
                    name="subject"
                    label="제목"
                    value={formData.subject}
                    onChange={handleChange}
                    error={!!errors.subject}
                    helperText={
                        errors.subject || `${formData.subject.length}/${LIMITS.SUBJECT}자`
                    }
                    disabled={isSubmitting}
                    inputProps={{
                        maxLength: LIMITS.SUBJECT,
                    }}
                />

                <TextField
                    required
                    fullWidth
                    name="message"
                    label="문의 내용"
                    multiline
                    rows={8}
                    value={formData.message}
                    onChange={handleChange}
                    error={!!errors.message}
                    helperText={
                        errors.message || `${formData.message.length}/${LIMITS.MESSAGE}자`
                    }
                    disabled={isSubmitting}
                    inputProps={{
                        maxLength: LIMITS.MESSAGE,
                    }}
                />

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send size={20} />}
                    sx={{
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #66408a 100%)',
                        },
                    }}
                >
                    {isSubmitting ? '전송 중...' : '문의하기'}
                </Button>
            </Stack>
        </Box>
    )
}
