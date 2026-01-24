'use client'

import { useState, useEffect, useMemo } from 'react'
import { Staff } from '@/types/entities'
import StaffDataGrid from './StaffDataGrid'
import StaffListFilters, { type StaffListFiltersState } from './StaffListFilters'
import { settingsApi } from '@/app/lib/api/settings'
import { Stack } from '@mui/material'
import BulkActionBar from '../common/BulkActionBar'

interface StaffListTabProps {
  staff: Staff[]
  onEdit: (staff: Staff) => void
  onStatusClick: (staff: Staff) => void
  selectedIds?: string[]
  onSelectedIdsChange?: (ids: string[]) => void
}

export default function StaffListTab({
  staff,
  onEdit,
  onStatusClick,
  selectedIds = [],
  onSelectedIdsChange,
}: StaffListTabProps) {
  const [filters, setFilters] = useState<StaffListFiltersState>({
    query: '',
    roleFilter: 'all',
    activeFilter: 'all',
  })
  const [roleOptions, setRoleOptions] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const s = await settingsApi.get()
        setRoleOptions(s.staffSettings?.positions ?? [])
      } catch {
        setRoleOptions([])
      }
    }
    load()
  }, [])

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const q = filters.query.trim().toLowerCase()
      if (q && !(s.name ?? '').toLowerCase().includes(q)) return false
      if (filters.roleFilter !== 'all' && (s.role ?? '') !== filters.roleFilter) return false
      if (filters.activeFilter === 'active' && s.active === false) return false
      if (filters.activeFilter === 'inactive' && s.active !== false) return false
      return true
    })
  }, [staff, filters])

  return (
    <Stack spacing={2}>
      {onSelectedIdsChange && selectedIds.length > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.length}
          selectedLabel="명 선택"
          onClearSelection={() => onSelectedIdsChange([])}
          variant="inline"
        />
      )}
      <StaffListFilters
        filters={filters}
        onQueryChange={(v) => setFilters((prev) => ({ ...prev, query: v }))}
        onRoleFilterChange={(v) => setFilters((prev) => ({ ...prev, roleFilter: v }))}
        onActiveFilterChange={(v) => setFilters((prev) => ({ ...prev, activeFilter: v }))}
        roleOptions={roleOptions}
      />
      <StaffDataGrid
        rows={filteredStaff}
        onEdit={onEdit}
        onStatusClick={onStatusClick}
        selectedIds={onSelectedIdsChange ? selectedIds : undefined}
        onSelectedIdsChange={onSelectedIdsChange}
      />
    </Stack>
  )
}
