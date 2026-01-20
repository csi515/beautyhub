/**
 * 시계열 매출 예측 알고리즘
 * 선형 회귀 기반 간단한 예측 모델
 */

export interface ForecastDataPoint {
  date: string
  actual: number
  predicted?: number
}

export interface ForecastResult {
  data: ForecastDataPoint[]
  trend: number // 월별 증가/감소 추세
  predictedNextMonth: number
  predictedNextQuarter: number[]
  confidence: number // 0-1 사이의 신뢰도
}

/**
 * 단순 선형 회귀를 이용한 예측
 */
function linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
  const n = x.length
  if (n === 0) return { slope: 0, intercept: 0 }

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0

  for (let i = 0; i < n; i++) {
    sumX += x[i]
    sumY += y[i]
    sumXY += x[i] * y[i]
    sumXX += x[i] * x[i]
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return { slope, intercept }
}

/**
 * 시계열 매출 예측
 */
export function forecastRevenue(historicalData: Array<{ date: string; revenue: number }>): ForecastResult {
  if (historicalData.length === 0) {
    return {
      data: [],
      trend: 0,
      predictedNextMonth: 0,
      predictedNextQuarter: [0, 0, 0],
      confidence: 0,
    }
  }

  // 최소 3개월 이상 데이터가 있어야 예측 가능
  if (historicalData.length < 3) {
    return {
      data: historicalData.map((d) => ({ date: d.date, actual: d.revenue })),
      trend: 0,
      predictedNextMonth: historicalData[historicalData.length - 1]?.revenue || 0,
      predictedNextQuarter: [historicalData[historicalData.length - 1]?.revenue || 0, 0, 0],
      confidence: 0.3,
    }
  }

  // 날짜 순 정렬
  const sorted = [...historicalData].sort((a, b) => a.date.localeCompare(b.date))

  // X축: 월 인덱스 (0부터 시작)
  const x = sorted.map((_, index) => index)
  const y = sorted.map((d) => d.revenue)

  // 선형 회귀 계산
  const { slope, intercept } = linearRegression(x, y)

  // 예측 데이터 생성
  const data: ForecastDataPoint[] = sorted.map((d, index) => {
    const predicted = slope * index + intercept
    return {
      date: d.date,
      actual: d.revenue,
      predicted: Math.max(0, predicted), // 음수 방지
    }
  })

  // 다음 3개월 예측
  const lastIndex = sorted.length
  const predictedNextMonth = Math.max(0, slope * lastIndex + intercept)
  const predictedNextQuarter = [
    Math.max(0, slope * (lastIndex + 0) + intercept),
    Math.max(0, slope * (lastIndex + 1) + intercept),
    Math.max(0, slope * (lastIndex + 2) + intercept),
  ]

  // 신뢰도 계산 (데이터 포인트가 많을수록, 변동성이 낮을수록 높음)
  const variance = calculateVariance(y)
  const mean = y.reduce((sum, val) => sum + val, 0) / y.length
  const coefficientOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 1
  const confidence = Math.max(0.1, Math.min(0.9, 1 - coefficientOfVariation))

  return {
    data,
    trend: slope, // 월별 증가/감소 추세
    predictedNextMonth,
    predictedNextQuarter,
    confidence,
  }
}

/**
 * 분산 계산
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
}

/**
 * 계절성 분석 (간단한 월별 패턴)
 */
export function analyzeSeasonality(historicalData: Array<{ date: string; revenue: number }>): Record<number, number> {
  const monthlyAverages: Record<number, { sum: number; count: number }> = {}

  historicalData.forEach((d) => {
    const date = new Date(d.date)
    const month = date.getMonth() // 0-11
    if (!monthlyAverages[month]) {
      monthlyAverages[month] = { sum: 0, count: 0 }
    }
    monthlyAverages[month].sum += d.revenue
    monthlyAverages[month].count += 1
  })

  const seasonality: Record<number, number> = {}
  Object.keys(monthlyAverages).forEach((monthStr) => {
    const month = parseInt(monthStr)
    const { sum, count } = monthlyAverages[month]
    seasonality[month] = count > 0 ? sum / count : 0
  })

  return seasonality
}
