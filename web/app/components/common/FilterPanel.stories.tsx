import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import FilterPanel, { type FilterField } from './FilterPanel'

type InventoryFilters = {
  status: string
  minPrice: string
  maxPrice: string
  minStock: string
  maxStock: string
}

const meta: Meta<typeof FilterPanel<InventoryFilters>> = {
  title: 'Common/FilterPanel',
  component: FilterPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '공통 FilterPanel 컴포넌트. 다양한 필터 필드를 동적으로 생성하여 표시합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: '필터 패널 제목',
    },
  },
}

export default meta
type Story = StoryObj<typeof FilterPanel<InventoryFilters>>

// 기본 상태
export const Default: Story = {
  render: () => {
    const [filters, setFilters] = useState<InventoryFilters>({
      status: '',
      minPrice: '',
      maxPrice: '',
      minStock: '',
      maxStock: '',
    })
    
    const fields: FilterField[] = [
      {
        key: 'status',
        label: '상태',
        type: 'select',
        options: [
          { value: 'active', label: '활성' },
          { value: 'inactive', label: '비활성' },
          { value: 'out_of_stock', label: '품절' },
        ],
      },
    ]
    
    return (
      <div style={{ maxWidth: '600px' }}>
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          onReset={() => setFilters({
            status: '',
            minPrice: '',
            maxPrice: '',
            minStock: '',
            maxStock: '',
          })}
          fields={fields}
          title="필터"
        />
        <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
          <strong>현재 필터:</strong>
          <pre style={{ marginTop: '8px', fontSize: '12px' }}>
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>
      </div>
    )
  },
}

// 다양한 필드 타입
export const AllFieldTypes: Story = {
  render: () => {
    const [filters, setFilters] = useState<InventoryFilters>({
      status: '',
      minPrice: '',
      maxPrice: '',
      minStock: '',
      maxStock: '',
    })
    
    const fields: FilterField[] = [
      {
        key: 'status',
        label: '상태',
        type: 'select',
        options: [
          { value: 'active', label: '활성' },
          { value: 'inactive', label: '비활성' },
        ],
      },
      {
        key: 'price',
        label: '가격 범위',
        type: 'range',
        placeholder: '0',
      },
      {
        key: 'stock',
        label: '재고 범위',
        type: 'range',
        placeholder: '0',
      },
    ]
    
    return (
      <div style={{ maxWidth: '600px' }}>
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          onReset={() => setFilters({
            status: '',
            minPrice: '',
            maxPrice: '',
            minStock: '',
            maxStock: '',
          })}
          fields={fields}
          title="상세 필터"
        />
      </div>
    )
  },
}

// 실제 사용 예시 (재고 관리)
export const InventoryFilters: Story = {
  render: () => {
    const [filters, setFilters] = useState<InventoryFilters>({
      status: '',
      minPrice: '',
      maxPrice: '',
      minStock: '',
      maxStock: '',
    })
    
    const fields: FilterField[] = [
      {
        key: 'status',
        label: '상태',
        type: 'select',
        options: [
          { value: 'active', label: '활성' },
          { value: 'inactive', label: '비활성' },
          { value: 'out_of_stock', label: '품절' },
        ],
      },
      {
        key: 'price',
        label: '가격 범위',
        type: 'range',
        placeholder: '0',
      },
      {
        key: 'stock',
        label: '재고 범위',
        type: 'range',
        placeholder: '0',
      },
    ]
    
    return (
      <div style={{ maxWidth: '800px' }}>
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          onReset={() => setFilters({
            status: '',
            minPrice: '',
            maxPrice: '',
            minStock: '',
            maxStock: '',
          })}
          fields={fields}
          title="상품 필터"
        />
        <div style={{ marginTop: '24px', padding: '16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>적용된 필터:</h3>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {Object.entries(filters).map(([key, value]) => (
              value && (
                <div key={key} style={{ marginBottom: '4px' }}>
                  <strong>{key}:</strong> {value}
                </div>
              )
            ))}
            {Object.values(filters).every(v => !v) && (
              <div style={{ color: '#999' }}>필터가 적용되지 않았습니다.</div>
            )}
          </div>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: '실제 사용 예시: 재고 관리 페이지 필터',
      },
    },
  },
}

// 활성 필터 표시
export const WithActiveFilters: Story = {
  render: () => {
    const [filters, setFilters] = useState<InventoryFilters>({
      status: 'active',
      minPrice: '10000',
      maxPrice: '100000',
      minStock: '',
      maxStock: '',
    })
    
    const fields: FilterField[] = [
      {
        key: 'status',
        label: '상태',
        type: 'select',
        options: [
          { value: 'active', label: '활성' },
          { value: 'inactive', label: '비활성' },
        ],
      },
      {
        key: 'price',
        label: '가격 범위',
        type: 'range',
      },
    ]
    
    return (
      <div style={{ maxWidth: '600px' }}>
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          onReset={() => setFilters({
            status: '',
            minPrice: '',
            maxPrice: '',
            minStock: '',
            maxStock: '',
          })}
          fields={fields}
          title="필터"
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: '활성 필터가 있을 때 칩으로 개수를 표시하고 초기화 버튼이 나타납니다.',
      },
    },
  },
}

// 커스텀 제목
export const CustomTitle: Story = {
  render: () => {
    const [filters, setFilters] = useState<InventoryFilters>({
      status: '',
      minPrice: '',
      maxPrice: '',
      minStock: '',
      maxStock: '',
    })
    
    const fields: FilterField[] = [
      {
        key: 'status',
        label: '상태',
        type: 'select',
        options: [
          { value: 'active', label: '활성' },
          { value: 'inactive', label: '비활성' },
        ],
      },
    ]
    
    return (
      <div style={{ maxWidth: '600px' }}>
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          onReset={() => setFilters({
            status: '',
            minPrice: '',
            maxPrice: '',
            minStock: '',
            maxStock: '',
          })}
          fields={fields}
          title="상품 검색 필터"
        />
      </div>
    )
  },
}
