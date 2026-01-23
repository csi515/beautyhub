import { cookies } from 'next/headers'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { Box } from '@mui/material'
import DashboardContent from './DashboardContent'

import { DashboardService } from '../lib/services/dashboard.service'

function getTodayRange() {
  return DashboardService.getTodayRange()
}

function monthBounds() {
  return DashboardService.getMonthBounds()
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

  try {
    // Combined fetch
    const [apRes, , , cuMonth, apRecent, trRecent, exRecent, exMonth, trMonth, productsRes, apMonthRes, apStatsRes] = await Promise.all([
      supabase
        .from('beautyhub_appointments')
        .select('id, appointment_date')
        .eq('owner_id', userId)
        .gte('appointment_date', start)
        .lt('appointment_date', end),
      supabase.from('beautyhub_transactions').select('id').eq('owner_id', userId).gte('transaction_date', start).lt('transaction_date', end),

      supabase
        .from('beautyhub_customers')
        .select('id, created_at')
        .eq('owner_id', userId)
        .gte('created_at', start)
        .lt('created_at', end),
      // Monthly New Customers
      supabase
        .from('beautyhub_customers')
        .select('id, created_at')
        .eq('owner_id', userId)
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd),
      // Recent Appointments
      supabase
        .from('beautyhub_appointments')
        .select('id, appointment_date, status, notes, customer_id, service_id')
        .eq('owner_id', userId)
        .order('appointment_date', { ascending: false })
        .limit(10),
      // Recent Transactions
      supabase
        .from('beautyhub_transactions')
        .select('id, amount, transaction_date, created_at, memo')
        .eq('owner_id', userId)
        .order('transaction_date', { ascending: false })
        .limit(10),
      // Recent Expenses
      supabase
        .from('beautyhub_expenses')
        .select('id, amount, expense_date, created_at, memo, category')
        .eq('owner_id', userId)
        .order('expense_date', { ascending: false })
        .limit(10),
      // Monthly Expenses (for Profit)
      supabase.from('beautyhub_expenses').select('id, amount, expense_date').eq('owner_id', userId).gte('expense_date', fromDate).lte('expense_date', toDate),
      // Monthly Transactions (for Profit)
      supabase.from('beautyhub_transactions').select('id, amount, transaction_date, created_at').eq('owner_id', userId).limit(500),
      // Products
      supabase
        .from('beautyhub_products')
        .select('id, name, price, active')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),
      // Monthly Appointments Count
      supabase
        .from('beautyhub_appointments')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', userId)
        .gte('appointment_date', monthStart)
        .lte('appointment_date', monthEnd),
      // Stats Appointments (for Top Services)
      supabase
        .from('beautyhub_appointments')
        .select('id, service_id')
        .eq('owner_id', userId)
        .order('appointment_date', { ascending: false })
        .limit(100)
    ])

    // Raw data 준비
    const rawData = {
      todayAppointments: apRes.data || [],
      monthlyAppointments: apMonthRes.count || 0, // count 사용
      monthlyNewCustomers: cuMonth.data || [],
      monthlyTransactions: trMonth.data || [],
      monthlyExpenses: exMonth.data || [],
      recentAppointments: apRecent.data || [],
      recentTransactions: trRecent.data || [],
      recentExpenses: exRecent.data || [],
      products: productsRes.data || [],
      appointmentStats: apStatsRes.data || []
    }

    // 고객/제품 매핑 생성
    const apRecentData = Array.isArray(apRecent.data) ? apRecent.data : []
    const apStatsData = Array.isArray(apStatsRes.data) ? apStatsRes.data : []

    const apIds = apRecentData.map((a: any) => ({
      customer_id: a.customer_id,
      service_id: a.service_id,
    }))
    const statsIds = apStatsData.map((a: any) => ({
      service_id: a.service_id
    }))

    const cIds = Array.from(new Set(apIds.map(x => x.customer_id).filter(Boolean))) as string[]
    const sIds = Array.from(new Set([...apIds, ...statsIds].map(x => x.service_id).filter(Boolean))) as string[]

    const customersById: Record<string, string> = {}
    const productsById: Record<string, string> = {}

    if (cIds.length > 0) {
      const { data } = await supabase.from('beautyhub_customers').select('id,name').in('id', cIds)
      if (data) data.forEach((c: any) => customersById[c.id] = c.name)
    }
    if (sIds.length > 0) {
      const { data } = await supabase.from('beautyhub_products').select('id,name').in('id', sIds)
      if (data) data.forEach((p: any) => productsById[p.id] = p.name)
    }

    // Service 레이어를 사용한 데이터 가공
    const processed = DashboardService.processDashboardData(
      rawData,
      customersById,
      productsById,
      fromDate,
      toDate
    )

    return {
      todayAppointments: processed.todayAppointments,
      monthlyProfit: processed.monthlyProfit,
      monthlyNewCustomers: processed.monthlyNewCustomers,
      monthlyAppointments: processed.monthlyAppointments,
      recentAppointments: processed.recentAppointments,
      chartAppointments: processed.chartAppointments,
      recentTransactions: processed.recentTransactions,
      monthlyRevenueData: processed.monthlyRevenueData,
      activeProducts: processed.activeProducts
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    return {
      todayAppointments: 0,
      monthlyProfit: 0,
      monthlyNewCustomers: 0,
      monthlyAppointments: 0,
      recentAppointments: [],
      chartAppointments: [],
      recentTransactions: [],
      monthlyRevenueData: [],
      activeProducts: []
    }
  }
}

export default async function DashboardPage() {
  const cookieStore = cookies()
  const userId = await getUserIdFromCookies()
  const accessToken = cookieStore.get('sb:token')?.value || cookieStore.get('sb-access-token')?.value

  if (!userId) {
    return <Box p={3}>Loading...</Box>
  }

  const { start, end } = getTodayRange()

  // Fetch data in Server Component
  const data = await getDashboardData({ start, end, userId, accessToken })

  return (
    <DashboardContent start={start} end={end} userId={userId} accessToken={accessToken} initialData={data} />
  )
}
