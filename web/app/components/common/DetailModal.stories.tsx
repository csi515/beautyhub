import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import DetailModal from './DetailModal'
import DetailForm from './DetailForm'
import { Package } from 'lucide-react'

type Product = {
  id: string
  name: string
  price: number
  stock: number
}

const meta: Meta<typeof DetailModal<Product>> = {
  title: 'Common/DetailModal',
  component: DetailModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '공통 Detail Modal 컴포넌트. CRUD 작업을 위한 표준화된 모달 구조를 제공합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: '모달 열림/닫힘 상태',
    },
    title: {
      control: 'text',
      description: '모달 제목',
    },
    description: {
      control: 'text',
      description: '모달 설명',
    },
    loading: {
      control: 'boolean',
      description: '로딩 상태',
    },
    showDelete: {
      control: 'boolean',
      description: '삭제 버튼 표시 여부',
    },
  },
}

export default meta
type Story = StoryObj<typeof DetailModal<Product>>

// 기본 상태 (새 항목 생성)
export const CreateMode: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    
    return (
      <DetailModal<Product>
        open={open}
        onClose={() => setOpen(false)}
        item={null}
        title="새 상품 추가"
        description="새로운 상품 정보를 입력하세요"
        onSave={() => {
          alert('저장되었습니다')
          setOpen(false)
        }}
      >
        <div style={{ padding: '16px 0' }}>
          <p>여기에 폼 내용이 들어갑니다.</p>
        </div>
      </DetailModal>
    )
  },
}

// 편집 모드
export const EditMode: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    const item: Product = {
      id: '1',
      name: '상품명',
      price: 50000,
      stock: 100,
    }
    
    return (
      <DetailModal<Product>
        open={open}
        onClose={() => setOpen(false)}
        item={item}
        title="상품 수정"
        description="상품 정보를 수정하세요"
        onSave={() => {
          alert('저장되었습니다')
          setOpen(false)
        }}
        onDelete={() => {
          alert('삭제되었습니다')
          setOpen(false)
        }}
      >
        <div style={{ padding: '16px 0' }}>
          <p>상품명: {item.name}</p>
          <p>가격: ₩{item.price.toLocaleString()}</p>
          <p>재고: {item.stock}개</p>
        </div>
      </DetailModal>
    )
  },
}

// DetailForm과 함께 사용
export const WithDetailForm: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    const [form, setForm] = useState({
      name: '',
      price: 0,
      stock: 0,
      description: '',
    })
    
    return (
      <DetailModal<Product>
        open={open}
        onClose={() => setOpen(false)}
        item={null}
        title="새 상품 추가"
        onSave={() => {
          alert(`저장: ${JSON.stringify(form)}`)
          setOpen(false)
        }}
      >
        <DetailForm
          fields={[
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
              },
            ],
            [
              {
                name: 'stock',
                label: '재고',
                type: 'number',
                value: form.stock,
                onChange: (v) => setForm({ ...form, stock: Number(v) }),
                placeholder: '0',
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
          ]}
        />
      </DetailModal>
    )
  },
}

// 로딩 상태
export const Loading: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    
    return (
      <DetailModal<Product>
        open={open}
        onClose={() => setOpen(false)}
        item={null}
        title="데이터 로딩 중..."
        loading={true}
        onSave={async () => {
          await new Promise(resolve => setTimeout(resolve, 2000))
          alert('저장되었습니다')
          setOpen(false)
        }}
      >
        <div style={{ padding: '16px 0' }}>
          <p>로딩 중...</p>
        </div>
      </DetailModal>
    )
  },
}

// 에러 상태
export const WithError: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    
    return (
      <DetailModal<Product>
        open={open}
        onClose={() => setOpen(false)}
        item={null}
        title="상품 추가"
        error="저장 중 오류가 발생했습니다. 다시 시도해주세요."
        onSave={() => {
          alert('저장 시도')
        }}
      >
        <div style={{ padding: '16px 0' }}>
          <p>폼 내용</p>
        </div>
      </DetailModal>
    )
  },
}

// 삭제 버튼 없음
export const WithoutDelete: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    
    return (
      <DetailModal<Product>
        open={open}
        onClose={() => setOpen(false)}
        item={null}
        title="정보 보기"
        showDelete={false}
        onSave={() => setOpen(false)}
        saveLabel="확인"
      >
        <div style={{ padding: '16px 0' }}>
          <p>읽기 전용 정보입니다.</p>
        </div>
      </DetailModal>
    )
  },
}

// 커스텀 라벨
export const CustomLabels: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    
    return (
      <DetailModal<Product>
        open={open}
        onClose={() => setOpen(false)}
        item={null}
        title="상품 등록"
        onSave={() => {
          alert('등록되었습니다')
          setOpen(false)
        }}
        saveLabel="등록하기"
        deleteLabel="제거"
      >
        <div style={{ padding: '16px 0' }}>
          <p>커스텀 라벨이 적용된 버튼입니다.</p>
        </div>
      </DetailModal>
    )
  },
}

// 실제 사용 예시
export const RealWorldExample: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [form, setForm] = useState({
      name: '',
      price: 0,
      stock: 0,
    })
    
    const handleSave = () => {
      if (editingProduct) {
        setProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...form } : p))
      } else {
        setProducts([...products, { id: Date.now().toString(), ...form }])
      }
      setOpen(false)
      setEditingProduct(null)
      setForm({ name: '', price: 0, stock: 0 })
    }
    
    const handleDelete = () => {
      if (editingProduct) {
        setProducts(products.filter(p => p.id !== editingProduct.id))
        setOpen(false)
        setEditingProduct(null)
      }
    }
    
    return (
      <div style={{ padding: '24px', maxWidth: '800px' }}>
        <button onClick={() => {
          setEditingProduct(null)
          setForm({ name: '', price: 0, stock: 0 })
          setOpen(true)
        }}>
          상품 추가
        </button>
        
        <div style={{ marginTop: '16px' }}>
          {products.map(product => (
            <div key={product.id} style={{ padding: '8px', border: '1px solid #ccc', marginBottom: '8px' }}>
              <strong>{product.name}</strong> - ₩{product.price.toLocaleString()} (재고: {product.stock})
              <button
                onClick={() => {
                  setEditingProduct(product)
                  setForm({ name: product.name, price: product.price, stock: product.stock })
                  setOpen(true)
                }}
                style={{ marginLeft: '8px' }}
              >
                수정
              </button>
            </div>
          ))}
        </div>
        
        <DetailModal<Product>
          open={open}
          onClose={() => {
            setOpen(false)
            setEditingProduct(null)
            setForm({ name: '', price: 0, stock: 0 })
          }}
          item={editingProduct}
          title={editingProduct ? '상품 수정' : '새 상품 추가'}
          onSave={handleSave}
          onDelete={editingProduct ? handleDelete : undefined}
        >
          <DetailForm
            fields={[
              [
                {
                  name: 'name',
                  label: '상품명',
                  type: 'text',
                  required: true,
                  value: form.name,
                  onChange: (v) => setForm({ ...form, name: String(v) }),
                },
                {
                  name: 'price',
                  label: '가격',
                  type: 'number',
                  required: true,
                  value: form.price,
                  onChange: (v) => setForm({ ...form, price: Number(v) }),
                },
              ],
              [
                {
                  name: 'stock',
                  label: '재고',
                  type: 'number',
                  value: form.stock,
                  onChange: (v) => setForm({ ...form, stock: Number(v) }),
                },
              ],
            ]}
          />
        </DetailModal>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: '실제 사용 예시: 상품 관리 CRUD',
      },
    },
  },
}
