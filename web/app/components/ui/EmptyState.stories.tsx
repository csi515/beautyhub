import type { Meta, StoryObj } from '@storybook/react'
import EmptyState from './EmptyState'
import { Package, Users, Calendar, FileText, Search } from 'lucide-react'

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '공통 EmptyState 컴포넌트. 데이터가 없을 때 사용자에게 명확한 안내를 제공합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: false,
      description: '아이콘 컴포넌트',
    },
    title: {
      control: 'text',
      description: '제목',
    },
    description: {
      control: 'text',
      description: '설명',
    },
    actionLabel: {
      control: 'text',
      description: '액션 버튼 라벨',
    },
    onAction: {
      control: false,
      description: '액션 버튼 클릭 핸들러',
    },
  },
}

export default meta
type Story = StoryObj<typeof EmptyState>

// 기본 상태
export const Default: Story = {
  args: {
    title: '데이터가 없습니다',
    description: '표시할 데이터가 없습니다.',
  },
}

// 아이콘 포함
export const WithIcon: Story = {
  args: {
    icon: Package,
    title: '상품이 없습니다',
    description: '아직 등록된 상품이 없습니다. 첫 상품을 등록해보세요!',
  },
}

// 액션 버튼 포함
export const WithAction: Story = {
  args: {
    icon: Users,
    title: '고객이 없습니다',
    description: '아직 등록된 고객이 없습니다.',
    actionLabel: '고객 추가하기',
    onAction: () => alert('고객 추가'),
  },
}

// 다양한 메시지 타입
export const NoProducts: Story = {
  args: {
    icon: Package,
    title: '등록된 상품이 없어요',
    description: '첫 상품을 등록하고 비즈니스를 시작해보세요!',
    actionLabel: '상품 등록하기',
    onAction: () => alert('상품 등록'),
  },
}

export const NoCustomers: Story = {
  args: {
    icon: Users,
    title: '등록된 고객이 없어요',
    description: '고객을 등록하고 관리해보세요.',
    actionLabel: '고객 추가하기',
    onAction: () => alert('고객 추가'),
  },
}

export const NoAppointments: Story = {
  args: {
    icon: Calendar,
    title: '예약이 없습니다',
    description: '아직 등록된 예약이 없습니다.',
    actionLabel: '예약 추가하기',
    onAction: () => alert('예약 추가'),
  },
}

export const NoResults: Story = {
  args: {
    icon: Search,
    title: '검색 결과가 없습니다',
    description: '다른 검색어로 시도해보세요.',
  },
}

export const NoDocuments: Story = {
  args: {
    icon: FileText,
    title: '문서가 없습니다',
    description: '아직 생성된 문서가 없습니다.',
    actionLabel: '문서 만들기',
    onAction: () => alert('문서 만들기'),
  },
}

// 모바일 뷰
export const MobileView: Story = {
  args: {
    icon: Package,
    title: '모바일 빈 상태',
    description: '모바일 화면에서의 빈 상태 표시입니다.',
    actionLabel: '추가하기',
    onAction: () => alert('추가'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'iPhone SE',
    },
  },
}

// 실제 사용 예시
export const RealWorldExample: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: 600 }}>
      <EmptyState
        icon={Package}
        title="상품이 없습니다"
        description="첫 상품을 등록하고 비즈니스를 시작해보세요!"
        actionLabel="상품 등록하기"
        onAction={() => alert('상품 등록')}
      />
      
      <EmptyState
        icon={Search}
        title="검색 결과가 없습니다"
        description="다른 검색어로 시도해보세요."
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '실제 사용 예시: 다양한 빈 상태 조합',
      },
    },
  },
}
