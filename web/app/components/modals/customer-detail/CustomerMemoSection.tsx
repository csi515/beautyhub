'use client'

import { Box } from '@mui/material'
import Input from '../../ui/Input'

interface CustomerMemoSectionProps {
  value: string
  onChange: (value: string) => void
  customerId?: string
}

export default function CustomerMemoSection({ value, onChange, customerId: _customerId }: CustomerMemoSectionProps) {
  return (
    <Box>
      <Input
        placeholder="고객 메모를 입력하세요..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        multiline
        minRows={4}
        fullWidth
      />
    </Box>
  )
}
