'use client'

import { Box, Grid, Skeleton, Stack, Card } from '@mui/material'

export default function DashboardSkeleton() {
    return (
        <Stack spacing={3}>
            {/* Header Skeleton */}
            <Box>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="text" width={300} height={24} />
            </Box>

            {/* Metrics Skeleton */}
            <Grid container spacing={{ xs: 1, sm: 2.5, md: 3 }}>
                {[1, 2, 3, 4].map((i) => (
                    <Grid item xs={6} sm={6} md={3} key={i}>
                        <Card sx={{ p: 3, height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Skeleton variant="circular" width={40} height={40} />
                                <Skeleton variant="rounded" width={60} height={24} />
                            </Box>
                            <Skeleton variant="text" width="60%" height={32} />
                            <Skeleton variant="text" width="40%" height={20} />
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Charts Skeleton */}
            <Grid container spacing={{ xs: 1.5, sm: 2.5, md: 3 }}>
                <Grid item xs={12} lg={8}>
                    <Card sx={{ p: 3, height: 400 }}>
                        <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" width="100%" height={300} />
                    </Card>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Card sx={{ p: 3, height: 400 }}>
                        <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
                        <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', my: 4 }} />
                    </Card>
                </Grid>
            </Grid>

            {/* Lists Skeleton */}
            <Grid container spacing={{ xs: 1.5, sm: 2.5, md: 3 }}>
                <Grid item xs={12} lg={8}>
                    <Card sx={{ p: 3, height: 300 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Skeleton variant="text" width={120} height={32} />
                            <Skeleton variant="text" width={60} height={24} />
                        </Box>
                        <Grid container spacing={2}>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Grid item xs={6} sm={4} key={i}>
                                    <Skeleton variant="rounded" height={80} />
                                </Grid>
                            ))}
                        </Grid>
                    </Card>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Card sx={{ p: 3, height: 300 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Skeleton variant="text" width={100} height={32} />
                            <Skeleton variant="text" width={60} height={24} />
                        </Box>
                        <Stack spacing={2}>
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} variant="rounded" height={40} />
                            ))}
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
        </Stack>
    )
}
