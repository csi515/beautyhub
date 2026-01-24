'use client'

import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material'

interface ExpenseDetailsTableProps {
  expenseDetails: Array<{ category: string; amount: number }>
}

export default function ExpenseDetailsTable({ expenseDetails }: ExpenseDetailsTableProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (expenseDetails.length === 0) return null

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          지출 상세 내역
        </Typography>
        {isMobile ? (
          <Stack spacing={1} sx={{ mt: 2 }}>
            {expenseDetails.map((d, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {d.category}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="error.main">
                  {d.amount.toLocaleString()}원
                </Typography>
              </Box>
            ))}
          </Stack>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>카테고리</TableCell>
                  <TableCell align="right">금액</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenseDetails.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell>{detail.category}</TableCell>
                    <TableCell align="right">{detail.amount.toLocaleString()}원</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  )
}
