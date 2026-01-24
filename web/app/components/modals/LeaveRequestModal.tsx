'use client'

import { useState, useEffect } from 'react'
import SwipeableModal, { SwipeableModalBody, SwipeableModalFooter, SwipeableModalHeader } from '@/app/components/ui/SwipeableModal'
import Button from '@/app/components/ui/Button'
import { useAppToast } from '@/app/lib/ui/toast'
import { Calendar } from 'lucide-react'

type Staff = { id: string; name: string }

interface LeaveRequestModalProps {
  open: boolean
  onClose: () => void
  preSelectedStaff: Staff | null
  onSaved: () => void
}

const TYPE_LABELS: Record<string, string> = { annual: '연차', sick: '병가', etc: '기타' }

export default function LeaveRequestModal({
  open,
  onClose,
  preSelectedStaff,
  onSaved,
}: LeaveRequestModalProps) {
  const [staffId, setStaffId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [type, setType] = useState<'annual' | 'sick' | 'etc'>('annual')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useAppToast()

  useEffect(() => {
    if (open && preSelectedStaff) {
      setStaffId(preSelectedStaff.id)
    }
  }, [open, preSelectedStaff])

  const handleSubmit = async () => {
    if (!staffId || !startDate || !endDate) {
      toast.error('직원, 시작일, 종료일을 입력하세요')
      return
    }
    try {
      setLoading(true)
      const res = await fetch('/api/staff/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: staffId,
          start_date: startDate,
          end_date: endDate,
          type,
          reason: reason.trim() || null,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || '등록 실패')
      }
      toast.success('휴가 신청이 등록되었습니다.')
      onSaved()
      onClose()
      setStartDate('')
      setEndDate('')
      setReason('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '휴가 신청 실패')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null
  return (
    <SwipeableModal open={open} onClose={onClose} size="fullscreen">
      <SwipeableModalHeader
        title="휴가 신청"
        description="기간과 사유를 입력하세요."
        onClose={onClose}
      />
      <SwipeableModalBody>
        <div className="space-y-4">
          {preSelectedStaff ? (
            <p className="text-sm text-neutral-600">
              직원: <strong>{preSelectedStaff.name}</strong>
            </p>
          ) : (
            <p className="text-xs text-neutral-500">직원 상세에서 열면 해당 직원이 선택됩니다.</p>
          )}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">시작일 *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 h-9 w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">종료일 *</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 h-9 w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">유형</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'annual' | 'sick' | 'etc')}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 h-9 w-full text-sm bg-white"
            >
              {Object.entries(TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">사유 (선택)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="휴가 사유"
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 w-full text-sm min-h-[80px]"
            />
          </div>
        </div>
      </SwipeableModalBody>
      <SwipeableModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={loading} fullWidth sx={{ minHeight: '44px' }}>
          취소
        </Button>
        <Button
          variant="primary"
          leftIcon={<Calendar size={16} />}
          onClick={handleSubmit}
          disabled={loading || !staffId || !startDate || !endDate}
          fullWidth
          sx={{ minHeight: '44px' }}
        >
          신청
        </Button>
      </SwipeableModalFooter>
    </SwipeableModal>
  )
}
