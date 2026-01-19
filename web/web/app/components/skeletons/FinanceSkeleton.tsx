'use client'

import { Box, Grid, Skeleton, Stack, Card, Divider } from '@mui/material'

export default function FinanceSkeleton() {
    return (
        <Stack spacing={3}>
            {/* Header Controls Skeleton */}
            <Card sx={{ p: 2, borderRadius: 3 }} elevation={0} variant="outlined">
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Skeleton variant="rounded" width={120} height={40} />
                        <Stack direction="row" spacing={1}>
                            <Skeleton variant="rounded" width={140} height={40} />
                            <Skeleton variant="text" width={20} height={40} />
                            <Skeleton variant="rounded" width={140} height={40} />
                        </Stack>
                    </Stack>
                    <Skeleton variant="rounded" sx={{ width: { xs: '100%', sm: 120 } }} height={40} />
                </Stack>
            </Card>

            {/* Summary Cards Skeleton */}
            <Grid container spacing={{ xs: 2, md: 3 }}>
                {[1, 2, 3].map((i) => (
                    <Grid item xs={12} md={4} key={i}>
                        <Card sx={{ p: 3, borderRadius: 3 }} elevation={0} variant="outlined">
                            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="80%" height={36} />
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Transactions Table Skeleton */}
            <Card sx={{ p: 3, borderRadius: 3 }} elevation={0} variant="outlined">
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Skeleton variant="text" width={150} height={32} />
                        <Skeleton variant="rounded" width={100} height={32} />
                    </Box>
                    <Divider />
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Box key={i}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5 }}>
                                <Stack spacing={0.5} sx={{ flex: 1 }}>
                                    <Skeleton variant="text" width="40%" height={20} />
                                    <Skeleton variant="text" width="60%" height={16} />
                                </Stack>
                                <Skeleton variant="text" width={100} height={24} />
                            </Stack>
                            {i < 8 && <Divider />}
                        </Box>
                    ))}
                </Stack>
            </Card>
        </Stack>
    )
}
