'use client'

import Card from '@/app/components/ui/Card'
import { Box, Typography } from '@mui/material'

type GridItem = {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
}

type Props = {
  items: GridItem[]
}

export default function SettingsIconGrid({ items }: Props) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
        gridTemplateRows: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: '1fr' },
        gap: { xs: 1.25, sm: 2 },
        alignContent: 'stretch',
        '& > *': { minHeight: 0 },
      }}
    >
      {items.map(({ id, label, icon, onClick }) => (
        <Card
          key={id}
          clickable
          onClick={onClick}
          compact
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: { xs: 2, md: 1.5 },
            minHeight: { xs: 72, md: 0 },
            height: '100%',
            transition: 'all 200ms ease',
            '&:hover': {
              borderColor: 'primary.light',
              bgcolor: 'action.hover',
            },
          }}
          aria-label={`${label} 설정 열기`}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'primary.50',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
              transition: 'background-color 200ms ease',
              '& svg': { width: 20, height: 20 },
            }}
          >
            {icon}
          </Box>
          <Typography variant="caption" fontWeight={500} sx={{ color: 'text.primary', textAlign: 'center', fontSize: '0.8125rem' }}>
            {label}
          </Typography>
        </Card>
      ))}
    </Box>
  )
}
