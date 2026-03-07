import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import DateInput from './DateInput'

const meta: Meta<typeof DateInput> = {
  title: 'UI/DateInput',
  component: DateInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof DateInput>

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('2026-03-07')
    return (
      <DateInput
        label="예약 날짜"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        fullWidth
      />
    )
  },
}
