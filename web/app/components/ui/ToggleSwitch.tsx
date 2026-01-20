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
    const switchId = `switch-${Math.random().toString(36).substr(2, 9)}`
    
    return (
        <FormControlLabel
            control={
                <Switch
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                    color="primary"
                    id={switchId}
                    aria-label={label || '토글 스위치'}
                    sx={{
                        '& .MuiSwitch-switchBase': {
                            transition: 'all 0.2s ease-out',
                            '&:hover': {
                                backgroundColor: 'var(--primary-50)',
                            },
                        },
                        '& .MuiSwitch-thumb': {
                            transition: 'all 0.2s ease-out',
                            boxShadow: 'var(--shadow-sm)',
                        },
                        '& .MuiSwitch-track': {
                            transition: 'all 0.2s ease-out',
                        },
                        '&.Mui-checked': {
                            '& .MuiSwitch-thumb': {
                                boxShadow: 'var(--shadow-md)',
                            },
                        },
                        '&:focus-visible': {
                            '& .MuiSwitch-thumb': {
                                outline: '2px solid var(--primary-500)',
                                outlineOffset: '2px',
                            },
                        },
                    }}
                />
            }
            label={label}
            className={className}
            sx={{
                mr: 0,
                minHeight: { xs: '44px', sm: 'auto' },
                '& .MuiTypography-root': {
                    fontSize: { xs: '0.9375rem', sm: '0.875rem' },
                    fontWeight: 500,
                    color: disabled ? 'var(--neutral-400)' : 'var(--neutral-700)',
                    transition: 'color 0.2s ease-out',
                },
                '& .MuiSwitch-root': {
                    '& .MuiSwitch-switchBase': {
                        padding: { xs: '9px', sm: '9px' },
                    },
                    '& .MuiSwitch-thumb': {
                        width: { xs: '22px', sm: '20px' },
                        height: { xs: '22px', sm: '20px' },
                    },
                },
            }}
        />
    )
}
