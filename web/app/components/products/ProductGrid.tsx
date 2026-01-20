'use client'

import { Grid, Card, CardContent, CardActions, Stack, Typography } from '@mui/material'
import Button from '../ui/Button'
import EmptyState from '../EmptyState'
import StatusBadge from '../common/StatusBadge'
import LoadingState from '../common/LoadingState'
import type { Product } from '@/types/entities'

type Props = {
  products: Product[]
  loading: boolean
  onProductClick: (product: Product) => void
  onCreateClick: () => void
}

export default function ProductGrid({ products, loading, onProductClick, onCreateClick }: Props) {
  if (loading) {
    return (
      <LoadingState variant="card" rows={8} className="" />
    )
  }

  if (products.length === 0) {
    return (
      <Grid container spacing={{ xs: 0.75, sm: 1.5, md: 2 }}>
        <Grid item xs={12}>
          <EmptyState
            title="제품이 없습니다."
            actionLabel="제품 추가"
            actionOnClick={onCreateClick}
          />
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={{ xs: 0.75, sm: 1.5, md: 2 }}>
      {products.map((p) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={String(p.id)}>
          <Card 
            variant="outlined" 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:active': {
                transform: 'scale(0.98)',
                boxShadow: 2,
              },
              '&:hover': { boxShadow: { xs: 2, md: 4 } }
            }}
            onClick={() => onProductClick(p)}
          >
            <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 }, pb: { xs: 0.5, sm: 1 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <StatusBadge
                  status={p.active ? 'active' : 'inactive'}
                  variant="outlined"
                />
              </Stack>
              <Typography 
                variant="subtitle2" 
                component="h3" 
                fontWeight={600} 
                sx={{
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.4,
                  minHeight: { xs: '2.8em', sm: 'auto' }
                }}
                title={p.name}
              >
                {p.name}
              </Typography>
              <Typography 
                variant="body2" 
                color="primary.main" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
              >
                ₩{Number(p.price || 0).toLocaleString()}
              </Typography>
              {p.description && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    fontSize: '0.75rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4,
                  }}
                >
                  {p.description}
                </Typography>
              )}
            </CardContent>
            <CardActions sx={{ p: { xs: 1, sm: 1.5 }, pt: 0 }}>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  onProductClick(p)
                }}
                fullWidth
                sx={{ 
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' }, 
                  py: { xs: 1, sm: 0.75 },
                  minHeight: { xs: '44px', sm: 'auto' }
                }}
              >
                상세보기
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
