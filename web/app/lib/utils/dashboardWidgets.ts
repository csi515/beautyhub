/**
 * 대시보드 위젯 관리 유틸리티
 */

export type WidgetType = 
  | 'metrics' 
  | 'revenue_chart' 
  | 'top_services_chart' 
  | 'products' 
  | 'recent_appointments' 
  | 'recent_transactions'
  | 'budget_summary'
  | 'inventory_alerts'

export interface WidgetConfig {
  id: string
  type: WidgetType
  position: number // 정렬 순서
  visible: boolean
  size?: 'small' | 'medium' | 'large' // 선택적 크기 설정
}

export interface DashboardPreset {
  id: string
  name: string
  widgets: WidgetConfig[]
  created_at: string
}

const STORAGE_KEY = 'dashboard_widgets'
const PRESETS_KEY = 'dashboard_presets'

/**
 * 기본 위젯 구성
 */
export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'metrics', type: 'metrics', position: 0, visible: true },
  { id: 'revenue_chart', type: 'revenue_chart', position: 1, visible: true },
  { id: 'top_services_chart', type: 'top_services_chart', position: 2, visible: true },
  { id: 'products', type: 'products', position: 3, visible: true },
  { id: 'recent_appointments', type: 'recent_appointments', position: 4, visible: true },
  { id: 'recent_transactions', type: 'recent_transactions', position: 5, visible: true },
]

/**
 * 위젯 메타데이터
 */
export const WIDGET_METADATA: Record<WidgetType, { name: string; description: string; defaultSize: 'small' | 'medium' | 'large' }> = {
  metrics: { name: '주요 지표', description: '오늘 예약, 월간 순이익, 신규 고객 등', defaultSize: 'medium' },
  revenue_chart: { name: '매출 차트', description: '일별/월별 매출 추이', defaultSize: 'large' },
  top_services_chart: { name: '인기 서비스', description: '인기 서비스 통계', defaultSize: 'medium' },
  products: { name: '판매 중인 상품', description: '활성 상품 목록', defaultSize: 'large' },
  recent_appointments: { name: '최근 예약', description: '최근 예약 내역', defaultSize: 'medium' },
  recent_transactions: { name: '최근 거래', description: '최근 거래 내역', defaultSize: 'large' },
  budget_summary: { name: '예산 요약', description: '월별 예산 현황', defaultSize: 'medium' },
  inventory_alerts: { name: '재고 알림', description: '재고 부족 알림', defaultSize: 'small' },
}

/**
 * 현재 위젯 구성 로드
 */
export function loadWidgets(): WidgetConfig[] {
  if (typeof window === 'undefined') return DEFAULT_WIDGETS

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const widgets = JSON.parse(stored) as WidgetConfig[]
      // 기본 위젯과 병합하여 누락된 위젯 추가
      const widgetIds = new Set(widgets.map((w) => w.id))
      const missingWidgets = DEFAULT_WIDGETS.filter((w) => !widgetIds.has(w.id))
      return [...widgets, ...missingWidgets].sort((a, b) => a.position - b.position)
    }
  } catch (error) {
    console.error('위젯 구성 로드 실패:', error)
  }

  return DEFAULT_WIDGETS
}

/**
 * 위젯 구성 저장
 */
export function saveWidgets(widgets: WidgetConfig[]): void {
  if (typeof window === 'undefined') return

  try {
    // position 재정렬
    const sortedWidgets = widgets.map((w, index) => ({
      ...w,
      position: index,
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedWidgets))
  } catch (error) {
    console.error('위젯 구성 저장 실패:', error)
  }
}

/**
 * 위젯 위치 변경
 */
export function moveWidget(widgets: WidgetConfig[], fromIndex: number, toIndex: number): WidgetConfig[] {
  const newWidgets = [...widgets]
  const [moved] = newWidgets.splice(fromIndex, 1)
  newWidgets.splice(toIndex, 0, moved)
  return newWidgets.map((w, index) => ({ ...w, position: index }))
}

/**
 * 위젯 표시/숨김 토글
 */
export function toggleWidget(widgets: WidgetConfig[], widgetId: string): WidgetConfig[] {
  return widgets.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w))
}

/**
 * 위젯 추가
 */
export function addWidget(widgets: WidgetConfig[], type: WidgetType): WidgetConfig[] {
  const newWidget: WidgetConfig = {
    id: `${type}_${Date.now()}`,
    type,
    position: widgets.length,
    visible: true,
    size: WIDGET_METADATA[type].defaultSize,
  }
  return [...widgets, newWidget]
}

/**
 * 위젯 제거
 */
export function removeWidget(widgets: WidgetConfig[], widgetId: string): WidgetConfig[] {
  return widgets.filter((w) => w.id !== widgetId).map((w, index) => ({ ...w, position: index }))
}

/**
 * 프리셋 저장
 */
export function savePreset(name: string, widgets: WidgetConfig[]): DashboardPreset {
  if (typeof window === 'undefined') {
    throw new Error('브라우저 환경에서만 사용 가능합니다')
  }

  const presets = loadPresets()
  const newPreset: DashboardPreset = {
    id: `preset_${Date.now()}`,
    name,
    widgets,
    created_at: new Date().toISOString(),
  }

  presets.push(newPreset)
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
  return newPreset
}

/**
 * 프리셋 로드
 */
export function loadPresets(): DashboardPreset[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(PRESETS_KEY)
    return stored ? (JSON.parse(stored) as DashboardPreset[]) : []
  } catch (error) {
    console.error('프리셋 로드 실패:', error)
    return []
  }
}

/**
 * 프리셋 삭제
 */
export function deletePreset(presetId: string): void {
  if (typeof window === 'undefined') return

  const presets = loadPresets().filter((p) => p.id !== presetId)
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
}

/**
 * 프리셋 적용
 */
export function applyPreset(preset: DashboardPreset): void {
  saveWidgets(preset.widgets)
}

/**
 * 기본 프리셋으로 복원
 */
export function resetToDefault(): WidgetConfig[] {
  saveWidgets(DEFAULT_WIDGETS)
  return DEFAULT_WIDGETS
}
