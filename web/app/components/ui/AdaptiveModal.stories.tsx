import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import Button from './Button'
import AdaptiveModal, { ModalBody, ModalFooter, ModalHeader } from './AdaptiveModal'

const meta: Meta<typeof AdaptiveModal> = {
  title: 'UI/AdaptiveModal',
  component: AdaptiveModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof AdaptiveModal>

function AdaptiveModalDemo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>모달 열기</Button>
      <AdaptiveModal open={open} onClose={() => setOpen(false)} size="md">
        <ModalHeader title="예약 생성" description="모바일에서는 바텀시트로 표시됩니다." onClose={() => setOpen(false)} />
        <ModalBody>
          <div style={{ minHeight: 180 }}>폼 영역</div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>취소</Button>
          <Button onClick={() => setOpen(false)}>저장</Button>
        </ModalFooter>
      </AdaptiveModal>
    </>
  )
}

export const Desktop: Story = {
  render: () => <AdaptiveModalDemo />,
}

export const MobileBottomSheet: Story = {
  render: () => <AdaptiveModalDemo />,
  parameters: {
    viewport: {
      defaultViewport: 'iPhone SE',
    },
  },
}
