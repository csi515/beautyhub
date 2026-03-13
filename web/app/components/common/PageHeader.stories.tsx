import type { Meta, StoryObj } from '@storybook/react'
import PageHeader from './PageHeader'
import { Plus } from 'lucide-react'

const meta: Meta<typeof PageHeader> = {
  title: 'Common/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '페이지 헤더 컴포넌트. 제목과 아이콘만 표시하여 공간 효율을 높입니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: '페이지 제목',
    },
  },
}

export default meta
type Story = StoryObj<typeof PageHeader>

export const Default: Story = {
  args: {
    title: '페이지 제목',
  },
}

export const WithIcon: Story = {
  args: {
    title: '고객 관리',
    icon: <Plus size={24} />,
  },
}

export const TitleOnly: Story = {
  args: {
    title: '설정',
  },
}
