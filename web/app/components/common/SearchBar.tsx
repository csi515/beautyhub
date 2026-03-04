'use client'

import { useState, useEffect } from 'react'
import { TextField, InputAdornment, IconButton } from '@mui/material'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/app/lib/hooks/useDebounce'

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    fullWidth?: boolean
    debounceMs?: number
    size?: 'small' | 'medium'
}

/**
 * 공통 SearchBar 컴포넌트
 * 검색 입력과 자동 debounce 기능 제공
 */
export default function SearchBar({
    value,
    onChange,
    placeholder = '검색...',
    fullWidth = true,
    debounceMs = 300,
    size = 'small',
}: SearchBarProps) {
    const [localValue, setLocalValue] = useState(value)
    const debouncedValue = useDebounce(localValue, debounceMs)

    useEffect(() => {
        setLocalValue(value)
    }, [value])

    useEffect(() => {
        if (debouncedValue !== value) {
            onChange(debouncedValue)
        }
    }, [debouncedValue, onChange, value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value)
    }

    const handleClear = () => {
        setLocalValue('')
        onChange('')
    }

    return (
        <TextField
            value={localValue}
            onChange={handleChange}
            placeholder={placeholder}
            fullWidth={fullWidth}
            size={size}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <Search size={20} />
                    </InputAdornment>
                ),
                endAdornment: localValue && (
                    <InputAdornment position="end">
                        <IconButton size="small" onClick={handleClear} edge="end">
                            <X size={18} />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    )
}
