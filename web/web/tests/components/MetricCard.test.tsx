/**
 * MetricCard 컴포넌트 테스트
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MetricCard from '@/app/components/MetricCard'

describe('MetricCard', () => {
  it('기본 렌더링', () => {
    render(<MetricCard label="테스트" value={100} />)
    expect(screen.getByText('테스트')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('문자열 값 렌더링', () => {
    render(<MetricCard label="매출" value="₩1,000,000" />)
    expect(screen.getByText('매출')).toBeInTheDocument()
    expect(screen.getByText('₩1,000,000')).toBeInTheDocument()
  })

  it('delta 표시', () => {
    render(
      <MetricCard
        label="테스트"
        value={100}
        delta={{ value: '+10%', tone: 'up' }}
      />
    )
    expect(screen.getByText('+10%')).toBeInTheDocument()
  })

  it('hint 표시', () => {
    render(<MetricCard label="테스트" value={100} hint="오늘 기준" />)
    expect(screen.getByText('오늘 기준')).toBeInTheDocument()
  })

  it('커스텀 className 적용', () => {
    const { container } = render(
      <MetricCard label="테스트" value={100} className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

