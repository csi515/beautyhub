'use client'

import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

interface Props {
    checked: boolean
    onChange: (checked: boolean) => void
    label?: string
    disabled?: boolean
    className?: string
}

export default function ToggleSwitch({
    checked,
    onChange,
    label,
    disabled = false,
    className = '',
}: Props) {
    return (
        <FormControlLabel
            control={
                <Switch
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                    color="primary" // Uses theme primary color
                />
            }
            label={label}
            className={className} // Applies to the FormControlLabel container (label element)
            sx={{
                mr: 0, // Reset unexpected margin
                '& .MuiTypography-root': {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'text.primary'
                }
            }}
        />
    )
}
