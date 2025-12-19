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

  // We need to clone children to extract 'value' prop for MuiTabs standard behavior? 
  // No, MuiTabs takes 'value' and 'onChange'. The *Children* of MuiTabs must be <Tab>.
  // But here 'children' are our <TabsTrigger> wrappers.
  // We can just render MuiTabs and map the children if possible, or we just use Box and let 'TabsTrigger' be 'Tab'.
  // However, TabsTrigger components are React Elements. We can iterate them.

  // Check if children are valid React elements and map specific props?
  // Simpler: Just render MuiTabs and let it handle the children if they are MuiTab compatible.
  // But our TabsTrigger is a custom component. MuiTabs expects children to be Tab or have 'value' prop.
  // Our TabsTrigger HAS a value prop.

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }} className={className}>
      <MuiTabs
        value={value}
        onChange={(_, v) => onChange(v)}
        variant="scrollable"
        scrollButtons="auto"
        textColor="primary"
        indicatorColor="primary"
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
  // MuiTabs passes extra props like 'fullWidth', 'indicator', 'onChange', 'selected', 'textColor', 'value'
  // We forward them to Tab.
  return (
    <Tab
      label={children} // Tab takes label, not children for content usually, but supports children too?
      // Material UI Tab 'label' is usually text/node. Children are not typical for text labels but allowed in some versions.
      // Safest is using 'label={children}'
      value={value}
      className={className}
      sx={{ textTransform: 'none', fontWeight: 500 }}
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
