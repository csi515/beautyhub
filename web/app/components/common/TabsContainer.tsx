'use client'

import { ReactNode } from 'react'
import { Paper, Box } from '@mui/material'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'

interface TabItem {
  value: string
  label: ReactNode
  content: ReactNode
}

interface TabsContainerProps {
  tabs: TabItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  showPaper?: boolean
}

/**
 * 탭 컨테이너 래퍼 컴포넌트
 * Paper 스타일과 일관된 탭 레이아웃 제공
 */
export default function TabsContainer({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className = '',
  showPaper = true,
  ...tabsProps
}: TabsContainerProps) {
  const tabsContent = (
    <Tabs defaultValue={defaultValue} value={value} onValueChange={onValueChange} {...tabsProps}>
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          pt: 2,
          bgcolor: '#f9fafb',
          borderBottom: 'none',
        }}
      >
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Box>
    </Tabs>
  )

  if (!showPaper) {
    return <Box className={className}>{tabsContent}</Box>
  }

  return (
    <Paper
      variant="outlined"
      className={className}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        bgcolor: 'white',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {tabsContent}
    </Paper>
  )
}
