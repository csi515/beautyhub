'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'

type SnackbarType = 'success' | 'error' | 'info' | 'warning'

type SnackbarState = {
    open: boolean
    message: string
    type: SnackbarType
}

type SnackbarContextType = {
    showSnackbar: (message: string, type: SnackbarType) => void
    showSuccess: (message: string) => void
    showError: (message: string) => void
    showInfo: (message: string) => void
    showWarning: (message: string) => void
}

const SnackbarContext = createContext<SnackbarContextType | null>(null)

export function SnackbarProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<SnackbarState>({
        open: false,
        message: '',
        type: 'success'
    })

    const showSnackbar = useCallback((message: string, type: SnackbarType) => {
        setState({ open: true, message, type })
    }, [])

    const showSuccess = useCallback((message: string) => showSnackbar(message, 'success'), [showSnackbar])
    const showError = useCallback((message: string) => showSnackbar(message, 'error'), [showSnackbar])
    const showInfo = useCallback((message: string) => showSnackbar(message, 'info'), [showSnackbar])
    const showWarning = useCallback((message: string) => showSnackbar(message, 'warning'), [showSnackbar])

    const handleClose = () => {
        setState(prev => ({ ...prev, open: false }))
    }

    const iconMap = {
        success: <CheckCircle className="h-5 w-5" />,
        error: <XCircle className="h-5 w-5" />,
        info: <Info className="h-5 w-5" />,
        warning: <AlertTriangle className="h-5 w-5" />
    }

    return (
        <SnackbarContext.Provider value={{ showSnackbar, showSuccess, showError, showInfo, showWarning }}>
            {children}
            <Snackbar
                open={state.open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                }}
                sx={{
                    '& .MuiSnackbar-root': {
                        bottom: { 
                            xs: 'calc(64px + env(safe-area-inset-bottom, 0px) + 72px)', 
                            md: 24 
                        },
                        zIndex: 1101, // 하단 네비게이션 위
                    }
                }}
            >
                <Alert
                    onClose={handleClose}
                    severity={state.type}
                    variant="filled"
                    icon={iconMap[state.type]}
                    sx={{
                        width: '100%',
                        minWidth: { xs: '90vw', sm: 400 },
                        boxShadow: 3,
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}
                >
                    {state.message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    )
}

export function useSnackbar() {
    const context = useContext(SnackbarContext)
    if (!context) {
        throw new Error('useSnackbar must be used within SnackbarProvider')
    }
    return context
}
