import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { expect, userEvent, within } from '@storybook/test'
import SearchBar from './SearchBar'

const meta: Meta<typeof SearchBar> = {
  title: 'Common/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '공통 SearchBar 컴포넌트. 검색 입력과 자동 debounce 기능을 제공합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: '검색어 값',
    },
    placeholder: {
      control: 'text',
      description: '플레이스홀더 텍스트',
    },
    fullWidth: {
      control: 'boolean',
      description: '전체 너비 사용 여부',
    },
    debounceMs: {
      control: 'number',
      description: 'Debounce 지연 시간 (밀리초)',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: '입력 필드 크기',
    },
  },
}

export default meta
type Story = StoryObj<typeof SearchBar>

// 기본 상태
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('')
    
    return (
      <div style={{ maxWidth: '400px' }}>
        <SearchBar
          value={value}
          onChange={setValue}
          placeholder="검색..."
        />
        <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
          검색어: {value || '(없음)'}
        </div>
      </div>
    )
  },
}

// 커스텀 플레이스홀더
export const CustomPlaceholder: Story = {
  render: () => {
    const [value, setValue] = useState('')
    
    return (
      <div style={{ maxWidth: '400px' }}>
        <SearchBar
          value={value}
          onChange={setValue}
          placeholder="이름, 이메일 또는 전화번호로 검색"
        />
      </div>
    )
  },
}

// 전체 너비
export const FullWidth: Story = {
  render: () => {
    const [value, setValue] = useState('')
    
    return (
      <div style={{ width: '100%' }}>
        <SearchBar
          value={value}
          onChange={setValue}
          placeholder="검색..."
          fullWidth={true}
        />
      </div>
    )
  },
}

// 크기 변형
export const Sizes: Story = {
  render: () => {
    const [value1, setValue1] = useState('')
    const [value2, setValue2] = useState('')
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Small</label>
          <SearchBar
            value={value1}
            onChange={setValue1}
            placeholder="Small size"
            size="small"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Medium</label>
          <SearchBar
            value={value2}
            onChange={setValue2}
            placeholder="Medium size"
            size="medium"
          />
        </div>
      </div>
    )
  },
}

// Debounce 설정
export const CustomDebounce: Story = {
  render: () => {
    const [value, setValue] = useState('')
    const [debouncedValue, setDebouncedValue] = useState('')
    
    const handleChange = (newValue: string) => {
      setValue(newValue)
      setTimeout(() => setDebouncedValue(newValue), 500)
    }
    
    return (
      <div style={{ maxWidth: '400px' }}>
        <SearchBar
          value={value}
          onChange={handleChange}
          placeholder="검색... (500ms debounce)"
          debounceMs={500}
        />
        <div style={{ marginTop: '16px', fontSize: '14px' }}>
          <div style={{ color: '#666' }}>입력 중: {value || '(없음)'}</div>
          <div style={{ color: '#0066cc', marginTop: '4px' }}>
            Debounced: {debouncedValue || '(없음)'}
          </div>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: '500ms debounce를 적용한 검색바. 입력이 멈춘 후 500ms 후에 onChange가 호출됩니다.',
      },
    },
  },
}

// 실제 사용 예시
export const RealWorldExample: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('')
    const items = [
      { id: 1, name: '홍길동', email: 'hong@example.com' },
      { id: 2, name: '김철수', email: 'kim@example.com' },
      { id: 3, name: '이영희', email: 'lee@example.com' },
    ]
    
    const filteredItems = items.filter(
      item =>
        item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.email.toLowerCase().includes(searchValue.toLowerCase())
    )
    
    return (
      <div style={{ maxWidth: '600px' }}>
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder="고객명, 이메일로 검색"
        />
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>
            검색 결과 ({filteredItems.length}개)
          </h3>
          {filteredItems.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {filteredItems.map(item => (
                <li
                  key={item.id}
                  style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <strong>{item.name}</strong>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                    {item.email}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: '실제 사용 예시: 고객 검색',
      },
    },
  },
}

// Interaction 테스트
export const SearchInteraction: Story = {
  render: () => {
    const [value, setValue] = useState('')
    
    return (
      <div style={{ maxWidth: '400px' }}>
        <SearchBar
          value={value}
          onChange={setValue}
          placeholder="검색어를 입력하세요"
        />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const searchInput = canvas.getByPlaceholderText(/검색어를 입력하세요/i)
    
    await userEvent.type(searchInput, '테스트 검색어')
    await expect(searchInput).toHaveValue('테스트 검색어')
  },
}
