'use client'

import { forwardRef } from 'react'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import clsx from 'clsx'

type EnhancedCheckboxProps = {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  helperText?: string
  error?: boolean
  disabled?: boolean
  required?: boolean
  size?: 'sm' | 'md'
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

/**
 * 개선된 체크박스 컴포넌트
 * 일관된 스타일링, 접근성, 애니메이션
 */
const EnhancedCheckbox = forwardRef<HTMLButtonElement, EnhancedCheckboxProps>(
  function EnhancedCheckbox(
    {
      checked = false,
      onChange,
      label,
      helperText,
      error = false,
      disabled = false,
      required = false,
      size = 'md',
      className = '',
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
    },
    ref
  ) {
    const checkboxId = `checkbox-${Math.random().toString(36).substr(2, 9)}`
    const helperTextId = helperText ? `${checkboxId}-helper` : undefined

    return (
      <div className={clsx('w-full', className)}>
        <FormControlLabel
          control={
            <Checkbox
              ref={ref as any}
              checked={checked}
              onChange={(e) => onChange?.(e.target.checked)}
              disabled={disabled}
              required={required}
              id={checkboxId}
              aria-label={ariaLabel || label}
              aria-describedby={ariaDescribedBy || helperTextId}
              aria-invalid={error}
              aria-required={required}
              sx={{
                padding: size === 'sm' ? '4px' : '9px',
                color: error ? 'var(--error-500)' : 'var(--primary-600)',
                '&.Mui-checked': {
                  color: error ? 'var(--error-600)' : 'var(--primary-600)',
                },
                '&.Mui-disabled': {
                  color: 'var(--neutral-400)',
                },
                '&:hover': {
                  backgroundColor: 'var(--primary-50)',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: size === 'sm' ? '1.125rem' : '1.25rem',
                  transition: 'all 0.2s ease-out',
                },
                transition: 'all 0.2s ease-out',
              }}
            />
          }
          label={
            label && (
              <span className={clsx(
                'text-sm',
                size === 'sm' && 'text-xs',
                error && 'text-error-600',
                disabled && 'text-neutral-400',
                !error && !disabled && 'text-neutral-700',
                required && 'after:content-["*"] after:ml-0.5 after:text-error-600'
              )}>
                {label}
              </span>
            )
          }
          sx={{
            margin: 0,
            '& .MuiFormControlLabel-label': {
              marginLeft: '0.5rem',
            },
          }}
        />
        {helperText && (
          <FormHelperText
            id={helperTextId}
            error={error}
            sx={{
              marginLeft: size === 'sm' ? '2.125rem' : '2.5rem',
              marginTop: '0.25rem',
              fontSize: '0.75rem',
              lineHeight: '1.25rem',
            }}
          >
            {helperText}
          </FormHelperText>
        )}
      </div>
    )
  }
)

export default EnhancedCheckbox
