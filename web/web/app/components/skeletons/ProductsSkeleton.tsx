'use client'

import { Box, Grid, Skeleton, Stack, Card, CardContent } from '@mui/material'

export default function ProductsSkeleton() {
    return (
        <Stack spacing={3}>
            {/* Search Bar Skeleton */}
            <Card sx={{ p: 2, borderRadius: 3 }} elevation={0} variant="outlined">
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                    <Skeleton variant="rounded" width="100%" height={40} sx={{ maxWidth: { sm: 400 } }} />
                    <Skeleton variant="rounded" sx={{ width: { xs: '100%', sm: 120 } }} height={40} />
                </Stack>
            </Card>

            {/* Filter Bar Skeleton */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <Skeleton variant="rounded" width={200} height={40} />
                <Skeleton variant="rounded" width={150} height={40} />
            </Stack>

            {/* Product Grid Skeleton */}
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                        <Card sx={{ borderRadius: 3, height: '100%' }} variant="outlined">
                            <CardContent>
                                <Stack spacing={1.5}>
                                    <Skeleton variant="text" width="80%" height={24} />
                                    <Skeleton variant="text" width="40%" height={20} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        <Skeleton variant="text" width="50%" height={28} />
                                        <Skeleton variant="circular" width={32} height={32} />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Stack>
    )
}
