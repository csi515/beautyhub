'use client'

import { Card, Typography, Box, Stack, Chip } from '@mui/material'
import { Calendar, Clock, FileText } from 'lucide-react'
import { useAppQuery } from '@/app/lib/hooks/useQuery'
import { appointmentsApi } from '@/app/lib/api/appointments'
import type { Appointment } from '@/types/entities'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

const STATUS_LABEL: Record<string, { label: string; color: 'default' | 'primary' | 'success' | 'error' | 'warning' }> = {
  scheduled: { label: '예정', color: 'primary' },
  pending: { label: '대기', color: 'warning' },
  completed: { label: '완료', color: 'success' },
  cancelled: { label: '취소', color: 'error' },
  no_show: { label: '노쇼', color: 'error' },
}

type CustomerVisitsTabProps = {
  customerId: string
}

export default function CustomerVisitsTab({ customerId }: CustomerVisitsTabProps) {
  const { data: appointments = [], isLoading } = useAppQuery<Appointment[]>({
    queryKey: ['appointments', 'by-customer', customerId],
    queryFn: () =>
      appointmentsApi.list({
        limit: 50,
        // @ts-expect-error: customer_id 필터는 API에서 지원하지만 타입 미포함
        customer_id: customerId,
        orderBy: 'appointment_date',
        ascending: false,
      }),
    enabled: !!customerId,
  })

  if (!customerId) return null

  return (
    <Stack spacing={3}>
      <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Calendar size={20} className="text-primary-main" />
          <Typography variant="subtitle1" fontWeight={700}>
            방문 이력
          </Typography>
          {!isLoading && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              총 {appointments.length}건
            </Typography>
          )}
        </Box>

        {isLoading ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">로딩 중...</Typography>
          </Box>
        ) : appointments.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">방문 이력이 없습니다</Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {appointments.map((appt) => {
              const status = appt.status ? STATUS_LABEL[appt.status] : undefined
              const isNoShow = appt.no_show

              return (
                <Card
                  key={appt.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderLeft: '3px solid',
                    borderLeftColor: isNoShow ? 'error.main' : appt.status === 'completed' ? 'success.main' : 'primary.main',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Clock size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      <Typography variant="body2" fontWeight={600}>
                        {format(new Date(appt.appointment_date), 'yyyy년 M월 d일 (EEE) HH:mm', { locale: ko })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
                      {isNoShow && (
                        <Chip label="노쇼" size="small" color="error" />
                      )}
                      {status && !isNoShow && (
                        <Chip label={status.label} size="small" color={status.color} />
                      )}
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                    {appt.total_price != null && (
                      <Typography variant="caption" fontWeight={600} color="success.main">
                        ₩{Number(appt.total_price).toLocaleString()}
                      </Typography>
                    )}
                  </Stack>

                  {appt.notes && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: 1 }}>
                      <FileText size={13} style={{ color: '#94a3b8', marginTop: 2, flexShrink: 0 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {appt.notes}
                      </Typography>
                    </Box>
                  )}
                </Card>
              )
            })}
          </Stack>
        )}
      </Card>
    </Stack>
  )
}
