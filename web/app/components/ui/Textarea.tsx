'use client'

import React from 'react'
import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField'

type Props = Omit<TextFieldProps, 'variant'> & {
  label?: string
  helpText?: string
  variant?: 'outlined' | 'filled' | 'standard'
}

const Textarea = React.forwardRef<HTMLDivElement, Props>(
  ({ label, helpText, error, className, required, variant = 'outlined', ...rest }, ref) => {
    return (
      <TextField
        inputRef={ref}
        label={label}
        multiline
        minRows={3}
        variant={variant}
        error={!!error}
        helperText={error ? error : helpText}
        fullWidth
        required={required}
        className={className} // Can affect container
        sx={{
          '& .MuiInputBase-root': {
            borderRadius: 2
          }
        }}
        {...rest}
      />
    )
  },
)

Textarea.displayName = 'Textarea'

export default Textarea
