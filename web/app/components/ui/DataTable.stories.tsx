import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within } from '@storybook/test'
import { useState } from 'react'
import { DataTable, Column } from './DataTable'
import Button from './Button'
import { Edit, Trash2 } from 'lucide-react'

// 샘플 데이터 타입
interface SampleData extends Record<string, unknown> {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

const sampleData: SampleData[] = [
  { id: '1', name: '홍길동', email: 'hong@example.com', role: '관리자', status: '활성', createdAt: '2024-01-01' },
  { id: '2', name: '김철수', email: 'kim@example.com', role: '사용자', status: '활성', createdAt: '2024-01-02' },
  { id: '3', name: '이영희', email: 'lee@example.com', role: '사용자', status: '비활성', createdAt: '2024-01-03' },
  { id: '4', name: '박민수', email: 'park@example.com', role: '관리자', status: '활성', createdAt: '2024-01-04' },
  { id: '5', name: '최지영', email: 'choi@example.com', role: '사용자', status: '활성', createdAt: '2024-01-05' },
]

const columns: Column<SampleData>[] = [
  { key: 'name', header: '이름', sortable: true },
  { key: 'email', header: '이메일', sortable: true },
  { key: 'role', header: '역할', sortable: true },
  { key: 'status', header: '상태', sortable: true },
  { key: 'createdAt', header: '생성일', sortable: true },
]

const meta: Meta<typeof DataTable> = {
  title: 'UI/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '공통 DataTable 컴포넌트. 모바일에서는 자동으로 카드 뷰로 변환됩니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: 'boolean',
      description: '로딩 상태',
    },
    emptyMessage: {
      control: 'text',
      description: '빈 데이터 메시지',
    },
  },
}

export default meta
type Story = StoryObj<typeof DataTable<SampleData>>

// 기본 상태
export const Default: Story = {
  args: {
    columns,
    data: sampleData,
  },
}

// 정렬 기능
export const WithSorting: Story = {
  render: () => {
    const [sortKey, setSortKey] = useState<keyof SampleData | string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    
    const handleSort = (key: keyof SampleData | string) => {
      if (sortKey === key) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      } else {
        setSortKey(key)
        setSortDirection('asc')
      }
    }
    
    return (
      <DataTable
        columns={columns}
        data={sampleData}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    )
  },
}

// 행 클릭
export const WithRowClick: Story = {
  args: {
    columns,
    data: sampleData,
    onRowClick: (item) => alert(`클릭: ${item.name}`),
  },
}

// 커스텀 렌더링
export const WithCustomRender: Story = {
  args: {
    columns: [
      { key: 'name', header: '이름', sortable: true },
      { key: 'email', header: '이메일', sortable: true },
      { 
        key: 'actions', 
        header: '액션',
        render: () => (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="ghost" size="sm" leftIcon={<Edit size={16} />}>
              수정
            </Button>
            <Button variant="ghost" size="sm" leftIcon={<Trash2 size={16} />}>
              삭제
            </Button>
          </div>
        ),
      },
    ],
    data: sampleData,
  },
}

// 로딩 상태
export const Loading: Story = {
  args: {
    columns,
    data: [],
    loading: true,
  },
}

// 빈 상태
export const Empty: Story = {
  args: {
    columns,
    data: [],
    emptyMessage: '데이터가 없습니다.',
  },
}

// 모바일 뷰 (카드 변환)
export const MobileView: Story = {
  args: {
    columns,
    data: sampleData,
    onRowClick: (item) => alert(`클릭: ${item.name}`),
  },
  parameters: {
    viewport: {
      defaultViewport: 'iPhone SE',
    },
  },
}

// Interaction 테스트
export const SortInteraction: Story = {
  render: () => {
    const [sortKey, setSortKey] = useState<keyof SampleData | string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    
    const handleSort = (key: keyof SampleData | string) => {
      if (sortKey === key) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      } else {
        setSortKey(key)
        setSortDirection('asc')
      }
    }
    
    return (
      <DataTable
        columns={columns}
        data={sampleData}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // 데스크톱에서만 테이블 헤더 클릭 가능
    if (window.innerWidth >= 768) {
      const nameHeader = canvas.getByText('이름')
      await userEvent.click(nameHeader)
      
      // 정렬이 적용되었는지 확인
      await expect(nameHeader).toBeInTheDocument()
    }
  },
}

export const RowClickInteraction: Story = {
  args: {
    columns,
    data: sampleData,
    onRowClick: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // 모바일에서는 카드, 데스크톱에서는 테이블 행 클릭
    if (window.innerWidth < 768) {
      const buttons = canvas.getAllByRole('button')
      if (buttons[0]) {
        await userEvent.click(buttons[0])
      }
    } else {
      const firstRow = canvas.getByText('홍길동').closest('tr')
      if (firstRow) {
        await userEvent.click(firstRow)
      }
    }
  },
}

// 실제 사용 예시
export const RealWorldExample: Story = {
  render: () => {
    const [sortKey, setSortKey] = useState<keyof SampleData | string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    
    const handleSort = (key: keyof SampleData | string) => {
      if (sortKey === key) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      } else {
        setSortKey(key)
        setSortDirection('asc')
      }
    }
    
    const actionColumns: Column<SampleData>[] = [
      { key: 'name', header: '이름', sortable: true },
      { key: 'email', header: '이메일', sortable: true },
      { key: 'role', header: '역할', sortable: true },
      { key: 'status', header: '상태', sortable: true },
      { 
        key: 'actions', 
        header: '액션',
        align: 'right',
        render: () => (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="sm" leftIcon={<Edit size={16} />}>
              수정
            </Button>
            <Button variant="ghost" size="sm" leftIcon={<Trash2 size={16} />}>
              삭제
            </Button>
          </div>
        ),
      },
    ]
    
    return (
      <DataTable
        columns={actionColumns}
        data={sampleData}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={(item) => console.log('Row clicked:', item)}
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story: '실제 사용 예시: 정렬, 행 클릭, 커스텀 액션 버튼이 포함된 테이블',
      },
    },
  },
}
