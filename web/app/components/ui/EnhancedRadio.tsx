'use client'

import { forwardRef } from 'react'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import FormHelperText from '@mui/material/FormHelperText'
import clsx from 'clsx'

type RadioOption = {
  value: string | number
  label: string
  disabled?: boolean
}

type EnhancedRadioProps = {
  value?: string | number
  onChange?: (value: string | number) => void
  options: RadioOption[]
  label?: string
  helperText?: string
  error?: boolean
  disabled?: boolean
  required?: boolean
  size?: 'sm' | 'md'
  row?: boolean
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

/**
 * 개선된 라디오 버튼 컴포넌트
 * 일관된 스타일링, 접근성, 애니메이션
 */
const EnhancedRadio = forwardRef<HTMLFieldSetElement, EnhancedRadioProps>(
  function EnhancedRadio(
    {
      value,
      onChange,
      options,
      label,
      helperText,
      error = false,
      disabled = false,
      required = false,
      size = 'md',
      row = false,
      className = '',
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
    },
    ref
  ) {
    const radioGroupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`
    const helperTextId = helperText ? `${radioGroupId}-helper` : undefined

    return (
      <FormControl
        ref={ref}
        component="fieldset"
        error={error}
        disabled={disabled}
        required={required}
        className={clsx('w-full', className)}
        aria-label={ariaLabel || label}
        aria-describedby={ariaDescribedBy || helperTextId}
      >
        {label && (
          <FormLabel
            component="legend"
            sx={{
              fontSize: size === 'sm' ? '0.75rem' : '0.875rem',
              fontWeight: 500,
              color: error ? 'var(--error-600)' : 'var(--neutral-700)',
              marginBottom: '0.5rem',
              '&.Mui-required': {
                '&::after': {
                  content: '"*"',
                  marginLeft: '0.25rem',
                  color: 'var(--error-600)',
                },
              },
            }}
          >
            {label}
          </FormLabel>
        )}
        <RadioGroup
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          row={row}
          aria-labelledby={label ? `${radioGroupId}-label` : undefined}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={
                <Radio
                  size={size === 'sm' ? 'small' : 'medium'}
                  sx={{
                    color: error ? 'var(--error-500)' : 'var(--primary-600)',
                    '&.Mui-checked': {
                      color: error ? 'var(--error-600)' : 'var(--primary-600)',
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
                <span className={clsx(
                  'text-sm',
                  size === 'sm' && 'text-xs',
                  error && 'text-error-600',
                  disabled && 'text-neutral-400',
                  !error && !disabled && 'text-neutral-700'
                )}>
                  {option.label}
                </span>
              }
              disabled={!!(disabled || option.disabled)}
              sx={{
                marginRight: row ? '1.5rem' : 0,
                marginBottom: row ? 0 : '0.5rem',
              }}
            />
          ))}
        </RadioGroup>
        {helperText && (
          <FormHelperText
            id={helperTextId}
            error={error}
            sx={{
              marginTop: '0.25rem',
              fontSize: '0.75rem',
              lineHeight: '1.25rem',
            }}
          >
            {helperText}
          </FormHelperText>
        )}
      </FormControl>
    )
  }
)

export default EnhancedRadio
