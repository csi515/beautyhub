'use client'

import { useState } from 'react'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { type BusinessProfile } from '@/types/settings'
import { DAY_LABELS } from '@/types/settings'

type Props = {
  data: BusinessProfile
  onChange: (data: Partial<BusinessProfile>) => void
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export default function BusinessProfileSection({ data, onChange }: Props) {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({})

  const toggleDay = (day: string) => {
    setExpandedDays((prev) => ({ ...prev, [day]: !prev[day] }))
  }

  const updateBusinessHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    onChange({
      businessHours: {
        ...data.businessHours,
        [day]: {
          ...(data.businessHours[day] || {}),
          [field]: value,
        },
      },
    })
  }

  const toggleRegularHoliday = (day: string) => {
    const holidays = data.regularHolidays.includes(day)
      ? data.regularHolidays.filter((d) => d !== day)
      : [...data.regularHolidays, day]
    onChange({ regularHolidays: holidays })
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-neutral-900 mb-6">가게 기본 정보</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="상호명"
            required
            value={data.storeName}
            onChange={(e) => onChange({ storeName: e.target.value })}
            placeholder="예) 여우스킨"
          />
          <Input
            label="대표자 이름"
            value={data.ownerName || ''}
            onChange={(e) => onChange({ ownerName: e.target.value })}
            placeholder="예) 홍길동"
          />
        </div>

        <Input
          label="주소"
          value={data.address || ''}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="예) 서울시 강남구 테헤란로 123"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="전화번호"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="예) 02-1234-5678"
          />
          <Input
            label="사업자등록번호"
            value={data.businessRegistrationNumber || ''}
            onChange={(e) => onChange({ businessRegistrationNumber: e.target.value })}
            placeholder="예) 123-45-67890"
          />
        </div>

        <Input
          label="업종"
          value={data.businessCategory || ''}
          onChange={(e) => onChange({ businessCategory: e.target.value })}
          placeholder="예) 미용실, 네일샵 등"
        />

        {/* 영업 시간 */}
        <div className="border-t border-neutral-200 pt-4">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">영업 시간</h3>
          <div className="space-y-3">
            {DAYS.map((day) => {
              const hours = data.businessHours[day]
              const isClosed = hours?.closed ?? false
              const isHoliday = data.regularHolidays.includes(day)

              return (
                <div key={day} className="border border-neutral-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isHoliday}
                        onChange={() => toggleRegularHoliday(day)}
                        className="w-4 h-4 rounded border-neutral-300 text-blue-600"
                      />
                      <span className="font-medium text-neutral-700">{DAY_LABELS[day]}</span>
                      {isHoliday && (
                        <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded">정기 휴무</span>
                      )}
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleDay(day)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {expandedDays[day] ? '접기' : '펼치기'}
                    </button>
                  </div>
                  
                  {expandedDays[day] && !isHoliday && (
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isClosed}
                          onChange={(e) => updateBusinessHours(day, 'closed', e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-300"
                        />
                        <span className="text-sm text-neutral-600">휴무</span>
                      </label>
                      {!isClosed && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-neutral-600 mb-1">오픈</label>
                            <input
                              type="time"
                              value={hours?.open || '09:00'}
                              onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                              className="h-9 w-full rounded-lg border border-neutral-300 px-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-neutral-600 mb-1">마감</label>
                            <input
                              type="time"
                              value={hours?.close || '18:00'}
                              onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                              className="h-9 w-full rounded-lg border border-neutral-300 px-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 예약 가능 기간 */}
        <div className="border-t border-neutral-200 pt-4">
          <Select
            label="예약 가능 기간"
            value={String(data.bookingAdvanceDays)}
            onChange={(e) => onChange({ bookingAdvanceDays: Number(e.target.value) })}
          >
            <option value="7">1주일 후까지</option>
            <option value="14">2주일 후까지</option>
            <option value="28">4주일 후까지</option>
            <option value="56">8주일 후까지</option>
          </Select>
        </div>
      </div>
    </Card>
  )
}

