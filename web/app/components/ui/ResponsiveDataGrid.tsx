'use client'

import { useMemo } from 'react'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import MobileTable, { MobileTableColumn } from '../common/MobileTable'

interface ResponsiveDataGridProps<T = any> {
  rows: T[]
  columns: GridColDef[]
  loading?: boolean
  onRowClick?: (row: T, index: number) => void
  emptyMessage?: string
  className?: string
  pageSizeOptions?: number[]
  initialState?: {
    pagination?: {
      paginationModel?: {
        pageSize?: number
      }
    }
  }
  disableRowSelectionOnClick?: boolean
  sx?: Record<string, unknown>
  height?: number | string
}

/**
 * 반응형 DataGrid 컴포넌트
 * 모바일에서는 MobileTable(카드 뷰)로, 데스크톱에서는 MUI DataGrid로 표시
 */
export default function ResponsiveDataGrid<T = any>({
  rows,
  columns,
  loading = false,
  onRowClick,
  emptyMessage = '데이터가 없습니다.',
  className = '',
  pageSizeOptions = [5, 10, 20],
  initialState,
  disableRowSelectionOnClick = true,
  sx,
  height = 500,
}: ResponsiveDataGridProps<T>) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // GridColDef를 MobileTableColumn으로 변환
  const mobileColumns = useMemo<MobileTableColumn<any>[]>(() => {
    return columns.map((col) => {
      // renderCell을 MobileTable의 render 형식으로 변환
      const render = col.renderCell
        ? (item: any, index: number) => {
            // GridRenderCellParams와 유사한 객체 생성
            const params = {
              value: item[col.field],
              row: item,
              field: col.field,
              id: (item as any).id || index,
              api: null,
              colDef: col,
              cellMode: 'view' as const,
              hasFocus: false,
              tabIndex: -1,
              formattedValue: item[col.field],
              isEditable: false,
              rowNode: {
                id: (item as any).id || index,
                type: 'leaf',
                depth: 0,
                parent: null,
                groupingField: null,
                groupingKey: null,
              },
            } as unknown as GridRenderCellParams

            return col.renderCell!(params)
          }
        : undefined

      // primary 컬럼 결정: flex가 1이거나 width가 없는 경우
      const primary = col.flex === 1 || col.width === undefined

      return {
        key: col.field,
        header: col.headerName || col.field,
        ...(render && { render }),
        primary,
        ...(col.cellClassName && typeof col.cellClassName === 'string' && { className: col.cellClassName }),
      }
    })
  }, [columns])

  // 모바일에서는 MobileTable 사용
  if (isMobile) {
    return (
      <MobileTable
        columns={mobileColumns}
        data={rows as any[]}
        onRowClick={onRowClick as any}
        emptyMessage={emptyMessage}
        className={className}
      />
    )
  }

  // 데스크톱에서는 DataGrid 사용
  return (
    <Box
      sx={{
        height: typeof height === 'number' ? height : height,
        width: '100%',
        bgcolor: 'white',
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        ...sx,
      }}
      className={className}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={pageSizeOptions}
        {...(initialState && { initialState })}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: theme.palette.grey[50],
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          ...sx,
        }}
      />
    </Box>
  )
}
