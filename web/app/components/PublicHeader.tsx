'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container, AppBar, Toolbar, Button, Typography, Stack, Skeleton, IconButton, Drawer, Box, List, ListItem } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

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
                console.error('Failed to check login status', error)
            } finally {
                setIsLoading(false)
            }
        }
        checkLoginStatus()
    }, [])

    return (
        <>
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Container maxWidth={false} sx={{ maxWidth: { xs: '100%', md: '1200px' }, px: { xs: 1.5, sm: 2, md: 3 } }}>
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
                                    mr: 4,
                                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                                }}
                            >
                                BeautyHub
                            </Typography>
                        </Link>

                        {/* 데스크톱 네비게이션 */}
                        <Stack direction="row" spacing={1} sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {navItems.map((item) => (
                                <Button
                                    key={item.href}
                                    component={Link}
                                    href={item.href}
                                    sx={{
                                        color: pathname === item.href ? 'primary.main' : 'text.primary',
                                        fontWeight: pathname === item.href ? 600 : 400,
                                        minHeight: '44px',
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Stack>

                        {/* 모바일 햄버거 메뉴 버튼 */}
                        <IconButton
                            onClick={() => setMobileMenuOpen(true)}
                            sx={{ 
                                display: { xs: 'flex', md: 'none' },
                                mr: 2,
                                minWidth: '44px',
                                minHeight: '44px',
                            }}
                            aria-label="메뉴 열기"
                        >
                            <Menu size={24} />
                        </IconButton>

                        {/* 액션 버튼 */}
                        <Stack direction="row" spacing={{ xs: 1, sm: 2 }}>
                            {isLoading ? (
                                <Skeleton variant="rectangular" width={150} height={36} sx={{ borderRadius: 1, display: { xs: 'none', sm: 'block' } }} />
                            ) : isLoggedIn ? (
                                <Button 
                                    component={Link} 
                                    href="/dashboard" 
                                    variant="contained" 
                                    size="small"
                                    sx={{ 
                                        minHeight: { xs: '44px', md: '36px' },
                                        fontSize: { xs: '0.875rem', md: '0.8125rem' }
                                    }}
                                >
                                    대시보드
                                </Button>
                            ) : (
                                <>
                                    <Button 
                                        component={Link} 
                                        href="/login" 
                                        variant="outlined" 
                                        size="small"
                                        sx={{ 
                                            minHeight: { xs: '44px', md: '36px' },
                                            fontSize: { xs: '0.875rem', md: '0.8125rem' },
                                            display: { xs: 'none', sm: 'inline-flex' }
                                        }}
                                    >
                                        로그인
                                    </Button>
                                    <Button 
                                        component={Link} 
                                        href="/signup" 
                                        variant="contained" 
                                        size="small"
                                        sx={{ 
                                            minHeight: { xs: '44px', md: '36px' },
                                            fontSize: { xs: '0.875rem', md: '0.8125rem' }
                                        }}
                                    >
                                        회원가입
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* 모바일 드로어 메뉴 */}
            <Drawer
                anchor="right"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: 280,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight={700}>
                            메뉴
                        </Typography>
                        <IconButton
                            onClick={() => setMobileMenuOpen(false)}
                            sx={{ minWidth: '44px', minHeight: '44px' }}
                            aria-label="메뉴 닫기"
                        >
                            <X size={24} />
                        </IconButton>
                    </Box>
                    <List>
                        {navItems.map((item) => (
                            <ListItem key={item.href} disablePadding>
                                <Button
                                    component={Link}
                                    href={item.href}
                                    fullWidth
                                    onClick={() => setMobileMenuOpen(false)}
                                    sx={{
                                        justifyContent: 'flex-start',
                                        color: pathname === item.href ? 'primary.main' : 'text.primary',
                                        fontWeight: pathname === item.href ? 600 : 400,
                                        minHeight: '44px',
                                        py: 1.5,
                                        px: 2,
                                    }}
                                >
                                    {item.label}
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                    {!isLoggedIn && (
                        <Stack spacing={1} sx={{ mt: 2, px: 2 }}>
                            <Button
                                component={Link}
                                href="/login"
                                variant="outlined"
                                fullWidth
                                onClick={() => setMobileMenuOpen(false)}
                                sx={{ minHeight: '44px' }}
                            >
                                로그인
                            </Button>
                        </Stack>
                    )}
                </Box>
            </Drawer>
        </>
    )
}
