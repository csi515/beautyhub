import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { CustomersRepository } from '@/app/lib/repositories/customers.repository'
import { TransactionsRepository } from '@/app/lib/repositories/transactions.repository'
import { AppointmentsRepository } from '@/app/lib/repositories/appointments.repository'
import { logger } from '@/app/lib/utils/logger'

/**
 * GET /api/analytics/customer-ltv
 * 고객 생애가치(LTV) 분석
 */
export const GET = withAuth(async (_request: NextRequest, { userId, supabase }) => {
  try {
    const customersRepo = new CustomersRepository(userId, supabase)
    const transactionsRepo = new TransactionsRepository(userId, supabase)
    const appointmentsRepo = new AppointmentsRepository(userId, supabase)

    const customers = await customersRepo.findAll({ limit: 1000 })
    const allTransactions = await transactionsRepo.findAll({ limit: 10000 })
    const allAppointments = await appointmentsRepo.findAll({ limit: 10000 })

    const customerLTVs = customers.map((customer) => {
      const transactions = allTransactions.filter(t => t.customer_id === customer.id)
      const appointments = allAppointments.filter(a => a.customer_id === customer.id)

      const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
      const transactionCount = transactions.length
      const avgRevenue = transactionCount > 0 ? totalRevenue / transactionCount : 0
      const visitCount = appointments.length
      const returnRate = visitCount > 1 ? ((visitCount - 1) / visitCount) * 100 : 0

      const sortedAppointments = [...appointments].sort((a, b) =>
        new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
      )

      const firstVisit = sortedAppointments[0]?.appointment_date || null
      const lastVisit = sortedAppointments[sortedAppointments.length - 1]?.appointment_date || null

      return {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        total_revenue: totalRevenue,
        avg_revenue: avgRevenue,
        transaction_count: transactionCount,
        visit_count: visitCount,
        return_rate: returnRate,
        first_visit: firstVisit,
        last_visit: lastVisit,
      }
    })

    const sortedLTVs = customerLTVs.sort((a, b) => b.total_revenue - a.total_revenue)

    return NextResponse.json(sortedLTVs)
  } catch (error) {
    logger.error('Error calculating customer LTV', error, 'CustomerLTV')
    return NextResponse.json(
      { error: 'Failed to calculate customer LTV' },
      { status: 500 }
    )
  }
})

