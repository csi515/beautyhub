'use client'

import Link from 'next/link'
import { logger } from '@/app/lib/utils/logger'
import { usePathname } from 'next/navigation'
import { Container, AppBar, Toolbar, Button, Typography, Stack, Skeleton, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const res = await fetch('/api/user/me')
                if (res.ok) {
                    setIsLoggedIn(true)
                }
            } catch (error) {
                logger.error('Failed to check login status', error, 'PublicHeader')
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

                    <IconButton
                        aria-label="메뉴 열기"
                        onClick={() => setMobileMenuOpen(true)}
                        sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
                    >
                        <Menu size={24} />
                    </IconButton>

                    <Drawer
                        anchor="right"
                        open={mobileMenuOpen}
                        onClose={() => setMobileMenuOpen(false)}
                        slotProps={{ backdrop: { sx: { backdropFilter: 'blur(4px)' } } }}
                        PaperProps={{ sx: { width: 280, pt: 2 } }}
                    >
                        <List>
                            {navItems.map((item) => (
                                <ListItem key={item.href} disablePadding>
                                    <ListItemButton
                                        component={Link}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        selected={pathname === item.href}
                                        sx={{ py: 1.5, minHeight: 44 }}
                                    >
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                fontWeight: pathname === item.href ? 600 : 400,
                                                color: pathname === item.href ? 'primary.main' : 'text.primary',
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Drawer>

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
