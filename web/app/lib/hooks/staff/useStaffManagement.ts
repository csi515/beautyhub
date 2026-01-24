'use client'

import { useAppToast } from '../../ui/toast'
import { staffApi } from '../../api/staff'

export function useStaffManagement(
  selectedStaffId: string | null,
  loadAll: () => Promise<void>
) {
  const toast = useAppToast()

  const handleStatusSave = async (status: string) => {
    if (!selectedStaffId) return
    try {
      await staffApi.update(selectedStaffId, { status })
      await loadAll()
      toast.success('상태가 변경되었습니다')
    } catch (e) {
      console.error(e)
      toast.error('상태 변경에 실패했습니다')
    }
  }

  return {
    handleStatusSave,
  }
}
