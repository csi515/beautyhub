'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Box, Typography } from '@mui/material'
import { Wallet, PiggyBank, FileText, TrendingUp } from 'lucide-react'

const TABS = [
  { href: '/finance', label: '수입/지출', icon: Wallet },
  { href: '/finance/budget', label: '예산', icon: PiggyBank },
  { href: '/finance/reports', label: '보고서', icon: FileText },
  { href: '/finance/forecast', label: '예측', icon: TrendingUp },
] as const

export default function FinanceTabNav() {
  const pathname = usePathname()

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        borderBottom: 1,
        borderColor: 'divider',
        mb: 2,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/finance' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: { xs: 2, sm: 3 },
                py: 1.5,
                minHeight: 48,
                borderBottom: 2,
                borderColor: active ? 'primary.main' : 'transparent',
                color: active ? 'primary.main' : 'text.secondary',
                fontWeight: active ? 600 : 500,
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                '&:hover': { color: 'primary.main', bgcolor: 'action.hover' },
              }}
            >
              <Icon size={18} />
              <Typography variant="body2" component="span" fontWeight="inherit">
                {label}
              </Typography>
            </Box>
          </Link>
        )
      })}
    </Box>
  )
}
