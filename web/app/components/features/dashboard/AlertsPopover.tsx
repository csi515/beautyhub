'use client'

import { useMemo, useState } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import { useAppointmentReminders, useMarkReminderAsSent } from '@/app/lib/hooks/useAppointmentReminders'
import type { AppointmentReminder } from '@/types/entities'

export default function AlertsPopover() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  const { data: reminders = [], isLoading: remindersLoading } = useAppointmentReminders({ upcoming: true })
  const markAsSentMutation = useMarkReminderAsSent()

  const unsentReminders = useMemo(
    () => reminders.filter((r: AppointmentReminder) => !r.sent_at),
    [reminders]
  )
  const badgeCount = unsentReminders.length
  const isLoading = remindersLoading

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  return (
    <>
      <IconButton
        onClick={handleOpen}
        aria-label="알림"
        sx={{ minWidth: 44, minHeight: 44, color: 'text.secondary' }}
      >
        <Box sx={{ position: 'relative' }}>
          <Bell size={20} />
          {badgeCount > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 18,
                height: 18,
                borderRadius: '50%',
                bgcolor: 'error.main',
                color: 'error.contrastText',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {badgeCount > 99 ? '99+' : badgeCount}
            </Box>
          )}
        </Box>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { width: { xs: 'calc(100vw - 32px)', sm: 360 }, maxHeight: 400 },
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Bell size={20} style={{ color: 'var(--mui-palette-primary-main)' }} />
            <Typography variant="h6" fontWeight={700}>
              알림
            </Typography>
          </Box>

          {isLoading ? (
            <Typography variant="body2" color="text.secondary">
              로딩 중...
            </Typography>
          ) : badgeCount === 0 ? (
            <Typography variant="body2" color="text.secondary">
              알림이 없습니다.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {unsentReminders.length > 0 && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      전송 대기 리마인더 ({unsentReminders.length})
                    </Typography>
                    <Button
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
                      sx={{ fontSize: '0.75rem', py: 0.5, px: 1.5, minHeight: 32 }}
                    >
                      {markingAll ? '처리 중...' : '모두 처리됨'}
                    </Button>
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
                    <Link href="/appointments" style={{ textDecoration: 'none', display: 'block' }} onClick={handleClose}>
                      <Button variant="outlined" fullWidth size="small">
                        예약 관리로 이동
                      </Button>
                    </Link>
                  </Box>
                </Box>
              )}

            </Stack>
          )}
        </Box>
      </Popover>
    </>
  )
}
