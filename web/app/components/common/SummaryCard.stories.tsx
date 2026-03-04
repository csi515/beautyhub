import type { Meta, StoryObj } from '@storybook/react'
import SummaryCard from './SummaryCard'
import { TrendingUp, TrendingDown, DollarSign, Users, Package, Calendar } from 'lucide-react'

const meta: Meta<typeof SummaryCard> = {
  title: 'Common/SummaryCard',
  component: SummaryCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '공통 Summary Card 컴포넌트. 여러 요약 정보를 카드 형태로 표시합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: false,
      description: '표시할 요약 카드 아이템 배열',
    },
    columns: {
      control: 'object',
      description: '반응형 그리드 컬럼 설정',
    },
  },
}

export default meta
type Story = StoryObj<typeof SummaryCard>

// 기본 상태
export const Default: Story = {
  args: {
    items: [
      {
        label: '총 수입',
        value: 5000000,
        icon: TrendingUp,
        color: 'success',
      },
      {
        label: '총 지출',
        value: 3000000,
        icon: TrendingDown,
        color: 'error',
      },
      {
        label: '순이익',
        value: 2000000,
        icon: DollarSign,
        color: 'info',
      },
    ],
  },
}

// 색상별 예시
export const ColorVariants: Story = {
  args: {
    items: [
      {
        label: '성공',
        value: 1000,
        icon: TrendingUp,
        color: 'success',
      },
      {
        label: '오류',
        value: 500,
        icon: TrendingDown,
        color: 'error',
      },
      {
        label: '경고',
        value: 750,
        icon: DollarSign,
        color: 'warning',
      },
      {
        label: '정보',
        value: 1200,
        icon: Users,
        color: 'info',
      },
      {
        label: '기본',
        value: 800,
        icon: Package,
        color: 'default',
      },
    ],
  },
}

// 아이콘 없음
export const WithoutIcons: Story = {
  args: {
    items: [
      {
        label: '총 고객',
        value: 1250,
        color: 'default',
      },
      {
        label: '활성 상품',
        value: 85,
        color: 'info',
      },
      {
        label: '이번 달 예약',
        value: 320,
        color: 'success',
      },
    ],
  },
}

// 문자열 값
export const StringValues: Story = {
  args: {
    items: [
      {
        label: '상태',
        value: '정상 운영',
        color: 'success',
      },
      {
        label: '버전',
        value: 'v1.2.3',
        color: 'info',
      },
      {
        label: '모드',
        value: '프로덕션',
        color: 'default',
      },
    ],
  },
}

// 큰 숫자 포맷팅
export const LargeNumbers: Story = {
  args: {
    items: [
      {
        label: '총 매출',
        value: 150000000,
        icon: DollarSign,
        color: 'success',
      },
      {
        label: '총 지출',
        value: 95000000,
        icon: TrendingDown,
        color: 'error',
      },
      {
        label: '순이익',
        value: 55000000,
        icon: TrendingUp,
        color: 'info',
      },
    ],
  },
}

// 커스텀 포맷팅
export const CustomFormatting: Story = {
  args: {
    items: [
      {
        label: '평균 주문액',
        value: 125000,
        icon: DollarSign,
        color: 'success',
        formatValue: (value) => `₩${(value / 1000).toFixed(0)}K`,
      },
      {
        label: '고객 수',
        value: 1250,
        icon: Users,
        color: 'info',
        formatValue: (value) => `${value.toLocaleString()}명`,
      },
      {
        label: '예약 수',
        value: 320,
        icon: Calendar,
        color: 'default',
        formatValue: (value) => `${value}건`,
      },
    ],
  },
}

// 서브타이틀 포함
export const WithSubtitles: Story = {
  args: {
    items: [
      {
        label: '이번 달 매출',
        value: 5000000,
        icon: TrendingUp,
        color: 'success',
        subtitle: '지난 달 대비 +15%',
      },
      {
        label: '이번 달 지출',
        value: 3000000,
        icon: TrendingDown,
        color: 'error',
        subtitle: '지난 달 대비 -5%',
      },
      {
        label: '순이익',
        value: 2000000,
        icon: DollarSign,
        color: 'info',
        subtitle: '마진률 40%',
      },
    ],
  },
}

// 재무 대시보드 예시
export const FinanceDashboard: Story = {
  args: {
    items: [
      {
        label: '월간 수입',
        value: 5000000,
        icon: TrendingUp,
        color: 'success',
        formatValue: (value) => {
          if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`
          if (value >= 10000) return `${(value / 10000).toFixed(0)}만`
          return value.toLocaleString()
        },
      },
      {
        label: '월간 지출',
        value: 3000000,
        icon: TrendingDown,
        color: 'error',
        formatValue: (value) => {
          if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`
          if (value >= 10000) return `${(value / 10000).toFixed(0)}만`
          return value.toLocaleString()
        },
      },
      {
        label: '월간 순이익',
        value: 2000000,
        icon: DollarSign,
        color: 'success',
        formatValue: (value) => {
          if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`
          if (value >= 10000) return `${(value / 10000).toFixed(0)}만`
          return value.toLocaleString()
        },
      },
    ],
    columns: { xs: 12, sm: 4 },
  },
  parameters: {
    docs: {
      description: {
        story: '실제 사용 예시: 재무 관리 페이지',
      },
    },
  },
}

// 커스텀 컬럼 설정
export const CustomColumns: Story = {
  args: {
    items: [
      {
        label: '카드 1',
        value: 1000,
        color: 'success',
      },
      {
        label: '카드 2',
        value: 2000,
        color: 'info',
      },
      {
        label: '카드 3',
        value: 3000,
        color: 'warning',
      },
      {
        label: '카드 4',
        value: 4000,
        color: 'error',
      },
    ],
    columns: { xs: 6, sm: 3, md: 3 },
  },
}

// 아이콘 색상 커스터마이징
export const CustomIconColors: Story = {
  args: {
    items: [
      {
        label: '커스텀 색상 1',
        value: 1000,
        icon: TrendingUp,
        iconColor: '#8b5cf6',
        color: 'default',
      },
      {
        label: '커스텀 색상 2',
        value: 2000,
        icon: DollarSign,
        iconColor: '#ec4899',
        color: 'default',
      },
      {
        label: '커스텀 색상 3',
        value: 3000,
        icon: Users,
        iconColor: '#10b981',
        color: 'default',
      },
    ],
  },
}
