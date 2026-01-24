'use client'

import { useEffect, useState } from 'react'
import SwipeableModal, { SwipeableModalBody, SwipeableModalFooter, SwipeableModalHeader } from '@/app/components/ui/SwipeableModal'
import Button from '@/app/components/ui/Button'
import Textarea from '@/app/components/ui/Textarea'
import { useAppToast } from '@/app/lib/ui/toast'
import { staffApi } from '@/app/lib/api/staff'
import { settingsApi } from '@/app/lib/api/settings'
import { Calendar, Clock } from 'lucide-react'

type Staff = {
  id?: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  role?: string | null;
  notes?: string | null;
  active?: boolean;
  status?: string | null;
  skills?: string | null;
  profile_image_url?: string | null;
}

type StaffDetailModalProps = {
  open: boolean
  onClose: () => void
  item: Staff | null
  onSaved: () => void
  onDeleted: () => void
  onViewSchedule?: (staff: Staff) => void
  onViewAttendance?: (staff: Staff) => void
  onLeaveRequest?: (staff: Staff) => void
}

export default function StaffDetailModal({ open, onClose, item, onSaved, onDeleted, onViewSchedule, onViewAttendance, onLeaveRequest }: StaffDetailModalProps) {
  const [form, setForm] = useState<Staff>({
    name: '', phone: '', email: '', role: '', notes: '', active: true,
    status: 'office', skills: '', profile_image_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [positions, setPositions] = useState<string[]>([])
  const toast = useAppToast()

  // 설정에서 직책 목록 불러오기
  useEffect(() => {
    const loadPositions = async () => {
      try {
        const settings = await settingsApi.get()
        setPositions(settings.staffSettings?.positions || [])
      } catch (error) {
        console.error('직책 목록 로드 실패:', error)
        setPositions([])
      }
    }
    loadPositions()
  }, [])

  useEffect(() => {
    setForm(item || {
      name: '', phone: '', email: '', role: '', notes: '', active: true,
      status: 'office', skills: '', profile_image_url: ''
    })
  }, [item])

  const save = async () => {
    try {
      setLoading(true); setError('')
      const body = {
        name: (form.name || '').trim(),
        phone: form.phone?.trim() ? form.phone.trim() : null,
        email: form.email?.trim() ? form.email.trim() : null,
        role: form.role?.trim() ? form.role.trim() : null,
        active: form.active !== false,
        notes: form.notes?.trim() || null,
        status: form.status || 'office',
        skills: form.skills?.trim() || null,
        profile_image_url: form.profile_image_url?.trim() || null
      }

      if (!body.name) throw new Error('이름은 필수입니다.')
      if (form.id) {
        await staffApi.update(form.id, body)
      } else {
        await staffApi.create(body)
      }
      onSaved(); onClose(); toast.success('직원이 저장되었습니다.')
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '에러가 발생했습니다.'
      setError(errorMessage)
      toast.error('저장 실패', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async () => {
    if (!form?.id) return
    if (!confirm('삭제하시겠습니까?')) return
    try {
      await staffApi.delete(form.id)
      onDeleted(); onClose(); toast.success('삭제되었습니다.')
    } catch {
      toast.error('삭제 실패')
    }
  }

  const handleOffboard = async () => {
    if (!form?.id) return
    if (!confirm('퇴사 처리하시겠습니까? 해당 직원은 비활성(퇴사) 상태로 변경됩니다.')) return
    try {
      setLoading(true)
      setError('')
      await staffApi.update(form.id, { active: false })
      onSaved()
      onClose()
      toast.success('퇴사 처리되었습니다.')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '퇴사 처리에 실패했습니다.'
      setError(msg)
      toast.error('퇴사 처리 실패')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null
  return (
    <SwipeableModal open={open} onClose={onClose} size="fullscreen">
      <SwipeableModalHeader title="직원 상세" description="직원 정보를 관리합니다. 이름은 필수입니다." onClose={onClose} />
      <SwipeableModalBody>
        <div className="space-y-4">
          {error && (
            <div className="p-2 rounded-md bg-rose-50 border border-rose-200" role="alert">
              <p className="text-xs text-rose-600">{error}</p>
            </div>
          )}

          {/* 기본정보 섹션 */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-900 border-b pb-1">기본정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="staff-name" className="block text-xs font-medium text-neutral-700 mb-1">
                  이름 <span className="text-rose-600">*</span>
                </label>
                <input
                  id="staff-name"
                  className="border border-gray-300 rounded-lg px-2.5 py-1.5 h-9 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="staff-role" className="block text-xs font-medium text-neutral-700 mb-1">
                  직책
                </label>
                <select
                  id="staff-role"
                  className="border border-gray-300 rounded-lg px-2.5 py-1.5 h-9 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all bg-white"
                  value={form.role || ''}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  <option value="">선택</option>
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="staff-profile" className="block text-xs font-medium text-neutral-700 mb-1">
                  프로필 이미지 URL(선택)
                </label>
                <input
                  id="staff-profile"
                  className="border border-gray-300 rounded-lg px-2.5 py-1.5 h-9 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                  value={form.profile_image_url || ''}
                  onChange={e => setForm({ ...form, profile_image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label htmlFor="staff-skills" className="block text-xs font-medium text-neutral-700 mb-1">
                  보유 기술(선택)
                </label>
                <input
                  id="staff-skills"
                  className="border border-gray-300 rounded-lg px-2.5 py-1.5 h-9 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                  value={form.skills || ''}
                  onChange={e => setForm({ ...form, skills: e.target.value })}
                  placeholder="예: 경락, 아로마, 필링"
                />
              </div>
            </div>
          </div>

          {/* 연락처 섹션 */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold text-neutral-900 border-b pb-1">연락처</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="staff-email" className="block text-xs font-medium text-neutral-700 mb-1">
                  이메일(선택)
                </label>
                <input
                  id="staff-email"
                  type="email"
                  className="border border-gray-300 rounded-lg px-2.5 py-1.5 h-9 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                  value={form.email || ''}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="예: staff@example.com"
                />
              </div>
              <div>
                <label htmlFor="staff-phone" className="block text-xs font-medium text-neutral-700 mb-1">
                  휴대폰(선택)
                </label>
                <input
                  id="staff-phone"
                  type="tel"
                  className="border border-gray-300 rounded-lg px-2.5 py-1.5 h-9 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
                  value={form.phone || ''}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="예: 010-1234-5678"
                />
              </div>
            </div>
          </div>

          {/* 권한/소속 및 메모 */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold text-neutral-900 border-b pb-1">권한 및 메모</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <label htmlFor="staff-active" className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 cursor-pointer">
                  <input
                    id="staff-active"
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-200"
                    checked={form.active !== false}
                    onChange={e => setForm({ ...form, active: e.target.checked })}
                  />
                  <span>시스템 접근 권한 활성</span>
                </label>
              </div>
              <div>
                <Textarea
                  label="상세 메모(선택)"
                  value={form.notes || ''}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="직원에 대한 특이사항이나 메모를 입력하세요"
                />
              </div>
            </div>
          </div>

          {(onViewSchedule || onViewAttendance || onLeaveRequest) && form.id && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold text-neutral-900 border-b pb-1">빠른 이동</h3>
              <div className="flex flex-wrap gap-2">
                {onViewSchedule && (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Calendar size={16} />}
                    onClick={() => onViewSchedule(item!)}
                    sx={{ minHeight: 44 }}
                  >
                    주간 스케줄
                  </Button>
                )}
                {onViewAttendance && (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Clock size={16} />}
                    onClick={() => onViewAttendance(item!)}
                    sx={{ minHeight: 44 }}
                  >
                    근태 기록
                  </Button>
                )}
                {onLeaveRequest && (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Calendar size={16} />}
                    onClick={() => onLeaveRequest(item!)}
                    sx={{ minHeight: 44 }}
                  >
                    휴가 신청
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </SwipeableModalBody>
      <SwipeableModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={loading} fullWidth sx={{ minHeight: '44px' }}>취소</Button>
        {form.id && (
          <>
            {form.active !== false && (
              <Button variant="outline" onClick={handleOffboard} disabled={loading} fullWidth sx={{ minHeight: '44px' }}>퇴사 처리</Button>
            )}
            <Button variant="danger" onClick={removeItem} disabled={loading} fullWidth sx={{ minHeight: '44px' }}>삭제</Button>
          </>
        )}
        <Button variant="primary" onClick={save} disabled={loading} fullWidth sx={{ minHeight: '44px' }}>저장</Button>
      </SwipeableModalFooter>
    </SwipeableModal>
  )
}
