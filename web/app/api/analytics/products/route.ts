import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { ProductsRepository } from '@/app/lib/repositories/products.repository'
import { TransactionsRepository } from '@/app/lib/repositories/transactions.repository'
import { AppointmentsRepository } from '@/app/lib/repositories/appointments.repository'
import { subMonths } from 'date-fns'

/**
 * GET /api/analytics/products
 * 제품 수익성 분석
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const months = parseInt(searchParams.get('months') || '3') // 기본 3개월

    const productsRepo = new ProductsRepository(userId, supabase)
    const transactionsRepo = new TransactionsRepository(userId, supabase)
    const appointmentsRepo = new AppointmentsRepository(userId, supabase)

    const startDate = subMonths(new Date(), months)

    // 모든 제품 및 거래 데이터 조회
    const allProducts = await productsRepo.findAll({ limit: 10000 })
    const allTransactions = await transactionsRepo.findAll({ limit: 50000 })
    const allAppointments = await appointmentsRepo.findAll({ limit: 50000 })
    
    // 날짜 필터링
    const filteredTransactions = allTransactions.filter((t) => {
      const transactionDate = t.transaction_date || t.created_at
      return transactionDate && new Date(transactionDate) >= startDate
    })
    const filteredAppointments = allAppointments.filter((a) => {
      const appointmentDate = a.appointment_date || a.created_at
      return appointmentDate && new Date(appointmentDate) >= startDate
    })

    // 제품별 분석
    const productAnalysis = allProducts.map((product) => {
      // 해당 제품과 연관된 거래 (예약에서 서비스로 연결된 거래)
      const productTransactions = filteredTransactions.filter((t) => {
        if (!t.appointment_id) return false
        const appointment = filteredAppointments.find((a) => a.id === t.appointment_id)
        return appointment?.service_id === product.id
      })

      // 해당 제품 예약 수
      const productAppointments = filteredAppointments.filter((a) => a.service_id === product.id)

      // 총 매출
      const totalRevenue = productTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)

      // 판매 횟수 (예약 수)
      const salesCount = productAppointments.length

      // 평균 매출
      const avgRevenue = salesCount > 0 ? totalRevenue / salesCount : 0

      // 회전율 (판매 횟수 / 기간)
      const turnoverRate = salesCount / months

      // 마진율 계산 (제품 가격 기준, 실제 마진 데이터가 없으므로 가격의 70%로 추정)
      const costPrice = (product.price || 0) * 0.3 // 가격의 30%를 원가로 가정
      const margin = (product.price || 0) - costPrice
      const marginRate = product.price > 0 ? (margin / product.price) * 100 : 0

      // 총 마진
      const totalMargin = salesCount * margin

      // 수익성 점수 (매출 * 마진율 * 회전율)
      const profitabilityScore = totalRevenue * (marginRate / 100) * turnoverRate

      return {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price || 0,
        sales_count: salesCount,
        total_revenue: totalRevenue,
        avg_revenue: avgRevenue,
        turnover_rate: turnoverRate,
        margin_rate: marginRate,
        total_margin: totalMargin,
        profitability_score: profitabilityScore,
        stock_count: product.stock_count || 0,
        safety_stock: product.safety_stock || 0,
        active: product.active !== false,
      }
    })

    // 수익성 낮은 제품 식별 (수익성 점수 기준 하위 20%)
    const sortedByProfitability = [...productAnalysis].sort((a, b) => a.profitability_score - b.profitability_score)
    const lowProfitabilityThreshold = sortedByProfitability[Math.floor(sortedByProfitability.length * 0.2)]?.profitability_score || 0
    const lowProfitabilityProducts = productAnalysis.filter((p) => p.profitability_score <= lowProfitabilityThreshold && p.sales_count > 0)

    // Top 10 수익성 높은 제품
    const topProfitabilityProducts = [...productAnalysis]
      .filter((p) => p.sales_count > 0)
      .sort((a, b) => b.profitability_score - a.profitability_score)
      .slice(0, 10)

    // Top 10 매출 제품
    const topRevenueProducts = [...productAnalysis]
      .filter((p) => p.sales_count > 0)
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10)

    // Top 10 회전율 제품
    const topTurnoverProducts = [...productAnalysis]
      .filter((p) => p.sales_count > 0)
      .sort((a, b) => b.turnover_rate - a.turnover_rate)
      .slice(0, 10)

    return NextResponse.json({
      products: productAnalysis,
      topProfitability: topProfitabilityProducts,
      topRevenue: topRevenueProducts,
      topTurnover: topTurnoverProducts,
      lowProfitability: lowProfitabilityProducts,
      summary: {
        totalProducts: allProducts.length,
        activeProducts: allProducts.filter((p) => p.active !== false).length,
        period: `${months}개월`,
      },
    })
  } catch (error) {
    console.error('제품 수익성 분석 실패:', error)
    return NextResponse.json(
      { error: 'Failed to analyze product profitability', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
