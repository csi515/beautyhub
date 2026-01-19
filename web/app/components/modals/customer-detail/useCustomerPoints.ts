import { useState, useEffect } from 'react'
import { pointsApi } from '@/app/lib/api/points'
import { useAppToast } from '@/app/lib/ui/toast'
import { getLocalizedErrorMessage } from '@/app/lib/utils/messages'

export function useCustomerPoints(customerId: string | undefined, open: boolean) {
  const [pointsBalance, setPointsBalance] = useState<number>(0)
  const [pointsDelta, setPointsDelta] = useState<number>(0)
  const [pointsReason, setPointsReason] = useState<string>('')
  const [pointsLedger, setPointsLedger] = useState<{ created_at: string; delta: number; reason?: string }[]>([])
  const toast = useAppToast()

  // 데이터 로드
  useEffect(() => {
    if (!open || !customerId) return

    const loadPoints = async () => {
      try {
        const [pointsData, pointsLedgerData] = await Promise.all([
          pointsApi.getBalance(customerId, { withLedger: false }),
          pointsApi.getLedger(customerId, { limit: 100 }),
        ])

        setPointsBalance(Number(pointsData?.balance || 0))
        setPointsLedger(Array.isArray(pointsLedgerData) ? pointsLedgerData : [])
      } catch (err) {
        console.error('Failed to load points:', err)
      }
    }

    loadPoints()
  }, [open, customerId])

  // 포인트 추가
  const handleAddPoints = async () => {
    if (!customerId || !pointsDelta) return
    try {
      await pointsApi.addLedgerEntry(customerId, { delta: Math.abs(pointsDelta), reason: pointsReason || '-' })
      setPointsBalance(prev => prev + Math.abs(pointsDelta))
      setPointsDelta(0)
      setPointsReason('')

      const ledgerData = await pointsApi.getLedger(customerId, { limit: 100 })
      setPointsLedger(Array.isArray(ledgerData) ? ledgerData : [])

      toast.success('포인트가 추가되었습니다.')
    } catch (error) {
      const message = getLocalizedErrorMessage(error, '포인트 추가에 실패했습니다.')
      toast.error(message)
    }
  }

  // 포인트 차감
  const handleDeductPoints = async () => {
    if (!customerId || !pointsDelta) return
    try {
      await pointsApi.addLedgerEntry(customerId, { delta: -Math.abs(pointsDelta), reason: pointsReason || '-' })
      setPointsBalance(prev => prev - Math.abs(pointsDelta))
      setPointsDelta(0)
      setPointsReason('')

      const ledgerData = await pointsApi.getLedger(customerId, { limit: 100 })
      setPointsLedger(Array.isArray(ledgerData) ? ledgerData : [])

      toast.success('포인트가 차감되었습니다.')
    } catch (error) {
      const message = getLocalizedErrorMessage(error, '포인트 차감에 실패했습니다.')
      toast.error(message)
    }
  }

  return {
    pointsBalance,
    pointsDelta,
    setPointsDelta,
    pointsReason,
    setPointsReason,
    pointsLedger,
    handleAddPoints,
    handleDeductPoints,
  }
}
