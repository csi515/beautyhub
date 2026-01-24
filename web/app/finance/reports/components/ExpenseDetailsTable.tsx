'use client'

import { Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

interface ExpenseDetailsTableProps {
  expenseDetails: Array<{ category: string; amount: number }>
}

export default function ExpenseDetailsTable({ expenseDetails }: ExpenseDetailsTableProps) {
  if (expenseDetails.length === 0) return null

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          지출 상세 내역
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
              {expenseDetails.map((detail, index) => (
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
