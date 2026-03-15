'use client'

import { Box, Paper, Stack, Button, Chip } from '@mui/material'
import { X } from 'lucide-react'

interface BulkActionBarProps {
    selectedCount: number
    onClearSelection: () => void
    onBulkAction?: (action: string) => void
}

export default function BulkActionBar({ selectedCount, onClearSelection, onBulkAction }: BulkActionBarProps) {
    if (selectedCount === 0) return null

    return (
        <Paper
            elevation={3}
            sx={{
                position: 'fixed',
                bottom: 24,
                left: { xs: 16, sm: '50%' },
                right: { xs: 16, sm: 'auto' },
                transform: { xs: 'none', sm: 'translateX(-50%)' },
                zIndex: 1000,
                px: { xs: 2, sm: 3 },
                py: 2,
                borderRadius: 3,
                maxWidth: { xs: '100%', sm: 480 },
            }}
        >
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="nowrap" sx={{ minWidth: 0 }}>
                <Chip
                    label={`${selectedCount}개 선택됨`}
                    color="primary"
                    onDelete={onClearSelection}
                    deleteIcon={<X size={16} />}
                    sx={{ flexShrink: 0 }}
                />
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onBulkAction?.('adjust')}
                    sx={{ flexShrink: 0 }}
                >
                    일괄 조정
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => onBulkAction?.('delete')}
                    sx={{ flexShrink: 0 }}
                >
                    선택 삭제
                </Button>
            </Stack>
        </Paper>
    )
}
