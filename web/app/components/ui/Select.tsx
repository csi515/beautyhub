'use client'

import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField'

type Props = TextFieldProps & {
  label?: string
  options?: { value: string | number; label: string }[]
}

export default function Select({
  label,
  className,
  children,
  ...rest
}: Props) {
  // Use TextField with select prop. 
  // We use SelectProps={{ native: true }} to support existing <option> children passed from parent.
  // This ensures we don't break existing usages while replacing styling with MUI.

  return (
    <TextField
      select
      label={label}
      variant="outlined"
      fullWidth
      SelectProps={{
        native: true,
      }}
      InputLabelProps={{
        shrink: true,
      }}
      {...rest}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 'var(--radius-md)',
          transition: 'all 0.2s ease-out',
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--neutral-400)',
            },
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--primary-500)',
              borderWidth: '2px',
            },
            boxShadow: 'var(--input-shadow-focus)',
          },
          '&.Mui-error': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--error-500)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
            },
          },
        },
        '& .MuiSelect-select': {
          padding: '0.625rem 0.875rem',
        },
        ...rest.sx
      }}
    >
      {children}
    </TextField>
  )
}
