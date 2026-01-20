import { Box, Typography, Button } from '@mui/material'
import { LucideIcon } from 'lucide-react'

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
            p: { xs: 3, sm: 4 },
            textAlign: 'center',
            color: 'text.secondary',
            minHeight: { xs: 160, sm: 200 },
            width: '100%',
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider'
        }}>
            {Icon && (
                <Icon 
                    size={48} 
                    style={{ 
                        marginBottom: 16, 
                        opacity: 0.5,
                        width: 'clamp(40px, 12vw, 48px)',
                        height: 'clamp(40px, 12vw, 48px)'
                    }} 
                />
            )}
            <Typography 
                variant="h6" 
                gutterBottom 
                color="text.primary"
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
                {title}
            </Typography>
            {description && (
                <Typography 
                    variant="body2" 
                    mb={3} 
                    maxWidth={400}
                    sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
                >
                    {description}
                </Typography>
            )}
            {actionLabel && onAction && (
                <Button 
                    variant="contained" 
                    onClick={onAction}
                    sx={{ 
                        minHeight: '44px',
                        fontSize: { xs: '0.9375rem', sm: '1rem' }
                    }}
                >
                    {actionLabel}
                </Button>
            )}
        </Box>
    )
}
