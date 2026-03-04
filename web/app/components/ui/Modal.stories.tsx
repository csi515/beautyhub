import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within, waitFor } from '@storybook/test'
import { useState } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal'
import Button from './Button'
import { AlertCircle, CheckCircle } from 'lucide-react'

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '공통 Modal 컴포넌트. 모바일에서는 자동으로 fullScreen으로 전환됩니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: '모달 크기',
    },
    closeOnOutsideClick: {
      control: 'boolean',
      description: '외부 클릭 시 닫기 여부',
    },
    fullScreenOnMobile: {
      control: 'boolean',
      description: '모바일에서 fullScreen 적용 여부',
    },
  },
}

export default meta
type Story = StoryObj<typeof Modal>

// 기본 모달
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    
    return (
      <>
        <Button onClick={() => setOpen(true)}>모달 열기</Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalHeader title="기본 모달" onClose={() => setOpen(false)} />
          <ModalBody>
            이것은 기본 모달입니다. 내용을 여기에 표시합니다.
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              확인
            </Button>
          </ModalFooter>
        </Modal>
      </>
    )
  },
}

// 크기 변형
export const Small: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    
    return (
      <>
        <Button onClick={() => setOpen(true)}>Small 모달 열기</Button>
        <Modal open={open} onClose={() => setOpen(false)} size="sm">
          <ModalHeader title="Small 모달" onClose={() => setOpen(false)} />
          <ModalBody>
            작은 크기의 모달입니다.
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={() => setOpen(false)}>
              확인
            </Button>
          </ModalFooter>
        </Modal>
      </>
    )
  },
}

export const Large: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    
    return (
      <>
        <Button onClick={() => setOpen(true)}>Large 모달 열기</Button>
        <Modal open={open} onClose={() => setOpen(false)} size="lg">
          <ModalHeader title="Large 모달" onClose={() => setOpen(false)} />
          <ModalBody>
            큰 크기의 모달입니다. 더 많은 내용을 표시할 수 있습니다.
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              확인
            </Button>
          </ModalFooter>
        </Modal>
      </>
    )
  },
}

// 아이콘 포함
export const WithIcon: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    
    return (
      <>
        <Button onClick={() => setOpen(true)}>아이콘 모달 열기</Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalHeader 
            title="성공" 
            icon={<CheckCircle size={24} />}
            description="작업이 성공적으로 완료되었습니다."
            onClose={() => setOpen(false)} 
          />
          <ModalBody>
            내용이 여기에 표시됩니다.
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={() => setOpen(false)}>
              확인
            </Button>
          </ModalFooter>
        </Modal>
      </>
    )
  },
}

// 외부 클릭 비활성화
export const NoOutsideClick: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    
    return (
      <>
        <Button onClick={() => setOpen(true)}>외부 클릭 비활성화 모달</Button>
        <Modal 
          open={open} 
          onClose={() => setOpen(false)} 
          closeOnOutsideClick={false}
        >
          <ModalHeader title="외부 클릭 비활성화" onClose={() => setOpen(false)} />
          <ModalBody>
            이 모달은 외부 클릭으로 닫을 수 없습니다. 닫기 버튼을 사용해야 합니다.
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={() => setOpen(false)}>
              닫기
            </Button>
          </ModalFooter>
        </Modal>
      </>
    )
  },
}

// 모바일 뷰
export const MobileView: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    
    return (
      <>
        <Button onClick={() => setOpen(true)}>모바일 모달 열기</Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalHeader title="모바일 모달" onClose={() => setOpen(false)} />
          <ModalBody>
            모바일 화면에서는 자동으로 fullScreen으로 표시됩니다.
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={() => setOpen(false)}>
              확인
            </Button>
          </ModalFooter>
        </Modal>
      </>
    )
  },
  parameters: {
    viewport: {
      defaultViewport: 'iPhone SE',
    },
  },
}

// Interaction 테스트
export const OpenCloseInteraction: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    
    return (
      <>
        <Button onClick={() => setOpen(true)}>모달 열기 테스트</Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalHeader title="Interaction 테스트" onClose={() => setOpen(false)} />
          <ModalBody>
            모달이 정상적으로 열리고 닫히는지 테스트합니다.
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={() => setOpen(false)}>
              닫기
            </Button>
          </ModalFooter>
        </Modal>
      </>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const openButton = canvas.getByRole('button', { name: /모달 열기 테스트/i })
    
    // 모달 열기
    await userEvent.click(openButton)
    
    // 모달이 열렸는지 확인
    let modal: HTMLElement | null = null
    await waitFor(async () => {
      modal = document.querySelector('[role="dialog"]') as HTMLElement
      await expect(modal).toBeInTheDocument()
    })
    
    // 닫기 버튼 클릭
    if (modal) {
      const closeButton = within(modal).getByLabelText(/닫기/i)
      await userEvent.click(closeButton)
    }
    
    // 모달이 닫혔는지 확인
    await waitFor(async () => {
      const modalAfterClose = document.querySelector('[role="dialog"]')
      await expect(modalAfterClose).not.toBeInTheDocument()
    })
  },
}

// 실제 사용 예시
export const RealWorldExample: Story = {
  render: () => {
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [successOpen, setSuccessOpen] = useState(false)
    
    return (
      <>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            삭제 확인
          </Button>
          <Button variant="primary" onClick={() => setSuccessOpen(true)}>
            성공 메시지
          </Button>
        </div>
        
        {/* 삭제 확인 모달 */}
        <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} size="sm">
          <ModalHeader 
            title="삭제 확인" 
            icon={<AlertCircle size={24} />}
            description="이 작업은 되돌릴 수 없습니다."
            onClose={() => setDeleteOpen(false)} 
          />
          <ModalBody>
            정말로 삭제하시겠습니까?
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              취소
            </Button>
            <Button variant="danger" onClick={() => {
              setDeleteOpen(false)
              setSuccessOpen(true)
            }}>
              삭제
            </Button>
          </ModalFooter>
        </Modal>
        
        {/* 성공 메시지 모달 */}
        <Modal open={successOpen} onClose={() => setSuccessOpen(false)} size="sm">
          <ModalHeader 
            title="삭제 완료" 
            icon={<CheckCircle size={24} />}
            onClose={() => setSuccessOpen(false)} 
          />
          <ModalBody>
            항목이 성공적으로 삭제되었습니다.
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={() => setSuccessOpen(false)}>
              확인
            </Button>
          </ModalFooter>
        </Modal>
      </>
    )
  },
  parameters: {
    docs: {
      description: {
        story: '실제 사용 예시: 삭제 확인 및 성공 메시지 모달',
      },
    },
  },
}
