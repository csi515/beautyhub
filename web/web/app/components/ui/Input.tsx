'use client'

import { forwardRef, ReactNode } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import type { TextFieldProps } from '@mui/material/TextField'

type Props = Omit<TextFieldProps, 'variant' | 'error' | 'helperText'> & {
  error?: boolean | string  // string 허용으로 확장
  helperText?: string
  helpText?: string  // 하위 호환성을 위한 별칭
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  {
    error = false,
    helperText,
    helpText, // 하위 호환성
    leftIcon,
    rightIcon,
    InputProps,
    ...rest
  },
  ref
) {
  // error가 string인 경우 (기존 호환성) boolean으로 변환하고 helperText로 사용
  const isError = Boolean(error)
  const errorMessage = typeof error === 'string' ? error : (helperText || helpText)

  return (
    <TextField
      ref={ref}
      error={isError}
      helperText={errorMessage}
      variant="outlined"
      InputProps={{
        ...InputProps,
        startAdornment: leftIcon ? <InputAdornment position="start">{leftIcon}</InputAdornment> : InputProps?.startAdornment,
        endAdornment: rightIcon ? <InputAdornment position="end">{rightIcon}</InputAdornment> : InputProps?.endAdornment,
      }}
      {...rest}
    />
  )
})

export default Input
