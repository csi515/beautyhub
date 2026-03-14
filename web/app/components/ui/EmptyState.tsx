import { Box, Typography } from '@mui/material'
import { LucideIcon } from 'lucide-react'
import Button from './Button'

interface EmptyStateProps {
    icon?: LucideIcon
    title: string
    description?: string
    actionLabel?: string
    onAction?: () => void
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 4, sm: 5 },
            textAlign: 'center',
            color: 'text.secondary',
            minHeight: 220,
            width: '100%',
            bgcolor: 'action.hover',
            borderRadius: 3,
            border: '1px dashed',
            borderColor: 'divider',
        }}>
            {Icon && (
                <Box sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    color: 'text.disabled',
                }}>
                    <Icon size={32} strokeWidth={1.5} />
                </Box>
            )}
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5, color: 'text.primary' }}>
                {title}
            </Typography>
            {description && (
                <Typography variant="body2" sx={{ mb: 2, maxWidth: 360, color: 'text.secondary', lineHeight: 1.6 }}>
                    {description}
                </Typography>
            )}
            {actionLabel && onAction && (
                <Button variant="primary" onClick={onAction} size="md">
                    {actionLabel}
                </Button>
            )}
        </Box>
    )
}
