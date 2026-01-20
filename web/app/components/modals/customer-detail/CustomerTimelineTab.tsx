'use client'

import { useState, useMemo } from 'react'
import { Box, Typography, Stack, TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material'
import { Search } from 'lucide-react'
import { useCustomerTimeline } from '@/app/lib/hooks/useCustomerTimeline'
import TimelineItem from '@/app/components/ui/TimelineItem'
import { subDays, subMonths } from 'date-fns'
import type { TimelineEvent } from '@/app/lib/api/customers/timeline'

interface CustomerTimelineTabProps {
  customerId: string
}

export default function CustomerTimelineTab({ customerId }: CustomerTimelineTabProps) {
  const { events, loading, error } = useCustomerTimeline(customerId, true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'appointment' | 'transaction' | 'points' | 'product'>('all')
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'week' | 'month' | '3months'>('all')

  // 필터링된 이벤트
  const filteredEvents = useMemo(() => {
    let filtered: TimelineEvent[] = [...events]

    // 타입 필터
    if (typeFilter !== 'all') {
      filtered = filtered.filter((e) => e.type === typeFilter)
    }

    // 날짜 범위 필터
    if (dateRangeFilter !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (dateRangeFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = subDays(now, 7)
          break
        case 'month':
          startDate = subMonths(now, 1)
          break
        case '3months':
          startDate = subMonths(now, 3)
          break
        default:
          startDate = new Date(0)
      }

      filtered = filtered.filter((e) => {
        const eventDate = new Date(e.date)
        return eventDate >= startDate
      })
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((e) => {
        const titleMatch = e.title.toLowerCase().includes(query)
        const descMatch = e.description?.toLowerCase().includes(query)
        return titleMatch || descMatch
      })
    }

    return filtered
  }, [events, typeFilter, dateRangeFilter, searchQuery])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Stack spacing={3}>
      {/* 필터 섹션 */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <TextField
          placeholder="검색..."
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search size={18} className="mr-2 text-neutral-400" />,
          }}
          sx={{ maxWidth: { md: 300 } }}
        />

        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 } }}>
          <InputLabel>이벤트 타입</InputLabel>
          <Select
            value={typeFilter}
            label="이벤트 타입"
            onChange={(e) => setTypeFilter(e.target.value as any)}
          >
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="appointment">예약</MenuItem>
            <MenuItem value="transaction">거래</MenuItem>
            <MenuItem value="points">포인트</MenuItem>
            <MenuItem value="product">상품</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 } }}>
          <InputLabel>날짜 범위</InputLabel>
          <Select
            value={dateRangeFilter}
            label="날짜 범위"
            onChange={(e) => setDateRangeFilter(e.target.value as any)}
          >
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="today">오늘</MenuItem>
            <MenuItem value="week">최근 7일</MenuItem>
            <MenuItem value="month">최근 1개월</MenuItem>
            <MenuItem value="3months">최근 3개월</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 결과 카운트 */}
      <Typography variant="body2" color="text.secondary">
        총 {filteredEvents.length}개의 이벤트
      </Typography>

      {/* 타임라인 */}
      {filteredEvents.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            표시할 이벤트가 없습니다.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ pl: 1 }}>
          {filteredEvents.map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              isLast={index === filteredEvents.length - 1}
            />
          ))}
        </Box>
      )}
    </Stack>
  )
}
