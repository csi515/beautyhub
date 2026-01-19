'use client'

import { Staff } from '@/types/entities'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import {
    Typography,
    Avatar,
    Chip,
    IconButton,
    useTheme,
    Stack
} from '@mui/material'
import ResponsiveDataGrid from '@/app/components/ui/ResponsiveDataGrid'
import { Edit2 } from 'lucide-react'

interface StaffDataGridProps {
    rows: Staff[]
    loading?: boolean
    onEdit: (staff: Staff) => void
    onStatusClick: (staff: Staff) => void
}

/**
 * MUI Data Grid 기반의 반응형 직원 명부
 * PC: 테이블 뷰 / Mobile: 카드 리스트 뷰
 */
export default function StaffDataGrid({ rows, loading, onEdit, onStatusClick }: StaffDataGridProps) {
    const theme = useTheme()

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
                const color = status === 'office' ? 'success' : status === 'away' ? 'warning' : 'default'
                const label = status === 'office' ? '출근' : status === 'away' ? '휴무' : '퇴근'
                return (
                    <Chip
                        label={label}
                        color={color as any}
                        size="small"
                        variant="outlined"
                        onClick={() => onStatusClick(params.row)}
                        sx={{ cursor: 'pointer' }}
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
