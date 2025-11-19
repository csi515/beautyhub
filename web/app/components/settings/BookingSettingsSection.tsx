'use client'

import Card from '../ui/Card'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import { type BookingSettings } from '@/types/settings'
import { DAY_LABELS } from '@/types/settings'

type Props = {
  data: BookingSettings
  onChange: (data: Partial<BookingSettings>) => void
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export default function BookingSettingsSection({ data, onChange }: Props) {
  const toggleAvailableDay = (day: string) => {
    const days = data.availableDays.includes(day)
      ? data.availableDays.filter((d) => d !== day)
      : [...data.availableDays, day]
    onChange({ availableDays: days })
  }

  const toggleReminderTiming = (hours: number) => {
    const timings = data.reminderTimings.includes(hours)
      ? data.reminderTimings.filter((t) => t !== hours)
      : [...data.reminderTimings, hours].sort((a, b) => b - a)
    onChange({ reminderTimings: timings })
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-neutral-900 mb-6">예약 및 스케줄 정책</h2>
      
      <div className="space-y-6">
        {/* 예약 시간 정책 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800">예약 시간 정책</h3>
          
          <Select
            label="최소 예약 간격"
            value={String(data.minBookingInterval)}
            onChange={(e) => onChange({ minBookingInterval: Number(e.target.value) })}
          >
            <option value="15">15분</option>
            <option value="30">30분</option>
            <option value="60">60분</option>
          </Select>

          <Input
            label="하루 최대 예약 가능 시간"
            type="number"
            value={data.maxBookingHoursPerDay}
            onChange={(e) => onChange({ maxBookingHoursPerDay: Number(e.target.value) })}
            helpText="하루에 예약 가능한 최대 시간(시간 단위)"
          />

          <div>
            <label className="block mb-2 text-base font-semibold text-neutral-700">예약 가능 요일</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DAYS.map((day) => (
                <label key={day} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50">
                  <input
                    type="checkbox"
                    checked={data.availableDays.includes(day)}
                    onChange={() => toggleAvailableDay(day)}
                    className="w-4 h-4 rounded border-neutral-300 text-blue-600"
                  />
                  <span className="text-sm text-neutral-700">{DAY_LABELS[day]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 자동 알림 설정 */}
        <div className="border-t border-neutral-200 pt-4 space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800">자동 알림 설정</h3>
          
          <div>
            <label className="block mb-2 text-base font-semibold text-neutral-700">예약 리마인드 알림</label>
            <div className="flex flex-wrap gap-2">
              {[24, 12, 3, 1].map((hours) => (
                <label key={hours} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50">
                  <input
                    type="checkbox"
                    checked={data.reminderTimings.includes(hours)}
                    onChange={() => toggleReminderTiming(hours)}
                    className="w-4 h-4 rounded border-neutral-300 text-blue-600"
                  />
                  <span className="text-sm text-neutral-700">{hours}시간 전</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.pushNotificationOnCreate}
                onChange={(e) => onChange({ pushNotificationOnCreate: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-300 text-blue-600"
              />
              <span className="text-sm font-medium text-neutral-700">예약 생성 시 PUSH 알림</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.pushNotificationOnCancel}
                onChange={(e) => onChange({ pushNotificationOnCancel: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-300 text-blue-600"
              />
              <span className="text-sm font-medium text-neutral-700">예약 취소 시 PUSH 알림</span>
            </label>
          </div>
        </div>

        {/* 고객 자동 메시지 */}
        <div className="border-t border-neutral-200 pt-4 space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800">고객 자동 메시지</h3>
          
          <Textarea
            label="예약 확정 문구"
            value={data.autoMessages.confirmed}
            onChange={(e) => onChange({
              autoMessages: { ...data.autoMessages, confirmed: e.target.value }
            })}
            placeholder="예약이 확정되었습니다. 감사합니다."
            rows={3}
          />

          <Textarea
            label="예약 리마인드 문구"
            value={data.autoMessages.reminder}
            onChange={(e) => onChange({
              autoMessages: { ...data.autoMessages, reminder: e.target.value }
            })}
            placeholder="내일 예약이 있습니다. 시간을 확인해주세요."
            rows={3}
          />

          <Textarea
            label="예약 취소 안내 문구"
            value={data.autoMessages.cancelled}
            onChange={(e) => onChange({
              autoMessages: { ...data.autoMessages, cancelled: e.target.value }
            })}
            placeholder="예약이 취소되었습니다."
            rows={3}
          />
        </div>
      </div>
    </Card>
  )
}

