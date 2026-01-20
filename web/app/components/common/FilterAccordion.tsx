'use client'

import { ReactNode } from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Button,
  Stack,
} from '@mui/material'
import { ChevronDown, RotateCcw } from 'lucide-react'

interface FilterAccordionProps {
  title?: string
  children: ReactNode
  activeFilterCount?: number
  onReset?: () => void
  defaultExpanded?: boolean
  className?: string
}

/**
 * 필터 아코디언 컴포넌트
 * 활성 필터 개수 표시 및 초기화 버튼 포함
 */
export default function FilterAccordion({
  title = '필터',
  children,
  activeFilterCount = 0,
  onReset,
  defaultExpanded = false,
  className = '',
}: FilterAccordionProps) {
  const hasActiveFilters = activeFilterCount > 0

  return (
    <Accordion defaultExpanded={defaultExpanded} className={className}>
      <AccordionSummary expandIcon={<ChevronDown />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <Typography variant="body1" fontWeight={600}>
            {title}
          </Typography>
          {hasActiveFilters && (
            <Chip label={`${activeFilterCount}개 적용됨`} size="small" color="primary" />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {children}
          {hasActiveFilters && onReset && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<RotateCcw size={16} />}
              onClick={onReset}
              sx={{
                minHeight: '44px',
                fontSize: { xs: '0.9375rem', sm: '0.875rem' },
              }}
            >
              필터 초기화
            </Button>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
