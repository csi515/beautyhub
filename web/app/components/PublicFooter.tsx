import Link from 'next/link'
import { Box, Container, Typography, Stack, Divider } from '@mui/material'

export default function PublicFooter() {
    return (
        <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', py: { xs: 4, md: 6 }, mt: 'auto' }}>
            <Container maxWidth={false} sx={{ maxWidth: { xs: '100%', md: '1200px' }, px: { xs: 1.5, sm: 2, md: 3 } }}>
                <Stack spacing={4}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 4, md: 6 }} justifyContent="space-between">
                        <Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.125rem', md: '1.25rem' } }}>
                                BeautyHub
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, fontSize: { xs: '0.875rem', md: '0.9375rem' } }}>
                                피부관리샵을 위한 올인원 고객 관리 솔루션. 예약, 고객 정보, 재무 관리를 한 곳에서.
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 4, md: 6 }}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '0.9375rem', md: '1rem' } }}>
                                    제품
                                </Typography>
                                <Stack spacing={1}>
                                    <Link href="/features" style={{ textDecoration: 'none' }}>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            sx={{ 
                                                '&:hover': { color: 'primary.main' },
                                                minHeight: '44px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontSize: { xs: '0.875rem', md: '0.9375rem' }
                                            }}
                                        >
                                            기능
                                        </Typography>
                                    </Link>
                                </Stack>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '0.9375rem', md: '1rem' } }}>
                                    리소스
                                </Typography>
                                <Stack spacing={1}>
                                    <Link href="/guides" style={{ textDecoration: 'none' }}>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            sx={{ 
                                                '&:hover': { color: 'primary.main' },
                                                minHeight: '44px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontSize: { xs: '0.875rem', md: '0.9375rem' }
                                            }}
                                        >
                                            가이드
                                        </Typography>
                                    </Link>
                                    <Link href="/faq" style={{ textDecoration: 'none' }}>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            sx={{ 
                                                '&:hover': { color: 'primary.main' },
                                                minHeight: '44px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontSize: { xs: '0.875rem', md: '0.9375rem' }
                                            }}
                                        >
                                            FAQ
                                        </Typography>
                                    </Link>
                                </Stack>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '0.9375rem', md: '1rem' } }}>
                                    법적 정보
                                </Typography>
                                <Stack spacing={1}>
                                    <Link href="/privacy-policy" style={{ textDecoration: 'none' }}>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            sx={{ 
                                                '&:hover': { color: 'primary.main' },
                                                minHeight: '44px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontSize: { xs: '0.875rem', md: '0.9375rem' }
                                            }}
                                        >
                                            개인정보처리방침
                                        </Typography>
                                    </Link>
                                    <Link href="/terms-of-service" style={{ textDecoration: 'none' }}>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            sx={{ 
                                                '&:hover': { color: 'primary.main' },
                                                minHeight: '44px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontSize: { xs: '0.875rem', md: '0.9375rem' }
                                            }}
                                        >
                                            이용약관
                                        </Typography>
                                    </Link>
                                </Stack>
                            </Box>
                        </Stack>
                    </Stack>

                    <Divider />

                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" alignItems="center" spacing={2}>
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}
                        >
                            © 2024 BeautyHub. All rights reserved.
                        </Typography>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    )
}
