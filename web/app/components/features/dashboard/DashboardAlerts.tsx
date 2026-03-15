'use client'

import { useMemo } from 'react'
import Card from '@/app/components/ui/Card'
import { Box, Typography, Stack, Chip, Button as MuiButton } from '@mui/material'
import { Bell, Clock } from 'lucide-react'
import Link from 'next/link'
import { useAppointmentReminders, useMarkReminderAsSent } from '@/app/lib/hooks/useAppointmentReminders'
import type { AppointmentReminder } from '@/types/entities'
import { useState } from 'react'

export default function DashboardAlerts() {
  const [markingAll, setMarkingAll] = useState(false)
  // 예약 리마인더 조회 (전송되지 않은 것만)
  const { data: reminders = [], isLoading: remindersLoading } = useAppointmentReminders({ upcoming: true })
  const markAsSentMutation = useMarkReminderAsSent()

  const unsentReminders = useMemo(() => {
    return reminders.filter((r: AppointmentReminder) => !r.sent_at)
  }, [reminders])

  const hasAlerts = unsentReminders.length > 0

  if (remindersLoading) {
    return null
  }

  if (!hasAlerts) {
    return null
  }

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Bell size={20} className="text-primary-main" />
        <Typography variant="h6" fontWeight={700}>
          알림
        </Typography>
      </Box>

      <Stack spacing={2}>
        {/* 예약 리마인더 알림 */}
        {unsentReminders.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Clock size={16} className="text-amber-600" />
                <Typography variant="subtitle2" fontWeight={600}>
                  전송 대기 리마인더 ({unsentReminders.length})
                </Typography>
              </Box>
              <MuiButton
                size="small"
                variant="outlined"
                disabled={markingAll}
                onClick={async () => {
                  setMarkingAll(true)
                  try {
                    for (const r of unsentReminders) {
                      await markAsSentMutation.mutateAsync(r.id)
                    }
                  } finally {
                    setMarkingAll(false)
                  }
                }}
                sx={{ fontSize: '0.75rem', py: 0.5, px: 1.5, minHeight: '32px' }}
              >
                {markingAll ? '처리 중...' : '모두 처리됨'}
              </MuiButton>
            </Box>
            <Stack spacing={1}>
              {unsentReminders.slice(0, 5).map((reminder: AppointmentReminder) => {
                const reminderTypeLabel =
                  reminder.reminder_type === '1_day_before'
                    ? '1일 전'
                    : reminder.reminder_type === '3_hours_before'
                      ? '3시간 전'
                      : '당일'
                return (
                  <Box
                    key={reminder.id}
                    sx={{
                      p: 1.5,
                      bgcolor: 'amber.50',
                      border: '1px solid',
                      borderColor: 'amber.200',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        예약 리마인더
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {reminderTypeLabel} 알림 전송 필요
                      </Typography>
                    </Box>
                    <Chip label={reminderTypeLabel} size="small" sx={{ bgcolor: 'amber.100', color: 'amber.800' }} />
                  </Box>
                )
              })}
              {unsentReminders.length > 5 && (
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
                  외 {unsentReminders.length - 5}건 더
                </Typography>
              )}
            </Stack>
            <Box sx={{ mt: 1.5 }}>
              <Link href="/appointments" style={{ textDecoration: 'none', display: 'block' }}>
                <MuiButton variant="outlined" fullWidth size="small">
                  예약 관리로 이동
                </MuiButton>
              </Link>
            </Box>
          </Box>
        )}

      </Stack>
    </Card>
  )
}