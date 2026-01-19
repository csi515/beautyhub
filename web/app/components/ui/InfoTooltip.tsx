import { ReactNode } from 'react'
import { Info } from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import clsx from 'clsx'

interface Props {
    content: string | ReactNode
    className?: string
}

export default function InfoTooltip({ content, className = '' }: Props) {
    const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`
    
    return (
        <div className={clsx('relative inline-block', className)}>
            <Tooltip
                title={content}
                arrow
                enterTouchDelay={0}
                enterDelay={300}
                leaveDelay={0}
                TransitionProps={{
                    timeout: { enter: 200, exit: 150 },
                }}
                slotProps={{
                    tooltip: {
                        sx: {
                            bgcolor: 'var(--neutral-800)',
                            color: 'white',
                            fontSize: '0.75rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-lg)',
                            maxWidth: '280px',
                            '& .MuiTooltip-arrow': {
                                color: 'var(--neutral-800)',
                            },
                        },
                    },
                }}
            >
                <IconButton
                    size="small"
                    tabIndex={0}
                    aria-label="도움말 정보"
                    aria-describedby={tooltipId}
                    sx={{
                        padding: 0.5,
                        color: 'var(--neutral-400)',
                        transition: 'all 0.2s ease-out',
                        '&:hover': {
                            color: 'var(--primary-600)',
                            backgroundColor: 'var(--primary-50)',
                            transform: 'scale(1.1)',
                        },
                        '&:focus-visible': {
                            outline: '2px solid var(--primary-500)',
                            outlineOffset: '2px',
                            borderRadius: 'var(--radius-sm)',
                        },
                    }}
                >
                    <Info className="w-4 h-4" />
                </IconButton>
            </Tooltip>
        </div>
    )
}
