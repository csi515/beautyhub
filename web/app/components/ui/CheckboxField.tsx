'use client'

import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import Stack from '@mui/material/Stack'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  helperText?: string
}

export default function CheckboxField({
  checked,
  onChange,
  label,
  disabled = false,
  helperText,
}: Props) {
  return (
    <Stack spacing={0.5}>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            disabled={disabled}
          />
        }
        label={label}
      />
      {helperText ? <FormHelperText sx={{ ml: 1 }}>{helperText}</FormHelperText> : null}
    </Stack>
  )
}
