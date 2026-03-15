'use client'

import Link from 'next/link'
import { Box, List, ListItem, ListItemText, Typography, Stack } from '@mui/material'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { formatDateTimeShort } from '../lib/utils/date'
import { CalendarX } from 'lucide-react'

type RecentAppointment = {
  id: string
  appointment_date: string
  customer_name: string
  product_name: string
}

interface DashboardRecentAppointmentsProps {
  appointments: RecentAppointment[]
  isTablet: boolean
}

export default function DashboardRecentAppointments({ appointments, isTablet }: DashboardRecentAppointmentsProps) {
  return (
    <Card sx={{ height: '100%', p: { xs: 2, md: isTablet ? 1.5 : 2 } }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: { xs: 1.5, md: isTablet ? 1 : 1.5 }, mb: { xs: 1.5, md: isTablet ? 1 : 1.5 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 1, sm: 0 } }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ background: 'linear-gradient(to right, #db2777, #e11d48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          최근 예약
        </Typography>
        <Box component={Link} href="/appointments" aria-label="최근 예약 전체보기" sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' }, color: '#64748B', textDecoration: 'none', minHeight: '44px', minWidth: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: { xs: '0.75rem', sm: '0.5rem' } }}>
          전체보기 →
        </Box>
      </Box>
      <List disablePadding sx={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
        {appointments.length > 0 ? appointments.map((a, index) => {
          const isToday = new Date(a.appointment_date).toDateString() === new Date().toDateString()
          return (
            <ListItem
              key={a.id}
              disableGutters
              sx={{
                py: { xs: 1.25, md: isTablet ? 0.75 : 1.25 },
                px: 1,
                borderBottom: '1px solid',
                borderLeft: isToday ? '3px solid' : 'none',
                borderColor: isToday ? 'primary.main' : 'divider',
                bgcolor: isToday ? 'primary.50' : 'transparent',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                minHeight: { xs: '44px', sm: 'auto' },
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                transition: 'background-color 0.15s ease',
                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
                '@keyframes fadeInUp': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
                '&:active': { bgcolor: { xs: 'rgba(66, 99, 235, 0.1)', sm: 'transparent' } },
                '&:last-child': { borderBottom: 'none' }
              }}
            >
              <ListItemText
                primary={
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 0.5, sm: 0 } }}>
                    <Typography variant="body2" fontWeight={600} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: { xs: 'normal', sm: 'nowrap' }, fontSize: { xs: '1rem', sm: '0.875rem' } }}>{a.customer_name}</Typography>
                    <Typography variant="caption" color="primary.main" sx={{ flexShrink: 0, fontSize: { xs: '0.875rem', sm: '0.75rem' } }}>{a.product_name}</Typography>
                  </Box>
                }
                secondary={formatDateTimeShort(String(a.appointment_date || ''))}
                secondaryTypographyProps={{ variant: 'caption', sx: { mt: 0.5, display: 'block', fontSize: { xs: '0.875rem', sm: '0.75rem' } } }}
              />
            </ListItem>
          )
        }) : (
          <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 4 }}>
            <CalendarX size={48} className="text-gray-300" style={{ width: 'clamp(40px, 12vw, 48px)', height: 'clamp(40px, 12vw, 48px)' }} />
            <Box textAlign="center">
              <Typography variant="body1" fontWeight={600} color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1rem' } }}>
                아직 예약 내역이 없어요
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1, mb: 2, fontSize: { xs: '0.875rem', sm: '0.75rem' } }}>
                첫 예약을 추가하고 고객 관리를 시작해보세요!
              </Typography>
              <Link href="/appointments" passHref aria-label="예약 추가하기">
                <Button variant="primary" size="sm" aria-label="예약 추가하기">예약 추가</Button>
              </Link>
            </Box>
          </Stack>
        )}
      </List>
    </Card>
  )
}
