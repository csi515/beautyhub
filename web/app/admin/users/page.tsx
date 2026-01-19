'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Paper, Typography, Chip, CircularProgress, Alert as MuiAlert } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import ResponsiveDataGrid from '@/app/components/ui/ResponsiveDataGrid'
import { CheckCircle, XCircle, Clock, Shield } from 'lucide-react'
import PageHeader from '@/app/components/common/PageHeader'
import Button from '@/app/components/ui/Button'
import ErrorState from '@/app/components/common/ErrorState'
import { getUsersApi } from '@/app/lib/api/users'
import { User, UserStatus } from '@/types/entities'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

/**
 * 슈퍼 관리자 전용 사용자 승인 대시보드
 * 전체 사용자 목록을 조회하고 승인/비승인 처리를 수행합니다.
 */
export default function AdminUsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

    // 현재 사용자 권한 확인
    useEffect(() => {
        const checkRole = async () => {
            try {
                const { getAuthApi } = await import('@/app/lib/api/auth')
                const authApi = await getAuthApi()
                const profile = await authApi.getCurrentUserProfile()

                if (!profile || profile.role !== 'super_admin') {
                    router.push('/dashboard')
                    return
                }

                setCurrentUserRole(profile.role)
            } catch (err) {
                console.error('권한 확인 실패:', err)
                router.push('/dashboard')
            }
        }

        checkRole()
    }, [router])

    // 사용자 목록 로드
    const loadUsers = async () => {
        setLoading(true)
        setError('')
        try {
            const api = await getUsersApi()
            const data = await api.list()
            setUsers(data)
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : '사용자 목록을 불러오는데 실패했습니다.'
            setError(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (currentUserRole === 'super_admin') {
            loadUsers()
        }
    }, [currentUserRole])

    // 상태 업데이트 핸들러
    const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
        setProcessingIds(prev => new Set(prev).add(userId))
        try {
            const api = await getUsersApi()
            await api.updateStatus(userId, newStatus)
            await loadUsers() // 갱신
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : '상태 업데이트에 실패했습니다.'
            setError(errorMsg)
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(userId)
                return newSet
            })
        }
    }

    // 통계 계산
    const stats = useMemo(() => ({
        total: users.length,
        pending: users.filter(u => u.status === 'PENDING').length,
        active: users.filter(u => u.status === 'ACTIVE').length,
        inactive: users.filter(u => u.status === 'INACTIVE').length,
    }), [users])

    // 상태 칩 렌더링
    const renderStatusChip = (status: UserStatus) => {
        const statusConfig = {
            PENDING: { label: '대기 중', color: 'warning' as const, icon: <Clock size={16} /> },
            ACTIVE: { label: '승인됨', color: 'success' as const, icon: <CheckCircle size={16} /> },
            INACTIVE: { label: '비활성화', color: 'error' as const, icon: <XCircle size={16} /> },
        }
        const config = statusConfig[status]
        return (
            <Chip
                label={config.label}
                color={config.color}
                size="small"
                icon={config.icon}
                sx={{ fontWeight: 600 }}
            />
        )
    }

    // 액션 버튼 렌더링
    const renderActionButtons = (params: GridRenderCellParams<User>) => {
        const user = params.row
        const isProcessing = processingIds.has(user.id)

        if (isProcessing) {
            return <CircularProgress size={20} />
        }

        if (user.status === 'PENDING') {
            return (
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                >
                    승인하기
                </Button>
            )
        }

        if (user.status === 'ACTIVE') {
            return (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {renderStatusChip('ACTIVE')}
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusChange(user.id, 'INACTIVE')}
                    >
                        비승인
                    </Button>
                </Box>
            )
        }

        if (user.status === 'INACTIVE') {
            return (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {renderStatusChip('INACTIVE')}
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                    >
                        승인하기
                    </Button>
                </Box>
            )
        }

        return null
    }

    // DataGrid 컬럼 정의
    const columns: GridColDef<User>[] = [
        {
            field: 'name',
            headerName: '이름',
            width: 150,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={600}>
                    {params.value || '-'}
                </Typography>
            ),
        },
        {
            field: 'branch_name',
            headerName: '지점명',
            width: 180,
            renderCell: (params) => (
                <Typography variant="body2">
                    {params.value || '-'}
                </Typography>
            ),
        },
        {
            field: 'email',
            headerName: '이메일',
            width: 250,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'created_at',
            headerName: '가입일',
            width: 150,
            renderCell: (params) => {
                if (!params.value) return '-'
                try {
                    return (
                        <Typography variant="body2">
                            {format(new Date(params.value), 'yyyy-MM-dd', { locale: ko })}
                        </Typography>
                    )
                } catch {
                    return '-'
                }
            },
        },
        {
            field: 'status',
            headerName: '현재 상태',
            width: 150,
            renderCell: (params) => renderStatusChip(params.value as UserStatus),
        },
        {
            field: 'actions',
            headerName: '액션',
            width: 250,
            sortable: false,
            renderCell: renderActionButtons,
        },
    ]

    // 권한 체크 중
    if (currentUserRole === null) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
            <PageHeader
                title="사용자 승인 관리"
                icon={<Shield className="h-5 w-5" />}
                description="전체 사용자를 관리하고 승인/비승인 처리를 수행합니다."
            />

            {/* 통계 카드 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                {[
                    { label: '전체 사용자', value: stats.total, color: 'primary.main' },
                    { label: '승인 대기', value: stats.pending, color: 'warning.main' },
                    { label: '승인됨', value: stats.active, color: 'success.main' },
                    { label: '비활성화', value: stats.inactive, color: 'error.main' },
                ].map((stat) => (
                    <Paper key={stat.label} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            {stat.label}
                        </Typography>
                        <Typography variant="h4" fontWeight="900" sx={{ color: stat.color, mt: 0.5 }}>
                            {stat.value}
                        </Typography>
                    </Paper>
                ))}
            </Box>

            {/* 에러 메시지 */}
            {error && (
                <MuiAlert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </MuiAlert>
            )}

            {/* 데이터 그리드 */}
            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                        <CircularProgress />
                    </Box>
                ) : error && users.length === 0 ? (
                    <Box sx={{ p: 3 }}>
                        <ErrorState message={error} onRetry={loadUsers} />
                    </Box>
                ) : (
                    <ResponsiveDataGrid
                        rows={users}
                        columns={columns}
                        loading={loading}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 10 },
                            },
                        }}
                        pageSizeOptions={[10, 25, 50]}
                        disableRowSelectionOnClick
                        sx={{
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #f0f0f0',
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f9fafb',
                                borderBottom: '2px solid #e5e7eb',
                            },
                        }}
                    />
                )}
            </Paper>
        </Box>
    )
}
