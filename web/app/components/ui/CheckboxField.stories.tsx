import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import CheckboxField from './CheckboxField'

const meta: Meta<typeof CheckboxField> = {
  title: 'UI/CheckboxField',
  component: CheckboxField,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof CheckboxField>

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    return (
      <CheckboxField
        label="자동 매출 생성"
        checked={checked}
        onChange={setChecked}
        helperText="예약 완료 시 매출을 자동 생성합니다."
      />
    )
  },
}
