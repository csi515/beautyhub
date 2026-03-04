import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import DetailForm, { type DetailFormField } from './DetailForm'
import { Button } from '@mui/material'

const meta: Meta<typeof DetailForm> = {
  title: 'Common/DetailForm',
  component: DetailForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '공통 DetailForm 컴포넌트. 다양한 타입의 폼 필드를 동적으로 생성하여 표시합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: '추가 CSS 클래스',
    },
  },
}

export default meta
type Story = StoryObj<typeof DetailForm>

// 기본 상태 (텍스트 필드)
export const Default: Story = {
  render: () => {
    const [form, setForm] = useState({
      name: '',
      email: '',
    })
    
    const fields: DetailFormField[][] = [
      [
        {
          name: 'name',
          label: '이름',
          type: 'text',
          required: true,
          value: form.name,
          onChange: (v) => setForm({ ...form, name: String(v) }),
          placeholder: '이름을 입력하세요',
        },
        {
          name: 'email',
          label: '이메일',
          type: 'text',
          value: form.email,
          onChange: (v) => setForm({ ...form, email: String(v) }),
          placeholder: 'email@example.com',
        },
      ],
    ]
    
    return (
      <div style={{ maxWidth: '600px' }}>
        <DetailForm fields={fields} />
        <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
          <strong>Form State:</strong>
          <pre style={{ marginTop: '8px', fontSize: '12px' }}>
            {JSON.stringify(form, null, 2)}
          </pre>
        </div>
      </div>
    )
  },
}

// 모든 필드 타입
export const AllFieldTypes: Story = {
  render: () => {
    const [form, setForm] = useState({
      name: '',
      price: 0,
      date: '',
      category: '',
      description: '',
      active: false,
    })
    
    const fields: DetailFormField[][] = [
      [
        {
          name: 'name',
          label: '상품명',
          type: 'text',
          required: true,
          value: form.name,
          onChange: (v) => setForm({ ...form, name: String(v) }),
          placeholder: '상품명을 입력하세요',
        },
        {
          name: 'price',
          label: '가격',
          type: 'number',
          required: true,
          value: form.price,
          onChange: (v) => setForm({ ...form, price: Number(v) }),
          placeholder: '0',
          helperText: '원 단위로 입력하세요',
        },
      ],
      [
        {
          name: 'date',
          label: '등록일',
          type: 'date',
          value: form.date,
          onChange: (v) => setForm({ ...form, date: String(v) }),
        },
        {
          name: 'category',
          label: '카테고리',
          type: 'select',
          value: form.category,
          onChange: (v) => setForm({ ...form, category: String(v) }),
          options: [
            { value: 'beauty', label: '뷰티' },
            { value: 'skincare', label: '스킨케어' },
            { value: 'makeup', label: '메이크업' },
          ],
        },
      ],
      [
        {
          name: 'description',
          label: '설명',
          type: 'textarea',
          value: form.description,
          onChange: (v) => setForm({ ...form, description: String(v) }),
          rows: 4,
          placeholder: '상품에 대한 설명을 입력하세요',
        },
      ],
      [
        {
          name: 'active',
          label: '활성화',
          type: 'checkbox',
          value: form.active,
          onChange: (v) => setForm({ ...form, active: Boolean(v) }),
          helperText: '체크 시 상품이 활성화됩니다',
        },
      ],
    ]
    
    return (
      <div style={{ maxWidth: '800px' }}>
        <DetailForm fields={fields} />
        <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
          <strong>Form State:</strong>
          <pre style={{ marginTop: '8px', fontSize: '12px' }}>
            {JSON.stringify(form, null, 2)}
          </pre>
        </div>
      </div>
    )
  },
}

// 도움말 텍스트 및 툴팁
export const WithHelperText: Story = {
  render: () => {
    const [form, setForm] = useState({
      name: '',
      email: '',
      password: '',
    })
    
    const fields: DetailFormField[][] = [
      [
        {
          name: 'name',
          label: '이름',
          type: 'text',
          required: true,
          value: form.name,
          onChange: (v) => setForm({ ...form, name: String(v) }),
          helperText: '실명을 입력해주세요',
          tooltip: '회원가입 시 사용되는 이름입니다',
        },
        {
          name: 'email',
          label: '이메일',
          type: 'text',
          required: true,
          value: form.email,
          onChange: (v) => setForm({ ...form, email: String(v) }),
          helperText: '로그인 시 사용됩니다',
          tooltip: '이메일 형식으로 입력해주세요',
        },
      ],
      [
        {
          name: 'password',
          label: '비밀번호',
          type: 'text',
          required: true,
          value: form.password,
          onChange: (v) => setForm({ ...form, password: String(v) }),
          helperText: '8자 이상 입력해주세요',
          tooltip: '영문, 숫자, 특수문자를 조합하여 사용하세요',
        },
      ],
    ]
    
    return (
      <div style={{ maxWidth: '600px' }}>
        <DetailForm fields={fields} />
      </div>
    )
  },
}

// 커스텀 그리드 레이아웃
export const CustomGridLayout: Story = {
  render: () => {
    const [form, setForm] = useState({
      name: '',
      price: 0,
      stock: 0,
      description: '',
    })
    
    const fields: DetailFormField[][] = [
      [
        {
          name: 'name',
          label: '상품명',
          type: 'text',
          value: form.name,
          onChange: (v) => setForm({ ...form, name: String(v) }),
          gridCols: 8,
        },
        {
          name: 'price',
          label: '가격',
          type: 'number',
          value: form.price,
          onChange: (v) => setForm({ ...form, price: Number(v) }),
          gridCols: 4,
        },
      ],
      [
        {
          name: 'stock',
          label: '재고',
          type: 'number',
          value: form.stock,
          onChange: (v) => setForm({ ...form, stock: Number(v) }),
          gridCols: { xs: 12, md: 6 },
        },
      ],
      [
        {
          name: 'description',
          label: '설명',
          type: 'textarea',
          value: form.description,
          onChange: (v) => setForm({ ...form, description: String(v) }),
          rows: 4,
        },
      ],
    ]
    
    return (
      <div style={{ maxWidth: '800px' }}>
        <DetailForm fields={fields} />
      </div>
    )
  },
}

// 비활성화 상태
export const Disabled: Story = {
  render: () => {
    const [form, setForm] = useState({
      name: '비활성화된 필드',
      price: 50000,
      category: 'beauty',
    })
    
    const fields: DetailFormField[][] = [
      [
        {
          name: 'name',
          label: '상품명',
          type: 'text',
          value: form.name,
          onChange: (v) => setForm({ ...form, name: String(v) }),
          disabled: true,
        },
        {
          name: 'price',
          label: '가격',
          type: 'number',
          value: form.price,
          onChange: (v) => setForm({ ...form, price: Number(v) }),
          disabled: true,
        },
      ],
      [
        {
          name: 'category',
          label: '카테고리',
          type: 'select',
          value: form.category,
          onChange: (v) => setForm({ ...form, category: String(v) }),
          options: [
            { value: 'beauty', label: '뷰티' },
            { value: 'skincare', label: '스킨케어' },
          ],
          disabled: true,
        },
      ],
    ]
    
    return (
      <div style={{ maxWidth: '600px' }}>
        <DetailForm fields={fields} />
      </div>
    )
  },
}

// 숫자 필드 (min/max/step)
export const NumberFieldConstraints: Story = {
  render: () => {
    const [form, setForm] = useState({
      quantity: 0,
      discount: 0,
      rating: 0,
    })
    
    const fields: DetailFormField[][] = [
      [
        {
          name: 'quantity',
          label: '수량',
          type: 'number',
          value: form.quantity,
          onChange: (v) => setForm({ ...form, quantity: Number(v) }),
          min: 0,
          max: 1000,
          step: 1,
          helperText: '0 ~ 1000 사이의 값을 입력하세요',
        },
        {
          name: 'discount',
          label: '할인율',
          type: 'number',
          value: form.discount,
          onChange: (v) => setForm({ ...form, discount: Number(v) }),
          min: 0,
          max: 100,
          step: 1,
          helperText: '0 ~ 100 (%)',
        },
      ],
      [
        {
          name: 'rating',
          label: '평점',
          type: 'number',
          value: form.rating,
          onChange: (v) => setForm({ ...form, rating: Number(v) }),
          min: 0,
          max: 5,
          step: 0.1,
          helperText: '0.0 ~ 5.0 사이의 값을 입력하세요',
        },
      ],
    ]
    
    return (
      <div style={{ maxWidth: '600px' }}>
        <DetailForm fields={fields} />
      </div>
    )
  },
}

// 커스텀 렌더링
export const CustomRender: Story = {
  render: () => {
    const [form, setForm] = useState({
      name: '',
      custom: '',
    })
    
    const fields: DetailFormField[][] = [
      [
        {
          name: 'name',
          label: '상품명',
          type: 'text',
          value: form.name,
          onChange: (v) => setForm({ ...form, name: String(v) }),
        },
        {
          name: 'custom',
          label: '커스텀 필드',
          type: 'custom',
          customRender: () => (
            <div style={{ padding: '12px', border: '1px dashed #ccc', borderRadius: '8px' }}>
              <Button variant="outlined" size="small">
                커스텀 버튼
              </Button>
            </div>
          ),
        },
      ],
    ]
    
    return (
      <div style={{ maxWidth: '600px' }}>
        <DetailForm fields={fields} />
      </div>
    )
  },
}

// 실제 사용 예시 (상품 등록)
export const RealWorldExample: Story = {
  render: () => {
    const [form, setForm] = useState({
      name: '',
      price: 0,
      stock: 0,
      category: '',
      description: '',
      active: true,
    })
    
    const fields: DetailFormField[][] = [
      [
        {
          name: 'name',
          label: '상품명',
          type: 'text',
          required: true,
          value: form.name,
          onChange: (v) => setForm({ ...form, name: String(v) }),
          placeholder: '상품명을 입력하세요',
          helperText: '고객에게 표시될 상품명입니다',
        },
        {
          name: 'price',
          label: '가격',
          type: 'number',
          required: true,
          value: form.price,
          onChange: (v) => setForm({ ...form, price: Number(v) }),
          placeholder: '0',
          min: 0,
          helperText: '원 단위로 입력하세요',
        },
      ],
      [
        {
          name: 'stock',
          label: '재고',
          type: 'number',
          value: form.stock,
          onChange: (v) => setForm({ ...form, stock: Number(v) }),
          min: 0,
          helperText: '현재 보유 재고 수량',
        },
        {
          name: 'category',
          label: '카테고리',
          type: 'select',
          value: form.category,
          onChange: (v) => setForm({ ...form, category: String(v) }),
          options: [
            { value: 'beauty', label: '뷰티' },
            { value: 'skincare', label: '스킨케어' },
            { value: 'makeup', label: '메이크업' },
            { value: 'hair', label: '헤어' },
          ],
          helperText: '상품 카테고리를 선택하세요',
        },
      ],
      [
        {
          name: 'description',
          label: '상품 설명',
          type: 'textarea',
          value: form.description,
          onChange: (v) => setForm({ ...form, description: String(v) }),
          rows: 5,
          placeholder: '상품에 대한 상세한 설명을 입력하세요',
        },
      ],
      [
        {
          name: 'active',
          label: '상품 활성화',
          type: 'checkbox',
          value: form.active,
          onChange: (v) => setForm({ ...form, active: Boolean(v) }),
          helperText: '체크 해제 시 고객에게 표시되지 않습니다',
        },
      ],
    ]
    
    const handleSubmit = () => {
      alert(`상품이 등록되었습니다:\n${JSON.stringify(form, null, 2)}`)
    }
    
    return (
      <div style={{ maxWidth: '800px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>상품 등록</h2>
        <DetailForm fields={fields} />
        <div style={{ marginTop: '24px', display: 'flex', gap: '8px' }}>
          <Button variant="contained" onClick={handleSubmit}>
            저장
          </Button>
          <Button variant="outlined" onClick={() => setForm({
            name: '',
            price: 0,
            stock: 0,
            category: '',
            description: '',
            active: true,
          })}>
            초기화
          </Button>
        </div>
        <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
          <strong>Form State:</strong>
          <pre style={{ marginTop: '8px', fontSize: '12px' }}>
            {JSON.stringify(form, null, 2)}
          </pre>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: '실제 사용 예시: 상품 등록 폼',
      },
    },
  },
}
