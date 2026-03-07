import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import TimeInput from './TimeInput'

const meta: Meta<typeof TimeInput> = {
  title: 'UI/TimeInput',
  component: TimeInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof TimeInput>

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('09:00')
    return (
      <TimeInput
        label="시작 시간"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        fullWidth
      />
    )
  },
}
