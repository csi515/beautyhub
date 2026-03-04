import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within } from '@storybook/test'
import Button from './Button'
import { Plus, Trash2, Download } from 'lucide-react'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '공통 Button 컴포넌트. 모바일 우선 설계로 최소 터치 타겟 44px을 보장합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost', 'outline', 'contrast'],
      description: '버튼 스타일 변형',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: '버튼 크기 (모바일에서 최소 44px 보장)',
    },
    loading: {
      control: 'boolean',
      description: '로딩 상태 표시',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
    leftIcon: {
      control: false,
      description: '왼쪽 아이콘',
    },
    rightIcon: {
      control: false,
      description: '오른쪽 아이콘',
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

// 기본 상태
export const Default: Story = {
  args: {
    children: '버튼',
    variant: 'primary',
    size: 'md',
  },
}

// Variants
export const Primary: Story = {
  args: {
    children: 'Primary 버튼',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary 버튼',
    variant: 'secondary',
  },
}

export const Danger: Story = {
  args: {
    children: 'Danger 버튼',
    variant: 'danger',
  },
}

export const Outline: Story = {
  args: {
    children: 'Outline 버튼',
    variant: 'outline',
  },
}

export const Ghost: Story = {
  args: {
    children: 'Ghost 버튼',
    variant: 'ghost',
  },
}

export const Contrast: Story = {
  args: {
    children: 'Contrast 버튼',
    variant: 'contrast',
  },
}

// Sizes
export const Small: Story = {
  args: {
    children: 'Small 버튼',
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    children: 'Medium 버튼',
    size: 'md',
  },
}

export const Large: Story = {
  args: {
    children: 'Large 버튼',
    size: 'lg',
  },
}

// 로딩 상태
export const Loading: Story = {
  args: {
    children: '로딩 중...',
    loading: true,
  },
}

export const LoadingWithText: Story = {
  args: {
    children: '저장 중',
    loading: true,
    variant: 'primary',
  },
}

// 아이콘 포함
export const WithLeftIcon: Story = {
  args: {
    children: '추가하기',
    leftIcon: <Plus size={20} />,
  },
}

export const WithRightIcon: Story = {
  args: {
    children: '다운로드',
    rightIcon: <Download size={20} />,
  },
}

export const WithBothIcons: Story = {
  args: {
    children: '삭제',
    leftIcon: <Trash2 size={20} />,
    variant: 'danger',
  },
}

// 비활성화 상태
export const Disabled: Story = {
  args: {
    children: '비활성화',
    disabled: true,
  },
}

export const DisabledLoading: Story = {
  args: {
    children: '로딩 중 (비활성화)',
    loading: true,
    disabled: true,
  },
}

// 모바일 뷰
export const MobileView: Story = {
  args: {
    children: '모바일 버튼',
    variant: 'primary',
    size: 'md',
  },
  parameters: {
    viewport: {
      defaultViewport: 'iPhone SE',
    },
  },
}

// Interaction 테스트
export const ClickInteraction: Story = {
  args: {
    children: '클릭해보세요',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /클릭해보세요/i })
    
    await userEvent.click(button)
    await expect(button).toBeInTheDocument()
  },
}

export const LoadingStateTransition: Story = {
  args: {
    children: '로딩 전환 테스트',
    loading: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /로딩 전환 테스트/i })
    
    // 초기 상태 확인
    await expect(button).toBeInTheDocument()
    await expect(button).not.toBeDisabled()
    
    // 로딩 상태로 전환 (실제로는 props 변경이지만 테스트 목적)
    await userEvent.click(button)
  },
}

// 빈 상태 (텍스트 없는 버튼 - 아이콘만)
export const IconOnly: Story = {
  args: {
    'aria-label': '추가',
    leftIcon: <Plus size={20} />,
    children: '',
  },
  parameters: {
    docs: {
      description: {
        story: '아이콘만 있는 버튼. 접근성을 위해 aria-label 필수.',
      },
    },
  },
}

// 실제 사용 예시
export const RealWorldExample: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Button variant="primary" leftIcon={<Plus size={20} />}>
        새로 만들기
      </Button>
      <Button variant="outline">취소</Button>
      <Button variant="danger" leftIcon={<Trash2 size={20} />}>
        삭제
      </Button>
      <Button variant="ghost" size="sm">
        더보기
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '실제 사용 예시: 다양한 버튼 조합',
      },
    },
  },
}
