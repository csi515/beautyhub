import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within } from '@storybook/test'
import Input from './Input'
import { Search, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '공통 Input 컴포넌트. 모바일 우선 설계로 터치 친화적인 입력 필드를 제공합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'boolean',
      description: '에러 상태 (boolean 또는 에러 메시지 문자열)',
    },
    helperText: {
      control: 'text',
      description: '도움말 텍스트',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
    required: {
      control: 'boolean',
      description: '필수 입력 여부',
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
type Story = StoryObj<typeof Input>

// 기본 상태
export const Default: Story = {
  args: {
    label: '이름',
    placeholder: '이름을 입력하세요',
  },
}

// 다양한 타입
export const Text: Story = {
  args: {
    label: '텍스트',
    type: 'text',
    placeholder: '텍스트를 입력하세요',
  },
}

export const Email: Story = {
  args: {
    label: '이메일',
    type: 'email',
    placeholder: 'example@email.com',
  },
}

export const Password: Story = {
  args: {
    label: '비밀번호',
    type: 'password',
    placeholder: '비밀번호를 입력하세요',
  },
}

export const Number: Story = {
  args: {
    label: '숫자',
    type: 'number',
    placeholder: '숫자를 입력하세요',
  },
}

// 아이콘 포함
export const WithLeftIcon: Story = {
  args: {
    label: '검색',
    placeholder: '검색어를 입력하세요',
    leftIcon: <Search size={20} />,
  },
}

export const WithRightIcon: Story = {
  args: {
    label: '이메일',
    placeholder: '이메일을 입력하세요',
    rightIcon: <Mail size={20} />,
  },
}

export const WithBothIcons: Story = {
  args: {
    label: '검색',
    placeholder: '검색어를 입력하세요',
    leftIcon: <Search size={20} />,
    rightIcon: <Mail size={20} />,
  },
}

// 에러 상태
export const WithError: Story = {
  args: {
    label: '이메일',
    placeholder: '이메일을 입력하세요',
    error: true,
    helperText: '올바른 이메일 형식이 아닙니다.',
  },
}

export const WithErrorString: Story = {
  args: {
    label: '비밀번호',
    placeholder: '비밀번호를 입력하세요',
    error: '비밀번호는 8자 이상이어야 합니다.',
  },
}

// 도움말 텍스트
export const WithHelperText: Story = {
  args: {
    label: '사용자명',
    placeholder: '사용자명을 입력하세요',
    helperText: '영문, 숫자, 언더스코어만 사용 가능합니다.',
  },
}

// 필수 입력
export const Required: Story = {
  args: {
    label: '이름',
    placeholder: '이름을 입력하세요',
    required: true,
  },
}

// 비활성화
export const Disabled: Story = {
  args: {
    label: '비활성화된 입력',
    placeholder: '입력할 수 없습니다',
    disabled: true,
    defaultValue: '비활성화된 값',
  },
}

// 비밀번호 표시/숨김 토글 (실제 사용 예시)
export const PasswordToggle: Story = {
  render: () => {
    const [showPassword, setShowPassword] = useState(false)
    
    return (
      <Input
        label="비밀번호"
        type={showPassword ? 'text' : 'password'}
        placeholder="비밀번호를 입력하세요"
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        }
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story: '비밀번호 표시/숨김 토글 기능이 있는 입력 필드',
      },
    },
  },
}

// 모바일 뷰
export const MobileView: Story = {
  args: {
    label: '모바일 입력',
    placeholder: '모바일에서 입력하세요',
  },
  parameters: {
    viewport: {
      defaultViewport: 'iPhone SE',
    },
  },
}

// Interaction 테스트
export const InputInteraction: Story = {
  args: {
    label: '입력 테스트',
    placeholder: '텍스트를 입력하세요',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText(/입력 테스트/i)
    
    await userEvent.type(input, '테스트 입력')
    await expect(input).toHaveValue('테스트 입력')
  },
}

export const FocusInteraction: Story = {
  args: {
    label: '포커스 테스트',
    placeholder: '포커스를 받아보세요',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText(/포커스 테스트/i)
    
    await userEvent.click(input)
    await expect(input).toHaveFocus()
  },
}

export const ErrorStateInteraction: Story = {
  args: {
    label: '에러 테스트',
    placeholder: '잘못된 입력을 해보세요',
    error: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText(/에러 테스트/i)
    
    // 입력 후 포커스 아웃
    await userEvent.type(input, 'test')
    await userEvent.tab()
    
    // 에러 상태는 실제로는 폼 검증 로직에 따라 결정되지만
    // 여기서는 컴포넌트가 정상적으로 렌더링되는지만 확인
    await expect(input).toBeInTheDocument()
  },
}

// 실제 사용 예시
export const RealWorldExample: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: 400 }}>
      <Input
        label="이메일"
        type="email"
        placeholder="example@email.com"
        leftIcon={<Mail size={20} />}
        required
      />
      <Input
        label="비밀번호"
        type="password"
        placeholder="비밀번호를 입력하세요"
        leftIcon={<Lock size={20} />}
        required
        helperText="8자 이상, 영문, 숫자, 특수문자 포함"
      />
      <Input
        label="검색"
        placeholder="검색어를 입력하세요"
        leftIcon={<Search size={20} />}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '실제 사용 예시: 다양한 입력 필드 조합',
      },
    },
  },
}
