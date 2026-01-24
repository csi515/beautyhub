'use client'

import { Card, Grid, Typography, Box, Stack, TextField, InputAdornment } from '@mui/material'
import { Plus, Minus, Coins } from 'lucide-react'
import Button from '@/app/components/ui/Button'

interface PointsManagementSectionProps {
  pointsBalance: number
  pointsDelta: number
  pointsReason: string
  onChangePointsDelta: (delta: number) => void
  onChangePointsReason: (reason: string) => void
  onAddPoints: () => void
  onDeductPoints: () => void
}

export default function PointsManagementSection({
  pointsBalance,
  pointsDelta,
  pointsReason,
  onChangePointsDelta,
  onChangePointsReason,
  onAddPoints,
  onDeductPoints,
}: PointsManagementSectionProps) {
  return (
    <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Coins size={20} className="text-primary-main" />
        <Typography variant="subtitle1" fontWeight={700}>
          포인트 관리
        </Typography>
      </Box>

      <Box sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" fontWeight={600} color="primary.dark">현 보유 포인트</Typography>
        <Typography variant="h5" fontWeight={800} color="primary.main">
          {pointsBalance.toLocaleString()} <Typography component="span" variant="body1" fontWeight={600}>점</Typography>
        </Typography>
      </Box>

      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="수량"
              type="number"
              fullWidth
              size="small"
              value={pointsDelta || ''}
              onChange={(e) => onChangePointsDelta(Number(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">점</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              label="사유"
              fullWidth
              size="small"
              placeholder="선택사항"
              value={pointsReason}
              onChange={(e) => onChangePointsReason(e.target.value)}
            />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={2}>
          <Button
            onClick={onAddPoints}
            disabled={!pointsDelta || pointsDelta <= 0}
            variant="primary"
            className="flex-1"
            leftIcon={<Plus size={18} />}
          >
            포인트 추가
          </Button>
          <Button
            onClick={onDeductPoints}
            disabled={!pointsDelta || pointsDelta <= 0}
            variant="danger"
            className="flex-1"
            leftIcon={<Minus size={18} />}
          >
            포인트 차감
          </Button>
        </Stack>
      </Stack>
    </Card>
  )
}
