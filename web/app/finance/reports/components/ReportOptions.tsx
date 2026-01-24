'use client'

import { Grid, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material'

interface ReportOptionsProps {
  reportType: 'monthly' | 'quarterly'
  year: number
  month: number
  quarter: number
  onReportTypeChange: (type: 'monthly' | 'quarterly') => void
  onYearChange: (year: number) => void
  onMonthChange: (month: number) => void
  onQuarterChange: (quarter: number) => void
}

export default function ReportOptions({
  reportType,
  year,
  month,
  quarter,
  onReportTypeChange,
  onYearChange,
  onMonthChange,
  onQuarterChange,
}: ReportOptionsProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          리포트 옵션
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>리포트 유형</InputLabel>
              <Select
                value={reportType}
                label="리포트 유형"
                onChange={(e) => onReportTypeChange(e.target.value as 'monthly' | 'quarterly')}
              >
                <MenuItem value="monthly">월별</MenuItem>
                <MenuItem value="quarterly">분기별</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>연도</InputLabel>
              <Select
                value={year}
                label="연도"
                onChange={(e) => onYearChange(Number(e.target.value))}
              >
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}년
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {reportType === 'monthly' ? (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>월</InputLabel>
                <Select
                  value={month}
                  label="월"
                  onChange={(e) => onMonthChange(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}월
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ) : (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>분기</InputLabel>
                <Select
                  value={quarter}
                  label="분기"
                  onChange={(e) => onQuarterChange(Number(e.target.value))}
                >
                  {[1, 2, 3, 4].map((q) => (
                    <MenuItem key={q} value={q}>
                      {q}분기
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}
