'use client'

import { ThemeProvider } from './lib/context/ThemeContext'
import { AuthProvider } from './components/AuthProvider'
import { ToastProvider } from './components/ui/Toast'
import { QueryProvider } from './lib/providers/QueryProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  )
}


