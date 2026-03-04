import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within } from '@storybook/test'
import { useState } from 'react'
import PageHeader, { createActionButton } from './PageHeader'
import Button from '@/app/components/ui/Button'
import { Plus, Download } from 'lucide-react'

const meta: Meta<typeof PageHeader> = {
  title: 'Common/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '공통 PageHeader 컴포넌트. 제목, 검색, 필터, 액션 버튼을 포함하는 일관된 헤더 디자인입니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: '페이지 제목',
    },
    description: {
      control: 'text',
      description: '페이지 설명',
    },
  },
}

export default meta
type Story = StoryObj<typeof PageHeader>

// 기본 상태
export const Default: Story = {
  args: {
    title: '페이지 제목',
    description: '페이지에 대한 설명입니다.',
  },
}

// 아이콘 포함
export const WithIcon: Story = {
  args: {
    title: '고객 관리',
    icon: <Plus size={24} />,
    description: '고객 정보를 관리합니다.',
  },
}

// 액션 버튼 포함
export const WithAction: Story = {
  args: {
    title: '상품 목록',
    actions: createActionButton('새 상품 추가', () => alert('추가'), 'primary', <Plus size={20} />),
  },
}

// 검색 포함
export const WithSearch: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('')
    
    return (
      <PageHeader
        title="검색 가능한 헤더"
        search={{
          value: searchValue,
          onChange: setSearchValue,
          placeholder: '검색어를 입력하세요',
        }}
      />
    )
  },
}

// 필터 포함
export const WithFilter: Story = {
  args: {
    title: '필터 포함 헤더',
    filters: (
      <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }}>
        <option>전체</option>
        <option>활성</option>
        <option>비활성</option>
      </select>
    ),
  },
}

// 모든 기능 포함
export const FullFeatured: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('')
    
    return (
      <PageHeader
        title="전체 기능 헤더"
        icon={<Plus size={24} />}
        description="모든 기능이 포함된 헤더입니다."
        search={{
          value: searchValue,
          onChange: setSearchValue,
          placeholder: '검색어를 입력하세요',
        }}
        filters={
          <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }}>
            <option>전체</option>
            <option>활성</option>
            <option>비활성</option>
          </select>
        }
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" leftIcon={<Download size={20} />}>
              내보내기
            </Button>
            <Button variant="primary" leftIcon={<Plus size={20} />}>
              추가
            </Button>
          </div>
        }
      />
    )
  },
}

// 모바일 뷰
export const MobileView: Story = {
  args: {
    title: '모바일 헤더',
    description: '모바일 화면에서의 헤더 모습입니다.',
    actions: createActionButton('추가', () => alert('추가'), 'primary', <Plus size={20} />),
  },
  parameters: {
    viewport: {
      defaultViewport: 'iPhone SE',
    },
  },
}

// Interaction 테스트
export const SearchInteraction: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('')
    
    return (
      <PageHeader
        title="검색 테스트"
        search={{
          value: searchValue,
          onChange: setSearchValue,
          placeholder: '검색어를 입력하세요',
        }}
      />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const searchInput = canvas.getByPlaceholderText(/검색어를 입력하세요/i)
    
    await userEvent.type(searchInput, '테스트 검색어')
    await expect(searchInput).toHaveValue('테스트 검색어')
  },
}

export const ActionButtonInteraction: Story = {
  args: {
    title: '액션 버튼 테스트',
    actions: createActionButton('클릭 테스트', () => {}, 'primary', <Plus size={20} />),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const actionButton = canvas.getByRole('button', { name: /클릭 테스트/i })
    
    await userEvent.click(actionButton)
    await expect(actionButton).toBeInTheDocument()
  },
}

// 실제 사용 예시
export const RealWorldExample: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('')
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <PageHeader
          title="고객 관리"
          icon={<Plus size={24} />}
          description="고객 정보를 검색하고 관리할 수 있습니다."
          search={{
            value: searchValue,
            onChange: setSearchValue,
            placeholder: '고객명, 이메일로 검색',
          }}
          filters={
            <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc' }}>
              <option>전체 상태</option>
              <option>활성 고객</option>
              <option>비활성 고객</option>
            </select>
          }
          actions={
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="outline" leftIcon={<Download size={20} />}>
                내보내기
              </Button>
              <Button variant="primary" leftIcon={<Plus size={20} />}>
                고객 추가
              </Button>
            </div>
          }
        />
        
        <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <p>여기에 실제 콘텐츠가 표시됩니다.</p>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: '실제 사용 예시: 고객 관리 페이지 헤더',
      },
    },
  },
}
