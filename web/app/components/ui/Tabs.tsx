'use client'

import React, { createContext, useContext } from 'react'
import MuiTabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'

type TabsContextType = {
  value: string
  onChange: (v: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

const useTabs = () => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tabs components must be used within a Tabs provider')
  return context
}

type TabsProps = {
  defaultValue?: string
  value?: string
  onValueChange?: (v: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({ defaultValue, value: controlled, onValueChange, children, className }: TabsProps) {
  // Simple state management if uncontrolled
  const [internalValue, setInternalValue] = React.useState(defaultValue || '')

  const value = controlled ?? internalValue
  const onChange = (v: string) => {
    onValueChange?.(v)
    setInternalValue(v)
  }

  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <Box className={className} sx={{ width: '100%' }}>
        {children}
      </Box>
    </TabsContext.Provider>
  )
}

type TabsListProps = {
  children: React.ReactNode
  className?: string
}

export function TabsList({ children, className }: TabsListProps) {
  const { value, onChange } = useTabs()

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }} className={className}>
      <MuiTabs
        value={value}
        onChange={(_, v) => onChange(v)}
        variant="scrollable"
        scrollButtons={false}
        textColor="primary"
        indicatorColor="primary"
        sx={{
          minHeight: { xs: '48px', sm: 'auto' },
          '& .MuiTab-root': {
            minHeight: { xs: '48px', sm: 'auto' },
            minWidth: { xs: '80px', sm: 'auto' },
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            textTransform: 'none',
            fontWeight: 500,
            px: { xs: 2, sm: 3 },
          },
        }}
      >
        {children}
      </MuiTabs>
    </Box>
  )
}

type TabsTriggerProps = {
  value: string
  children: React.ReactNode
  className?: string
  // Props injected by MuiTabs parent:
  // onChange, selected, etc. MuiTabs injects these into direct children.
  // We must pass them down to the Tab component or just use Mui Tab directly.
}

export function TabsTrigger({ value, children, className = '', ...props }: TabsTriggerProps) {
  return (
    <Tab
      label={children}
      value={value}
      className={className}
      sx={{ 
        textTransform: 'none', 
        fontWeight: 500,
        minHeight: { xs: '48px', sm: 'auto' },
        minWidth: { xs: '80px', sm: 'auto' },
        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
        px: { xs: 2, sm: 3 },
      }}
      {...props}
    />
  )
}

type TabsContentProps = {
  value: string
  children: React.ReactNode
  className?: string
}

export function TabsContent({ value: contentValue, children, className }: TabsContentProps) {
  const { value } = useTabs()

  if (value !== contentValue) return null

  return (
    <Box role="tabpanel" className={className} sx={{ py: 2 }}>
      {children}
    </Box>
  )
}

export default Tabs
