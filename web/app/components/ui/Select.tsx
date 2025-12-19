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
        shrink: true, // Always shrink label for select to avoid overlap with value
      }}
      {...rest}
      sx={{
        '& .MuiInputBase-root': {
          borderRadius: 2, // rounded-lg
        },
        ...rest.sx
      }}
    >
      {children}
    </TextField>
  )
}
