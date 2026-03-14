import { Box, Grid, Paper, Skeleton, Stack } from '@mui/material'

export default function DashboardLoading() {
    return (
        <Stack spacing={3}>
            <Grid container spacing={{ xs: 0.75, sm: 1.5, md: 2.5, lg: 3 }}>
                {[...Array(4)].map((_, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={{ xs: 0.75, sm: 1.5, md: 2.5, lg: 3 }}>
                <Grid item xs={12} lg={8}>
                    <Paper variant="outlined" sx={{ p: 2, height: 400, borderRadius: 3 }}>
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Skeleton width={120} height={28} />
                            <Skeleton width={60} height={20} />
                        </Box>
                        <Grid container spacing={2}>
                            {[...Array(6)].map((_, i) => (
                                <Grid item xs={12} sm={6} md={4} key={i}>
                                    <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper variant="outlined" sx={{ p: 2, height: 400, borderRadius: 3 }}>
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Skeleton width={100} height={28} />
                            <Skeleton width={60} height={20} />
                        </Box>
                        <Stack spacing={2}>
                            {[...Array(5)].map((_, i) => (
                                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Skeleton width={80} height={20} sx={{ mb: 0.5 }} />
                                        <Skeleton width={120} height={16} />
                                    </Box>
                                    <Skeleton width={60} height={20} />
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, height: 300, borderRadius: 3 }}>
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Skeleton width={120} height={28} />
                            <Skeleton width={60} height={20} />
                        </Box>
                        <Stack spacing={2}>
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} variant="rounded" height={50} sx={{ borderRadius: 2 }} />
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Stack>
    )
}
