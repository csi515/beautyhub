'use client'

import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

interface RevenueDetailsTableProps {
  revenueDetails: Array<{ category: string; amount: number }>
}

export default function RevenueDetailsTable({ revenueDetails }: RevenueDetailsTableProps) {
  if (revenueDetails.length === 0) return null

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          매출 상세 내역
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>카테고리</TableCell>
                <TableCell align="right">금액</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {revenueDetails.map((detail, index) => (
                <TableRow key={index}>
                  <TableCell>{detail.category}</TableCell>
                  <TableCell align="right">{detail.amount.toLocaleString()}원</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}
