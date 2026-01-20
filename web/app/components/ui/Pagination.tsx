'use client'

import MuiPagination from '@mui/material/Pagination'
import Box from '@mui/material/Box'
import { useResponsivePaginationSize } from '@/app/lib/hooks/useResponsivePaginationSize'

type Props = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: Props) {
  const size = useResponsivePaginationSize()
  
  if (totalPages <= 1) return null

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }} className={className}>
      <MuiPagination
        count={totalPages}
        page={currentPage}
        onChange={(_, page) => onPageChange(page)}
        color="primary"
        shape="rounded"
        variant="text"
        size={size}
        siblingCount={0}
        boundaryCount={1}
        showFirstButton={false}
        showLastButton={false}
        sx={{
          '& .MuiPagination-ul': {
            flexWrap: 'wrap',
            justifyContent: 'center',
          },
          '& .MuiPaginationItem-root': {
            borderRadius: 1.5,
            fontWeight: 600,
            transition: 'all 200ms ease-in-out',
            minWidth: { xs: '36px', sm: '40px' },
            minHeight: { xs: '36px', sm: '40px' },
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }
          }
        }}
      />
    </Box>
  )
}
