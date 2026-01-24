'use client'

import { useMemo } from 'react'
import { Staff } from '@/types/entities'
import { GridColDef, GridRenderCellParams, type GridRowSelectionModel } from '@mui/x-data-grid'
import {
    Typography,
    Avatar,
    IconButton,
    useTheme,
    Stack
} from '@mui/material'
import ResponsiveDataGrid from '@/app/components/ui/ResponsiveDataGrid'
import StatusBadge from '../common/StatusBadge'
import { Edit2 } from 'lucide-react'

interface StaffDataGridProps {
    rows: Staff[]
    loading?: boolean
    onEdit: (staff: Staff) => void
    onStatusClick: (staff: Staff) => void
    /** 다중 선택 시 선택된 ID 목록 */
    selectedIds?: string[]
    /** 다중 선택 변경 콜백 */
    onSelectedIdsChange?: (ids: string[]) => void
}

/**
 * MUI Data Grid 기반의 반응형 직원 명부
 * PC: 테이블 뷰 / Mobile: 카드 리스트 뷰
 */
function idsToSelectionModel(ids: string[]): GridRowSelectionModel {
    return { type: 'include' as const, ids: new Set(ids) }
}

function selectionModelToIds(model: GridRowSelectionModel): string[] {
    if (!model || model.type !== 'include') return []
    return Array.from(model.ids as Set<string>)
}

export default function StaffDataGrid({
    rows,
    loading,
    onEdit,
    onStatusClick,
    selectedIds = [],
    onSelectedIdsChange,
}: StaffDataGridProps) {
    const theme = useTheme()
    const rowSelectionModel = useMemo(() => idsToSelectionModel(selectedIds), [selectedIds])
    const handleSelectionChange = (model: GridRowSelectionModel) => {
        onSelectedIdsChange?.(selectionModelToIds(model))
    }

    // Data Grid 컬럼 정의
    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: '직원명',
            flex: 1,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        {...(params.row.profile_image_url ? { src: params.row.profile_image_url } : {})}
                        sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.light }}
                    >
                        {params.value?.[0]}
                    </Avatar>
                    <Typography variant="body2" fontWeight="bold">{params.value}</Typography>
                </Stack>
            )
        },
        { field: 'role', headerName: '직무', width: 120 },
        { field: 'phone', headerName: '연락처', width: 150 },
        {
            field: 'status',
            headerName: '상태',
            width: 120,
            renderCell: (params: GridRenderCellParams) => {
                const status = params.value || 'office'
                return (
                    <StatusBadge
                        status={status as 'office' | 'away' | 'off_duty'}
                        variant="outlined"
                        onClick={() => onStatusClick(params.row)}
                    />
                )
            }
        },
        {
            field: 'skills',
            headerName: '보유 기술',
            flex: 1,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="caption" color="text.secondary" noWrap>
                    {params.value || '-'}
                </Typography>
            )
        },
        {
            field: 'actions',
            headerName: '관리',
            width: 80,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <IconButton size="small" onClick={() => onEdit(params.row)}>
                    <Edit2 size={16} />
                </IconButton>
            )
        }
    ]

    return (
        <ResponsiveDataGrid
            rows={rows}
            columns={columns}
            loading={loading ?? false}
            onRowClick={(staff) => onEdit(staff as Staff)}
            pageSizeOptions={[5, 10, 20]}
            initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableRowSelectionOnClick
            checkboxSelection={!!onSelectedIdsChange}
            rowSelectionModel={onSelectedIdsChange ? rowSelectionModel : undefined}
            onRowSelectionModelChange={onSelectedIdsChange ? handleSelectionChange : undefined}
            sx={{
                '& .MuiDataGrid-columnHeaders': {
                    bgcolor: theme.palette.grey[50],
                    borderBottom: `1px solid ${theme.palette.divider}`,
                },
                '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                },
            }}
        />
    )
}
