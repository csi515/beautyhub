import Card from '../components/ui/Card'
import MetricCard from '../components/MetricCard'
import DashboardInstallPrompt from '../components/dashboard/DashboardInstallPrompt'
import Link from 'next/link'
import RecentTransactionsTable, { Transaction } from '../components/dashboard/RecentTransactionsTable'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { cookies } from 'next/headers'
import { Box, Grid, Typography, Stack, Alert, List, ListItem, ListItemText } from '@mui/material'

type ProductSummary = {
  id: string | number
  name: string
  price: number
  active?: boolean
}

type TransactionDB = {
  id: string
  transaction_date?: string
  created_at?: string
  amount: number | string
}

type ExpenseDB = {
  id: string
  expense_date?: string
  created_at?: string
  amount: number | string
  memo?: string
  category?: string
}


type RecentAppointment = {
  id: string
  appointment_date: string
  customer_name: string
  product_name: string
}

type AppointmentDB = {
  id: string
  appointment_date: string
  customer_id?: string
  service_id?: string
}

type CustomerDB = {
  id: string
  name: string
}

type ProductDB = {
  id: string
  name: string
}
function getTodayRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
  return { start, end }
}

function monthBounds() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return { monthStart: monthStart.toISOString(), monthEnd: nextMonth.toISOString() }
}

async function getDashboardData({ start, end, userId, accessToken }: { start: string; end: string; userId: string; accessToken?: string | undefined }) {
  const { getEnv } = await import('@/app/lib/env')
  const { createClient } = await import('@supabase/supabase-js')
  const url = getEnv.supabaseUrl()
  const anon = getEnv.supabaseAnonKey()

  if (!url || !anon) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
  }

  const supabase = createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    }
  })

  const { monthStart, monthEnd } = monthBounds()
  const fromDate = monthStart.slice(0, 10)
  const toDate = monthEnd.slice(0, 10)

  // Combined fetch
  const [apRes, , , cuMonth, apRecent, trRecent, exRecent, exMonth, trMonth, productsRes, apMonthRes] = await Promise.all([
    supabase
      .from('appointments')
      .select('id, appointment_date')
      .eq('owner_id', userId)
      .gte('appointment_date', start)
      .lt('appointment_date', end),
    supabase.from('transactions').select('id').eq('owner_id', userId).gte('transaction_date', start).lt('transaction_date', end),

    supabase
      .from('customers')
      .select('id, created_at')
      .eq('owner_id', userId)
      .gte('created_at', start)
      .lt('created_at', end),
    // Monthly New Customers
    supabase
      .from('customers')
      .select('id, created_at')
      .eq('owner_id', userId)
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd),
    // Recent Appointments
    supabase
      .from('appointments')
      .select('id, appointment_date, status, notes, customer_id, service_id')
      .eq('owner_id', userId)
      .order('appointment_date', { ascending: false })
      .limit(10),
    // Recent Transactions
    supabase
      .from('transactions')
      .select('id, amount, transaction_date, created_at, memo')
      .eq('owner_id', userId)
      .order('transaction_date', { ascending: false })
      .limit(10),
    // Recent Expenses
    supabase
      .from('expenses')
      .select('id, amount, expense_date, created_at, memo, category')
      .eq('owner_id', userId)
      .order('expense_date', { ascending: false })
      .limit(10),
    // Monthly Expenses (for Profit)
    supabase.from('expenses').select('id, amount, expense_date').eq('owner_id', userId).gte('expense_date', fromDate).lte('expense_date', toDate),
    // Monthly Transactions (for Profit)
    supabase.from('transactions').select('id, amount, transaction_date, created_at').eq('owner_id', userId).limit(500),
    // Products
    supabase
      .from('products')
      .select('id, name, price, active')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    // Monthly Appointments Count
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .gte('appointment_date', monthStart)
      .lte('appointment_date', monthEnd)
  ])

  const todayAppointments = Array.isArray(apRes.data) ? apRes.data.length : 0
  const monthlyAppointments = apMonthRes.count || 0

  // Monthly Profit
  const monthlyIncome = Array.isArray(trMonth.data)
    ? (trMonth.data as any[])
      .filter((t) => {
        const d = (t.transaction_date || t.created_at || '').slice(0, 10)
        return (!fromDate || d >= fromDate) && (!toDate || d <= toDate)
      })
      .reduce((s: number, t) => s + Number(t.amount || 0), 0)
    : 0

  const monthlyExpense = Array.isArray(exMonth.data)
    ? (exMonth.data as any[]).reduce((s: number, e) => s + Number(e.amount || 0), 0)
    : 0

  const monthlyProfit = Number(monthlyIncome || 0) - Number(monthlyExpense || 0)

  const monthlyNewCustomers = Array.isArray(cuMonth.data) ? cuMonth.data.length : 0

  // Active products
  const activeProducts = Array.isArray(productsRes.data)
    ? productsRes.data.filter((p: ProductSummary) => p.active !== false)
    : []

  // Recent Appointments helper
  const apRecentData = Array.isArray(apRecent.data) ? apRecent.data : []
  const apIds = apRecentData.map((a: AppointmentDB) => ({
    customer_id: a.customer_id,
    service_id: a.service_id,
  }))
  const cIds = Array.from(new Set(apIds.map(x => x.customer_id).filter(Boolean))) as string[]
  const sIds = Array.from(new Set(apIds.map(x => x.service_id).filter(Boolean))) as string[]

  const customersById: Record<string, string> = {}
  const productsById: Record<string, string> = {}

  if (cIds.length > 0) {
    const { data } = await supabase.from('customers').select('id,name').in('id', cIds)
    if (data) data.forEach((c: CustomerDB) => customersById[c.id] = c.name)
  }
  if (sIds.length > 0) {
    const { data } = await supabase.from('products').select('id,name').in('id', sIds)
    if (data) data.forEach((p: ProductDB) => productsById[p.id] = p.name)
  }

  // Combined Transactions
  const trData = Array.isArray(trRecent.data) ? trRecent.data : []
  const exData = Array.isArray(exRecent.data) ? exRecent.data : []
  const combinedTransactions: Transaction[] = [
    ...trData.map((t: TransactionDB) => ({
      id: t.id,
      type: 'income' as const,
      date: t.transaction_date || t.created_at || '',
      amount: Number(t.amount),
      memo: undefined
    })),
    ...exData.map((e: ExpenseDB) => ({
      id: e.id,
      type: 'expense' as const,
      date: e.expense_date || e.created_at || '',
      amount: Number(e.amount),
      memo: e.memo || e.category
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10) as unknown as Transaction[]

  return {
    todayAppointments,
    monthlyProfit,
    monthlyNewCustomers,
    monthlyAppointments,
    recentAppointments: apRecentData.map((a: AppointmentDB) => ({
      id: a.id,
      appointment_date: a.appointment_date,
      customer_name: a.customer_id ? customersById[a.customer_id] || '-' : '-',
      product_name: a.service_id ? productsById[a.service_id] || '-' : '-',
    })),
    recentTransactions: combinedTransactions,
    activeProducts
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const userId = await getUserIdFromCookies()
  const accessToken = cookieStore.get('sb:token')?.value || cookieStore.get('sb-access-token')?.value

  if (!userId) {
    return <Box p={3}>Loading...</Box>
  }

  const { start, end } = getTodayRange()

  let dashboardData
  if (userId === 'demo-user') {
    dashboardData = (await import('@/app/lib/mock-data')).MOCK_DASHBOARD_DATA
  } else {
    dashboardData = await getDashboardData({ start, end, userId, accessToken })
  }

  const {
    todayAppointments,
    monthlyProfit,
    monthlyNewCustomers,
    monthlyAppointments,
    recentAppointments,
    recentTransactions,
    activeProducts
  } = dashboardData

  return (
    <Stack spacing={3}>
      <DashboardInstallPrompt />

      {userId === 'demo-user' && (
        <Alert severity="warning" variant="filled" sx={{ borderRadius: 3 }}>
          현재 <strong>체험하기(데모) 모드</strong>입니다. 표시되는 데이터는 예시이며, 실제 데이터베이스와 연동되지 않습니다.
        </Alert>
      )}

      {/* Metrics */}
      <Grid container spacing={{ xs: 1, sm: 2.5, md: 3 }}>
        <Grid item xs={6} sm={6} md={3}>
          <MetricCard
            label="오늘 예약"
            value={todayAppointments}
            hint="오늘 기준"
            colorIndex={0}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <MetricCard
            label="월간 순이익"
            value={`₩${Number(monthlyProfit).toLocaleString()}`}
            hint="이번 달 기준"
            colorIndex={1}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <MetricCard
            label="이번 달 신규 고객"
            value={monthlyNewCustomers}
            hint="이번 달 기준"
            colorIndex={2}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <MetricCard
            label="이번 달 총 예약"
            value={monthlyAppointments}
            hint="이번 달 기준"
            colorIndex={3}
          />
        </Grid>
      </Grid>

      {/* Main Content Areas */}
      <Grid container spacing={{ xs: 1.5, sm: 2.5, md: 3 }}>
        {/* Expanded Products Section */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ background: 'linear-gradient(to right, #059669, #0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                판매 중인 상품
              </Typography>
              <Link href="/products" style={{ fontSize: '0.75rem', color: '#64748B', textDecoration: 'none' }}>
                전체보기 →
              </Link>
            </Box>
            {activeProducts.length > 0 ? (
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                {activeProducts.slice(0, 12).map((p: ProductSummary) => (
                  <Grid item xs={6} sm={6} md={4} key={p.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          bgcolor: 'rgba(16, 185, 129, 0.04)',
                          borderColor: 'success.light',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 24px -10px rgba(16, 185, 129, 0.2)'
                        }
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ mb: 1, color: 'text.primary' }}>
                        {p.name}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="success.main">
                        ₩{Number(p.price || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  등록된 상품이 없습니다. <Link href="/products" style={{ color: '#3B82F6' }}>상품 추가하기</Link>
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Recent Appointments */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 2.5, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ background: 'linear-gradient(to right, #db2777, #e11d48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                최근 예약
              </Typography>
              <Link href="/appointments" style={{ fontSize: '0.75rem', color: '#64748B', textDecoration: 'none' }}>
                전체보기 →
              </Link>
            </Box>
            <List disablePadding>
              {recentAppointments.length > 0 ? recentAppointments.slice(0, 8).map((a: RecentAppointment) => (
                <ListItem key={a.id} disableGutters sx={{ py: 1.75, px: 1, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                  <ListItemText
                    primary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight={600}>{a.customer_name}</Typography>
                        <Typography variant="caption" color="primary.main">{a.product_name}</Typography>
                      </Box>
                    }
                    secondary={String(a.appointment_date).slice(0, 16).replace('T', ' ')}
                    secondaryTypographyProps={{ variant: 'caption', sx: { mt: 0.5, display: 'block' } }}
                  />
                </ListItem>
              )) : (
                <Box sx={{ py: 10, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    예약 내역이 없습니다.
                  </Typography>
                </Box>
              )}
            </List>
          </Card>
        </Grid>

        {/* Full-width Recent Transactions Table */}
        <Grid item xs={12}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 2.5, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                최근 거래 내역
              </Typography>
              <Link href="/finance" style={{ fontSize: '0.75rem', color: '#64748B', textDecoration: 'none' }}>
                전체보기 →
              </Link>
            </Box>
            <RecentTransactionsTable transactions={recentTransactions.slice(0, 10) as Transaction[]} />
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
