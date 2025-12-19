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
    return (
        <div className={clsx('relative inline-block', className)}>
            <Tooltip title={content} arrow enterTouchDelay={0}>
                <IconButton size="small" tabIndex={0} sx={{ padding: 0.5 }}>
                    <Info className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />
                </IconButton>
            </Tooltip>
        </div>
    )
}
