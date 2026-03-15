'use client'

import { Box, Stack } from '@mui/material'
import { Skeleton } from '../ui/Skeleton'
import Card from '../ui/Card'

export default function AppointmentsSkeleton() {
  return (
    <Stack spacing={2} sx={{ flex: 1, minHeight: 400 }}>
      <Box sx={{ flexShrink: 0 }}>
        <Skeleton variant="text" width={180} height={24} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width={120} height={20} />
      </Box>
      <Card sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Skeleton variant="rounded" width={140} height={36} sx={{ borderRadius: 2 }} />
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" width={60} height={32} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 2 }} />
          </Stack>
        </Stack>
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Skeleton variant="rounded" width={80} height={36} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" width={80} height={36} sx={{ borderRadius: 2 }} />
          </Stack>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} variant="text" height={28} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      </Card>
    </Stack>
  )
}
