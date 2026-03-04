'use client'

import SummaryCard, { type SummaryCardItem } from '@/app/components/common/SummaryCard'
import { Users, DollarSign, FileText, Calculator } from 'lucide-react'

interface PayrollSummaryCardsProps {
    totalStaffCount: number
    filteredStaffCount: number
    totalGrossPay: number
    totalNetPay: number
    calculatedRecordsCount: number
    filteredStaffLength: number
}

export default function PayrollSummaryCards({
    totalStaffCount,
    filteredStaffCount,
    totalGrossPay,
    totalNetPay,
    calculatedRecordsCount,
    filteredStaffLength
}: PayrollSummaryCardsProps) {
    const items: SummaryCardItem[] = [
        {
            label: '급여 대상 직원',
            value: `${filteredStaffCount}명`,
            icon: Users,
            iconColor: '#6366f1',
            subtitle: `전체 ${totalStaffCount}명 중`,
        },
        {
            label: '총 지급액 (세전)',
            value: totalGrossPay,
            icon: DollarSign,
            iconColor: '#10b981',
            color: 'success',
            subtitle: `평균 ₩${filteredStaffLength > 0 ? Math.round(totalGrossPay / filteredStaffLength).toLocaleString() : 0}`,
        },
        {
            label: '실지급액 (세후)',
            value: totalNetPay,
            icon: FileText,
            iconColor: '#6366f1',
            subtitle: `공제액 ₩${(totalGrossPay - totalNetPay).toLocaleString()}`,
        },
        {
            label: '계산 상태',
            value: `${calculatedRecordsCount}/${filteredStaffLength}`,
            icon: Calculator,
            iconColor: '#f97316',
            subtitle: `${Math.round((calculatedRecordsCount / Math.max(filteredStaffLength, 1)) * 100)}% 완료`,
        }
    ]

    return <SummaryCard items={items} columns={{ xs: 12, sm: 6, md: 3 }} />
}
