'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container, AppBar, Toolbar, Button, Typography, Stack, Skeleton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'

const navItems = [
    { href: '/', label: '홈' },
    { href: '/features', label: '기능' },
    { href: '/guides', label: '가이드' },
    { href: '/faq', label: 'FAQ' },
]

export default function PublicHeader() {
    const pathname = usePathname()
    const theme = useTheme()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const res = await fetch('/api/user/me')
                if (res.ok) {
                    setIsLoggedIn(true)
                }
            } catch (error) {
                console.error('Failed to check login status', error)
            } finally {
                setIsLoading(false)
            }
        }
        checkLoginStatus()
    }, [])

    return (
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mr: 4
                            }}
                        >
                            BeautyHub
                        </Typography>
                    </Link>

                    <Stack direction="row" spacing={1} sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {navItems.map((item) => (
                            <Button
                                key={item.href}
                                component={Link}
                                href={item.href}
                                sx={{
                                    color: pathname === item.href ? 'primary.main' : 'text.primary',
                                    fontWeight: pathname === item.href ? 600 : 400,
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Stack>

                    <Stack direction="row" spacing={2}>
                        {isLoading ? (
                            <Skeleton variant="rectangular" width={150} height={36} sx={{ borderRadius: 1 }} />
                        ) : isLoggedIn ? (
                            <Button component={Link} href="/dashboard" variant="contained" size="small">
                                대시보드
                            </Button>
                        ) : (
                            <>
                                <Button component={Link} href="/login" variant="outlined" size="small">
                                    로그인
                                </Button>
                                <Button component={Link} href="/signup" variant="contained" size="small">
                                    회원가입
                                </Button>
                            </>
                        )}
                    </Stack>
                </Toolbar>
            </Container>
        </AppBar>
    )
}
