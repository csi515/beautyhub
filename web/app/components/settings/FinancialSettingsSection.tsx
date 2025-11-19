'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { type FinancialSettings } from '@/types/settings'

type Props = {
  data: FinancialSettings
  onChange: (data: Partial<FinancialSettings>) => void
}

export default function FinancialSettingsSection({ data, onChange }: Props) {
  const [newCategory, setNewCategory] = useState('')

  const addCategory = () => {
    if (newCategory.trim() && !data.expenseCategories.includes(newCategory.trim())) {
      onChange({
        expenseCategories: [...data.expenseCategories, newCategory.trim()],
      })
      setNewCategory('')
    }
  }

  const removeCategory = (category: string) => {
    onChange({
      expenseCategories: data.expenseCategories.filter((c) => c !== category),
    })
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-neutral-900 mb-6">재무 및 정산 설정</h2>
      
      <div className="space-y-6">
        {/* 비용 항목 관리 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800">비용 항목 관리</h3>
          
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="새 항목 입력"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCategory()
                }
              }}
            />
            <Button
              variant="outline"
              onClick={addCategory}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              추가
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {data.expenseCategories.map((category) => (
              <div
                key={category}
                className="flex items-center justify-between p-2 rounded-lg border border-neutral-200 bg-neutral-50"
              >
                <span className="text-sm text-neutral-700">{category}</span>
                <button
                  type="button"
                  onClick={() => removeCategory(category)}
                  className="p-1 rounded hover:bg-neutral-200 text-neutral-500 hover:text-rose-600"
                  aria-label={`${category} 삭제`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 주거래 계좌 설정 */}
        <div className="border-t border-neutral-200 pt-4 space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800">주거래 계좌 설정</h3>
          
          <Input
            label="은행명"
            value={data.bankName || ''}
            onChange={(e) => onChange({ bankName: e.target.value })}
            placeholder="예) 국민은행"
          />

          <Input
            label="계좌번호"
            value={data.accountNumber || ''}
            onChange={(e) => onChange({ accountNumber: e.target.value })}
            placeholder="예) 123456-78-901234"
          />

          <Input
            label="예금주명"
            value={data.accountHolder || ''}
            onChange={(e) => onChange({ accountHolder: e.target.value })}
            placeholder="예) 홍길동"
          />
        </div>

        {/* 정산 로직 설정 */}
        <div className="border-t border-neutral-200 pt-4 space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800">정산 로직 설정</h3>
          
          <Input
            label="현금 정산일 (매월 N일)"
            type="number"
            min="1"
            max="31"
            value={data.cashSettlementDay}
            onChange={(e) => onChange({ cashSettlementDay: Number(e.target.value) })}
            helpText="매월 몇 일에 정산할지 설정합니다."
          />

          <Input
            label="카드 정산일 (매월 N일)"
            type="number"
            min="1"
            max="31"
            value={data.cardSettlementDay}
            onChange={(e) => onChange({ cardSettlementDay: Number(e.target.value) })}
          />

          <Input
            label="플랫폼 정산일 (매월 N일)"
            type="number"
            min="1"
            max="31"
            value={data.platformSettlementDay}
            onChange={(e) => onChange({ platformSettlementDay: Number(e.target.value) })}
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.autoCreateTransactionOnComplete}
              onChange={(e) => onChange({ autoCreateTransactionOnComplete: e.target.checked })}
              className="w-4 h-4 rounded border-neutral-300 text-blue-600"
            />
            <span className="text-sm font-medium text-neutral-700">예약 완료 시 자동 매출 생성</span>
          </label>
        </div>
      </div>
    </Card>
  )
}

