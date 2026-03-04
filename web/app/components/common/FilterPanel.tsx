'use client'

import {
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Stack,
    Chip,
    Button
} from '@mui/material'
import { ChevronDown, RotateCcw } from 'lucide-react'

export interface FilterField {
    key: string
    label: string
    type: 'select' | 'text' | 'number' | 'range' | 'date'
    options?: { value: string; label: string }[]
    placeholder?: string
}

export interface FilterPanelProps<T extends Record<string, string>> {
    filters: T
    onFilterChange: (filters: T) => void
    onReset: () => void
    fields: FilterField[]
    title?: string
}

/**
 * 공통 FilterPanel 컴포넌트
 * 다양한 필터 필드를 동적으로 생성하여 표시
 */
export default function FilterPanel<T extends Record<string, string>>({
    filters,
    onFilterChange,
    onReset,
    fields,
    title = '필터',
}: FilterPanelProps<T>) {
    const handleChange = (key: string, value: string) => {
        onFilterChange({
            ...filters,
            [key]: value,
        } as T)
    }

    const activeFilterCount = Object.values(filters).filter(v => v !== '' && v !== null && v !== undefined).length
    const hasActiveFilters = activeFilterCount > 0

    const renderField = (field: FilterField) => {
        switch (field.type) {
            case 'select':
                return (
                    <FormControl fullWidth size="small" key={field.key}>
                        <InputLabel>{field.label}</InputLabel>
                        <Select
                            value={filters[field.key] || ''}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            label={field.label}
                        >
                            <MenuItem value="">전체</MenuItem>
                            {field.options?.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )

            case 'range':
                // range는 min/max 두 개의 필드로 구성
                // inventory 페이지의 경우 minPrice/maxPrice, minStock/maxStock 형태
                const minKey = field.key === 'price' ? 'minPrice' : field.key === 'stock' ? 'minStock' : `${field.key}Min`
                const maxKey = field.key === 'price' ? 'maxPrice' : field.key === 'stock' ? 'maxStock' : `${field.key}Max`
                return (
                    <Box key={field.key}>
                        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                            {field.label}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <TextField
                                size="small"
                                type="number"
                                placeholder={field.placeholder || '최소'}
                                value={filters[minKey] || ''}
                                onChange={(e) => handleChange(minKey, e.target.value)}
                                fullWidth
                            />
                            <Typography sx={{ alignSelf: 'center' }}>-</Typography>
                            <TextField
                                size="small"
                                type="number"
                                placeholder={field.placeholder || '최대'}
                                value={filters[maxKey] || ''}
                                onChange={(e) => handleChange(maxKey, e.target.value)}
                                fullWidth
                            />
                        </Stack>
                    </Box>
                )

            case 'text':
            case 'number':
            case 'date':
                return (
                    <TextField
                        key={field.key}
                        size="small"
                        type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                        label={field.label}
                        {...(field.placeholder ? { placeholder: field.placeholder } : {})}
                        value={filters[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        fullWidth
                    />
                )

            default:
                return null
        }
    }

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ChevronDown />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" fontWeight={600}>
                        {title}
                    </Typography>
                    {hasActiveFilters && (
                        <Chip label={`${activeFilterCount}개 적용됨`} size="small" color="primary" />
                    )}
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                <Stack spacing={2}>
                    {fields.map((field) => renderField(field))}

                    {/* Reset Button */}
                    {hasActiveFilters && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<RotateCcw size={16} />}
                            onClick={onReset}
                        >
                            필터 초기화
                        </Button>
                    )}
                </Stack>
            </AccordionDetails>
        </Accordion>
    )
}
