'use client'

import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Stack,
    Typography,
} from '@mui/material'
import FilterAccordion from '../common/FilterAccordion'

export interface InventoryFilters {
    status: string
    minPrice: string
    maxPrice: string
    minStock: string
    maxStock: string
}

interface FilterPanelProps {
    filters: InventoryFilters
    onFilterChange: (filters: InventoryFilters) => void
    onReset: () => void
}

export default function FilterPanel({ filters, onFilterChange, onReset }: FilterPanelProps) {
    const handleChange = (key: keyof InventoryFilters, value: string) => {
        onFilterChange({
            ...filters,
            [key]: value
        })
    }

    const activeFilterCount = Object.values(filters).filter(v => v !== '').length

    return (
        <FilterAccordion
            title="필터"
            activeFilterCount={activeFilterCount}
            onReset={onReset}
        >
                    {/* Status Filter */}
                    <FormControl fullWidth size="small">
                        <InputLabel shrink>재고 상태</InputLabel>
                        <Select
                            value={filters.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            label="재고 상태"
                            sx={{
                                minHeight: { xs: '44px', sm: 'auto' },
                                '& .MuiSelect-select': {
                                    fontSize: { xs: '16px', sm: '14px' },
                                },
                            }}
                        >
                            <MenuItem value="" sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>전체</MenuItem>
                            <MenuItem value="normal" sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>정상</MenuItem>
                            <MenuItem value="low_stock" sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>재고 부족</MenuItem>
                            <MenuItem value="out_of_stock" sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>품절</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Price Range */}
                    <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom display="block" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                            가격 범위
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                                size="small"
                                type="number"
                                placeholder="최소"
                                value={filters.minPrice}
                                onChange={(e) => handleChange('minPrice', e.target.value)}
                                fullWidth
                                inputProps={{
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                    style: { fontSize: '16px' },
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: { xs: '44px', sm: 'auto' },
                                        fontSize: { xs: '16px', sm: '14px' },
                                    },
                                }}
                            />
                            <Typography sx={{ alignSelf: 'center', fontSize: { xs: '0.875rem', sm: '1rem' } }}>-</Typography>
                            <TextField
                                size="small"
                                type="number"
                                placeholder="최대"
                                value={filters.maxPrice}
                                onChange={(e) => handleChange('maxPrice', e.target.value)}
                                fullWidth
                                inputProps={{
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                    style: { fontSize: '16px' },
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: { xs: '44px', sm: 'auto' },
                                        fontSize: { xs: '16px', sm: '14px' },
                                    },
                                }}
                            />
                        </Stack>
                    </Box>

                    {/* Stock Range */}
                    <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom display="block" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                            재고 수량 범위
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                                size="small"
                                type="number"
                                placeholder="최소"
                                value={filters.minStock}
                                onChange={(e) => handleChange('minStock', e.target.value)}
                                fullWidth
                                inputProps={{
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                    style: { fontSize: '16px' },
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: { xs: '44px', sm: 'auto' },
                                        fontSize: { xs: '16px', sm: '14px' },
                                    },
                                }}
                            />
                            <Typography sx={{ alignSelf: 'center', fontSize: { xs: '0.875rem', sm: '1rem' } }}>-</Typography>
                            <TextField
                                size="small"
                                type="number"
                                placeholder="최대"
                                value={filters.maxStock}
                                onChange={(e) => handleChange('maxStock', e.target.value)}
                                fullWidth
                                inputProps={{
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                    style: { fontSize: '16px' },
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: { xs: '44px', sm: 'auto' },
                                        fontSize: { xs: '16px', sm: '14px' },
                                    },
                                }}
                            />
                        </Stack>
                    </Box>
        </FilterAccordion>
    )
}
