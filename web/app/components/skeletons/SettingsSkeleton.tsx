'use client'

import { Stack, Card, CardContent, Skeleton, Box } from '@mui/material'

export default function SettingsSkeleton() {
    return (
        <Stack spacing={3}>
            {/* Header */}
            <Box>
                <Skeleton variant="text" width={120} height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" width={280} height={24} />
            </Box>

            {/* Setting Cards */}
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack spacing={2}>
                            {/* Card Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Skeleton variant="text" width={180} height={28} />
                                <Skeleton variant="rounded" width={80} height={36} />
                            </Box>

                            {/* Card Content */}
                            <Stack spacing={1.5}>
                                <Skeleton variant="text" width="100%" height={20} />
                                <Skeleton variant="text" width="80%" height={20} />
                                <Skeleton variant="text" width="60%" height={20} />
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    )
}
