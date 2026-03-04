import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within } from '@storybook/test'
import Card from './Card'
import { Box } from '@mui/material'
import Typography from '@mui/material/Typography'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '공통 Card 컴포넌트. 모바일 우선 설계로 클릭 가능한 카드와 일반 카드를 지원합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    clickable: {
      control: 'boolean',
      description: '클릭 가능 여부',
    },
    hover: {
      control: 'boolean',
      description: '호버 효과 표시 여부',
    },
    divider: {
      control: 'boolean',
      description: '자식 요소 간 구분선 표시',
    },
    compact: {
      control: 'boolean',
      description: '컴팩트 패딩 적용',
    },
  },
}

export default meta
type Story = StoryObj<typeof Card>

// 기본 상태
export const Default: Story = {
  args: {
    children: (
      <Box>
        <Typography variant="h6" gutterBottom>
          기본 카드
        </Typography>
        <Typography variant="body2" color="text.secondary">
          이것은 기본 카드입니다. 내용을 여기에 표시합니다.
        </Typography>
      </Box>
    ),
  },
}

// 클릭 가능한 카드
export const Clickable: Story = {
  args: {
    clickable: true,
    onClick: () => alert('카드 클릭됨'),
    children: (
      <Box>
        <Typography variant="h6" gutterBottom>
          클릭 가능한 카드
        </Typography>
        <Typography variant="body2" color="text.secondary">
          이 카드는 클릭할 수 있습니다. 호버 효과가 표시됩니다.
        </Typography>
      </Box>
    ),
  },
}

// 호버 효과 없음
export const NoHover: Story = {
  args: {
    hover: false,
    children: (
      <Box>
        <Typography variant="h6" gutterBottom>
          호버 효과 없음
        </Typography>
        <Typography variant="body2" color="text.secondary">
          이 카드는 호버 효과가 없습니다.
        </Typography>
      </Box>
    ),
  },
}

// 컴팩트 패딩
export const Compact: Story = {
  args: {
    compact: true,
    children: (
      <Box>
        <Typography variant="h6" gutterBottom>
          컴팩트 카드
        </Typography>
        <Typography variant="body2" color="text.secondary">
          패딩이 줄어든 컴팩트 버전입니다.
        </Typography>
      </Box>
    ),
  },
}

// 구분선 포함
export const WithDivider: Story = {
  args: {
    divider: true,
    children: (
      <>
        <Box>
          <Typography variant="h6" gutterBottom>
            첫 번째 섹션
          </Typography>
          <Typography variant="body2" color="text.secondary">
            첫 번째 내용입니다.
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            두 번째 섹션
          </Typography>
          <Typography variant="body2" color="text.secondary">
            두 번째 내용입니다. 위에 구분선이 표시됩니다.
          </Typography>
        </Box>
      </>
    ),
  },
}

// 복잡한 내용
export const ComplexContent: Story = {
  args: {
    children: (
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          제목
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          부제목이나 설명이 들어갑니다.
        </Typography>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
          <Typography variant="body2">
            추가 콘텐츠 영역입니다.
          </Typography>
        </Box>
      </Box>
    ),
  },
}

// 모바일 뷰
export const MobileView: Story = {
  args: {
    clickable: true,
    children: (
      <Box>
        <Typography variant="h6" gutterBottom>
          모바일 카드
        </Typography>
        <Typography variant="body2" color="text.secondary">
          모바일 화면에서의 카드 모습입니다.
        </Typography>
      </Box>
    ),
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
    clickable: true,
    onClick: () => {},
    children: (
      <Box>
        <Typography variant="h6" gutterBottom>
          클릭 테스트
        </Typography>
        <Typography variant="body2" color="text.secondary">
          이 카드를 클릭해보세요.
        </Typography>
      </Box>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const card = canvas.getByRole('button')
    
    await userEvent.click(card)
    await expect(card).toBeInTheDocument()
  },
}

// 키보드 접근성 테스트
export const KeyboardAccessibility: Story = {
  args: {
    clickable: true,
    onClick: () => {},
    children: (
      <Box>
        <Typography variant="h6" gutterBottom>
          키보드 접근성
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tab 키로 포커스하고 Enter 또는 Space로 클릭할 수 있습니다.
        </Typography>
      </Box>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const card = canvas.getByRole('button')
    
    // Tab으로 포커스
    await userEvent.tab()
    await expect(card).toHaveFocus()
    
    // Enter 키로 클릭
    await userEvent.keyboard('{Enter}')
  },
}

// 실제 사용 예시
export const RealWorldExample: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
      <Card>
        <Typography variant="h6" gutterBottom>
          일반 카드
        </Typography>
        <Typography variant="body2" color="text.secondary">
          정보를 표시하는 일반 카드입니다.
        </Typography>
      </Card>
      
      <Card clickable onClick={() => alert('카드 클릭')}>
        <Typography variant="h6" gutterBottom>
          클릭 가능한 카드
        </Typography>
        <Typography variant="body2" color="text.secondary">
          클릭하면 액션이 실행됩니다.
        </Typography>
      </Card>
      
      <Card divider>
        <Box>
          <Typography variant="h6" gutterBottom>
            첫 번째 항목
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            두 번째 항목
          </Typography>
        </Box>
      </Card>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: '실제 사용 예시: 다양한 카드 조합',
      },
    },
  },
}
