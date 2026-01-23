'use client'

import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Checkbox,
  useTheme,
  useMediaQuery
} from '@mui/material'
import StatusBadge from '../common/StatusBadge'
import { useSwipe } from '@/app/lib/hooks/useSwipe'
import { useHapticFeedback } from '@/app/lib/hooks/useHapticFeedback'
import { type Staff, type PayrollRecord } from '@/types/payroll'

interface PayrollMobileCardsProps {
  selectedMonth: string
  records: PayrollRecord[]
  selectedStaffIds: string[]
  onSelectedStaffIdsChange: (ids: string[]) => void
  paginatedStaff: Staff[]
  onSettingsModalOpen: (staffId: string, staffName: string) => void
  onDetailModalOpen: (record: PayrollRecord) => void
  onStatusChange: (record: PayrollRecord, newStatus: 'approved' | 'paid') => void
}

export default function PayrollMobileCards({
  selectedMonth: _selectedMonth,
  records,
  selectedStaffIds,
  onSelectedStaffIdsChange,
  paginatedStaff,
  onSettingsModalOpen,
  onDetailModalOpen,
  onStatusChange
}: PayrollMobileCardsProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { light } = useHapticFeedback()

  const handleToggleSelect = (staffId: string) => {
    if (selectedStaffIds.includes(staffId)) {
      onSelectedStaffIdsChange(selectedStaffIds.filter(id => id !== staffId))
    } else {
      onSelectedStaffIdsChange([...selectedStaffIds, staffId])
    }
  }

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <Stack spacing={{ xs: 1, sm: 1.5 }}>
        {paginatedStaff.map((staff) => {
          const record = records.find(r => r.staff_id === staff.id)
          const isSelected = selectedStaffIds.includes(staff.id)
          
          const swipeHandlers = useSwipe({
            onSwipeLeft: () => {
              if (isMobile && record) {
                light()
                onDetailModalOpen(record)
              }
            },
            threshold: 50,
          })
          
          return (
            <Card
              key={staff.id}
              variant="outlined"
              {...(isMobile ? swipeHandlers : {})}
              sx={{
                borderRadius: 3,
                border: isSelected ? '2px solid' : '1px solid',
                borderColor: isSelected ? 'primary.main' : 'divider',
                bgcolor: isSelected ? 'primary.50' : 'background.paper',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:active': {
                  transform: 'scale(0.97)',
                  transition: 'transform 0.1s ease-out',
                },
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Stack spacing={1.5}>
                  {/* 헤더: 체크박스 + 직원명 */}
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleSelect(staff.id)}
                      sx={{ 
                        p: 0,
                        minWidth: '44px',
                        minHeight: '44px'
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1rem' } }}>
                        {staff.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                        {staff.role || '직원'}
                      </Typography>
                    </Box>
                    <StatusBadge
                      status={record?.status || 'not_calculated'}
                    />
                  </Stack>

                  {/* 급여 정보 */}
                  {record ? (
                    <>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                            기본급
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
                            ₩{record.base_salary.toLocaleString()}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                            시급/연장
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
                            ₩{record.overtime_pay.toLocaleString()}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                            인센티브
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
                            ₩{record.incentive_pay.toLocaleString()}
                          </Typography>
                        </Stack>
                        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1, mt: 0.5 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
                              총 지급액
                            </Typography>
                            <Typography variant="body1" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                              ₩{record.total_gross.toLocaleString()}
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Typography variant="body2" color="error.main" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                              공제액
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="error.main" sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
                              -₩{record.total_deductions.toLocaleString()}
                            </Typography>
                          </Stack>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" fontWeight={700} color="success.main" sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
                              실지급액
                            </Typography>
                            <Typography variant="h6" fontWeight={700} color="success.main" sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
                              ₩{record.net_salary.toLocaleString()}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>

                      {/* 액션 버튼 */}
                      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => onDetailModalOpen(record)}
                          sx={{ 
                            minHeight: '44px',
                            fontSize: { xs: '0.875rem', sm: '0.875rem' },
                            flex: { xs: '1 1 calc(50% - 4px)', sm: 'none' },
                            minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' }
                          }}
                        >
                          상세보기
                        </Button>
                        {record.status === 'calculated' && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => onStatusChange(record, 'approved')}
                            sx={{ 
                              minHeight: '44px',
                              fontSize: { xs: '0.875rem', sm: '0.875rem' },
                              flex: { xs: '1 1 calc(50% - 4px)', sm: 'none' },
                              minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' }
                            }}
                          >
                            승인
                          </Button>
                        )}
                        {record.status === 'approved' && (
                          <Button
                            variant="contained"
                            color="info"
                            size="small"
                            onClick={() => onStatusChange(record, 'paid')}
                            sx={{ 
                              minHeight: '44px',
                              fontSize: { xs: '0.875rem', sm: '0.875rem' },
                              flex: { xs: '1 1 calc(50% - 4px)', sm: 'none' },
                              minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' }
                            }}
                          >
                            지급확정
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => onSettingsModalOpen(staff.id, staff.name)}
                          sx={{ 
                            minHeight: '44px',
                            fontSize: { xs: '0.875rem', sm: '0.875rem' },
                            flex: { xs: '1 1 100%', sm: 'none' },
                            width: { xs: '100%', sm: 'auto' }
                          }}
                        >
                          설정
                        </Button>
                      </Stack>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' }, textAlign: 'center', py: 2 }}>
                      급여 정보가 없습니다
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )
        })}
        {paginatedStaff.length === 0 && (
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                등록된 직원이 없습니다.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  )
}
