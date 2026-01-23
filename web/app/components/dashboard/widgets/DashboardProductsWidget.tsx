'use client'

import { useMemo } from 'react'
import { Box, Grid, Typography, Stack, useTheme, useMediaQuery } from '@mui/material'
import Link from 'next/link'
import { PackageOpen } from 'lucide-react'
import Card from '../../ui/Card'
import { useResponsiveSpacing } from '../../../lib/hooks/useResponsiveSpacing'

type ProductSummary = {
  id: string | number
  name: string
  price: number
  active?: boolean
}

interface DashboardProductsWidgetProps {
  activeProducts: ProductSummary[]
}

export default function DashboardProductsWidget({ activeProducts }: DashboardProductsWidgetProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const spacing = useResponsiveSpacing()
  
  const slicedProducts = useMemo(
    () => activeProducts?.slice(0, 12) || [],
    [activeProducts]
  )

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 1, sm: 0 } }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ background: 'linear-gradient(to right, #059669, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          판매 중인 상품
        </Typography>
        <Box
          component={Link}
          href="/products"
          aria-label="판매 중인 상품 전체보기"
          sx={{
            fontSize: { xs: '0.875rem', sm: '0.875rem' },
            color: '#64748B',
            textDecoration: 'none',
            minHeight: '44px',
            minWidth: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: { xs: '0.75rem', sm: '0.5rem' }
          }}
        >
          전체보기 →
        </Box>
      </Box>
      {activeProducts.length > 0 ? (
        <Grid container spacing={spacing.card as any}>
          {slicedProducts.map((p: ProductSummary, index: number) => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: '100%',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
                  '@keyframes fadeInUp': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(10px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(16, 185, 129, 0.04)',
                    borderColor: 'success.light',
                    transform: { xs: 'none', md: 'translateY(-4px)' },
                    boxShadow: { xs: 'none', md: '0 12px 24px -10px rgba(16, 185, 129, 0.2)' }
                  },
                  '&:active': {
                    transform: { xs: 'scale(0.98)', md: 'none' },
                    bgcolor: 'rgba(16, 185, 129, 0.08)',
                  }
                }}
              >
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: { xs: 2, sm: 1 }, WebkitBoxOrient: 'vertical', fontSize: { xs: '1rem', sm: '0.875rem' } }}>
                  {p.name}
                </Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  ₩{Number(p.price || 0).toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={2}
          sx={{ 
            py: 3,
            minHeight: { xs: 120, sm: 120 },
            maxHeight: { xs: 140, sm: 160 },
            bgcolor: 'background.default', 
            borderRadius: 3, 
            border: '1px dashed', 
            borderColor: 'divider' 
          }}
        >
          <PackageOpen
            size={isMobile ? 32 : 40}
            className="text-gray-300"
            style={{
              width: isMobile ? '32px' : 'clamp(40px, 12vw, 48px)',
              height: isMobile ? '32px' : 'clamp(40px, 12vw, 48px)'
            }}
          />
          <Box textAlign="center">
            <Typography variant="body1" color="text.secondary" fontWeight={500} gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1rem' } }}>
              아직 등록된 상품이 없어요
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1, mb: 2, fontSize: { xs: '0.875rem', sm: '0.75rem' } }}>
              첫 상품을 등록하고 비즈니스를 시작해보세요!
            </Typography>
            <Link
              href="/products"
              aria-label="상품 추가하기"
              style={{
                color: '#3B82F6',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                minHeight: '44px',
                minWidth: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 1rem'
              }}
            >
              + 상품 추가하기
            </Link>
          </Box>
        </Stack>
      )}
    </Card>
  )
}
