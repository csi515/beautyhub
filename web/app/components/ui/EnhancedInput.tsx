'use client'

import { forwardRef, ReactNode } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import type { TextFieldProps } from '@mui/material/TextField'
import clsx from 'clsx'

type EnhancedInputProps = Omit<TextFieldProps, 'variant' | 'error' | 'helperText'> & {
  error?: boolean | string
  helperText?: string
  helpText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

/**
 * 개선된 입력 필드 컴포넌트
 * 현대적인 디자인, 일관된 스타일링, 향상된 포커스 상태
 */
const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(function EnhancedInput(
  {
    error = false,
    helperText,
    helpText,
    leftIcon,
    rightIcon,
    size = 'md',
    InputProps,
    className,
    sx,
    ...rest
  },
  ref
) {
  const isError = Boolean(error)
  const errorMessage = typeof error === 'string' ? error : (helperText || helpText)

  const sizeConfig: Record<'sm' | 'md' | 'lg', { height: number; fontSize: string; padding: string }> = {
    sm: { height: 36, fontSize: '0.875rem', padding: '0.5rem 0.75rem' },
    md: { height: 40, fontSize: '1rem', padding: '0.625rem 0.875rem' },
    lg: { height: 44, fontSize: '1rem', padding: '0.75rem 1rem' },
  }

  const config = sizeConfig[size as 'sm' | 'md' | 'lg']

  return (
    <TextField
      ref={ref}
      error={isError}
      helperText={errorMessage}
      variant="outlined"
      className={clsx('w-full', className)}
      InputProps={{
        ...InputProps,
        startAdornment: leftIcon ? (
          <InputAdornment position="start">{leftIcon}</InputAdornment>
        ) : InputProps?.startAdornment,
        endAdornment: rightIcon ? (
          <InputAdornment position="end">{rightIcon}</InputAdornment>
        ) : InputProps?.endAdornment,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          height: config.height,
          fontSize: config.fontSize,
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'white',
          borderColor: isError ? 'var(--error-300)' : 'var(--neutral-300)',
          transition: 'all 0.2s ease-out',
          '&:hover': {
            borderColor: isError ? 'var(--error-400)' : 'var(--neutral-400)',
          },
          '&.Mui-focused': {
            borderColor: isError ? 'var(--error-500)' : 'var(--primary-500)',
            boxShadow: isError
              ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
              : 'var(--input-shadow-focus)',
          },
          '&.Mui-error': {
            borderColor: 'var(--error-500)',
          },
        },
        '& .MuiInputBase-input': {
          padding: config.padding,
        },
        '& .MuiFormHelperText-root': {
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          lineHeight: '1.25rem',
        },
        ...sx,
      }}
      {...rest}
    />
  )
})

export default EnhancedInput
