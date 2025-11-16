'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useState } from 'react'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ''
  const isPublic = pathname === '/login' || pathname.startsWith('/auth') || pathname.startsWith('/reset-password') || pathname === '/update-password'
  const [navOpen, setNavOpen] = useState(false)
  if (isPublic) {
    return <>{children}</>
  }
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <TopBar onMenu={() => setNavOpen(true)} />
        <main className="container py-2 px-2 sm:py-2 sm:px-3 md:py-3 md:px-4">
          <div className="grid gap-2 sm:gap-3">
            {children}
          </div>
        </main>
      </div>
      {navOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-overlay-60" onClick={() => setNavOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80vw] bg-white shadow-soft border-r border-neutral-100">
            <Sidebar mobile onNavigate={() => setNavOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}


