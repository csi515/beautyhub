'use client'

import { Card, Box, Typography, Stack, Avatar } from '@mui/material'
import { User, Phone, Mail, Coins, Package } from 'lucide-react'

type CustomerSummaryBarProps = {
  name: string
  phone?: string | null
  email?: string | null
  pointsBalance: number
  holdingsCount: number
}

export default function CustomerSummaryBar({
  name,
  phone,
  email,
  pointsBalance,
  holdingsCount
}: CustomerSummaryBarProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
        <Avatar
          sx={{
            bgcolor: 'primary.50',
            color: 'primary.main',
            width: 52,
            height: 52,
            fontSize: '1.25rem',
            fontWeight: 700
          }}
        >
          {name.slice(0, 1) || <User size={24} />}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700} noWrap>
            {name}
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
            {phone && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                <Phone size={14} />
                <Typography variant="caption">{phone}</Typography>
              </Box>
            )}
            {email && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                <Mail size={14} />
                <Typography variant="caption" noWrap>{email}</Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 2, sm: 4 },
          width: { xs: '100%', sm: 'auto' },
          justifyContent: { xs: 'space-around', sm: 'flex-end' },
          pl: { sm: 3 },
          borderLeft: { sm: '1px solid' },
          borderColor: { sm: 'divider' }
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" gutterBottom>
            포인트
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main' }}>
            <Coins size={18} />
            <Typography variant="h6" fontWeight={800}>
              {pointsBalance.toLocaleString()}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" gutterBottom>
            보유 상품
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.primary' }}>
            <Package size={18} />
            <Typography variant="h6" fontWeight={800}>
              {holdingsCount}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

