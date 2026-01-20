import React from 'react'
import { Box, Card, Typography, Divider, Chip, Stack } from '@mui/material'
import { ChevronRight } from 'lucide-react'

export interface MobileDataCardProps {
    title: React.ReactNode
    subtitle?: React.ReactNode
    status?: {
        label: string
        color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
    }
    content?: React.ReactNode
    onClick?: () => void
    action?: React.ReactNode
}

export default function MobileDataCard({
    title,
    subtitle,
    status,
    content,
    onClick,
    action
}: MobileDataCardProps) {
    return (
        <Card
            elevation={0}
            sx={{
                p: { xs: 1.5, sm: 2 },
                mb: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                '&:active': onClick ? { 
                    transform: 'scale(0.98)',
                    bgcolor: 'action.hover' 
                } : {},
                minHeight: onClick ? '80px' : 'auto'
            }}
            onClick={onClick}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                    <Typography 
                        variant="subtitle1" 
                        fontWeight={600}
                        sx={{
                            fontSize: { xs: '0.9375rem', sm: '1rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                mt: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {status && (
                    <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                        sx={{ 
                            height: { xs: 22, sm: 24 }, 
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }, 
                            fontWeight: 600,
                            flexShrink: 0
                        }}
                    />
                )}
            </Box>

            {content && (
                <Box sx={{ mt: 1.5 }}>
                    {content}
                </Box>
            )}

            {(action || onClick) && (
                <>
                    <Divider sx={{ my: { xs: 1, sm: 1.5 } }} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minHeight: '44px' }}>
                        {action}
                        {onClick && !action && (
                            <Stack 
                                direction="row" 
                                spacing={0.5} 
                                alignItems="center"
                                sx={{ minHeight: '44px', px: 1 }}
                            >
                                <Typography 
                                    variant="caption" 
                                    color="primary.main" 
                                    fontWeight={600}
                                    sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                                >
                                    상세보기
                                </Typography>
                                <ChevronRight size={16} className="text-blue-600" />
                            </Stack>
                        )}
                    </Box>
                </>
            )}
        </Card>
    )
}
