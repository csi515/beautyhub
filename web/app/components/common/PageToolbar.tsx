'use client'

import { ReactNode } from 'react'
import { Stack, Paper, TextField, InputAdornment, Box } from '@mui/material'
import { Search, Download, Plus } from 'lucide-react'
import Button from '../ui/Button'
import { useMediaQuery, useTheme } from '@mui/material'

type PageToolbarProps = {
  // 검색
  search?: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }
  
  // 필터 (커스텀 ReactNode)
  filters?: ReactNode
  
  // 액션 버튼들
  actions?: {
    primary?: {
      label: string
      onClick: () => void
      icon?: ReactNode
      disabled?: boolean
    }
    secondary?: {
      label: string
      onClick: () => void
      icon?: ReactNode
      disabled?: boolean
    }[]
  }
  
  // 내보내기
  export?: {
    label?: string
    onClick: () => void
    disabled?: boolean
  }
  
  className?: string
}

/**
 * 페이지 툴바 컴포넌트
 * 검색, 필터, 액션 버튼을 통합한 일관된 UI
 */
export default function PageToolbar({
  search,
  filters,
  actions,
  export: exportAction,
  className = '',
}: PageToolbarProps) {
  const theme = useTheme()
  // 화면 크기별 세부 구분
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm')) // ~640px: 작은 모바일
  const isMobile = useMediaQuery(theme.breakpoints.down('md')) // ~768px: 모바일
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg')) // 768~1024px: 태블릿

  return (
    <Stack spacing={{ xs: 1.5, sm: 2, md: 2, lg: 2.5 }} className={className}>
      {/* 검색 및 액션 버튼 */}
      {(search || actions || exportAction) && (
        <Paper 
          sx={{ 
            p: { xs: 1.5, sm: 2, md: 2, lg: 2.5 }, 
            borderRadius: { xs: 2, md: 3 } 
          }} 
          elevation={0} 
          variant="outlined"
        >
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 1.5, sm: 2, md: 2 }} 
            alignItems="center"
          >
            {/* 검색 */}
            {search && (
              <TextField
                placeholder={search.placeholder || '검색'}
                value={search.value}
                onChange={e => search.onChange(e.target.value)}
                size="small"
                fullWidth
                sx={{
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    fontSize: { xs: '16px', sm: '16px', md: '15px', lg: '14px' },
                    minHeight: { xs: '44px', sm: '44px', md: '40px' },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search className="h-4 w-4 text-neutral-400" />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  type: 'search',
                  autoComplete: 'off',
                  autoCorrect: 'off',
                  autoCapitalize: 'off',
                  enterKeyHint: 'search',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const input = e.target as HTMLInputElement
                    input.blur()
                  }
                }}
              />
            )}
            
            {/* 액션 버튼들 */}
            <Stack 
              direction="row" 
              spacing={{ xs: 1, sm: 1, md: 1.5 }} 
              sx={{ width: { xs: '100%', sm: '100%', md: 'auto' }, flexWrap: { xs: 'wrap', md: 'nowrap' } }}
            >
              {/* 내보내기 버튼 (태블릿 이상에서만 표시) */}
              {exportAction && !isSmallMobile && (
                <Button
                  variant="secondary"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={exportAction.onClick}
                  disabled={exportAction.disabled}
                  size={isTablet ? 'sm' : 'md'}
                  sx={{ 
                    whiteSpace: 'nowrap', 
                    flexShrink: 0,
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { xs: 'auto', md: '100px' }
                  }}
                >
                  {exportAction.label || '내보내기'}
                </Button>
              )}
              
              {/* 보조 액션 버튼들 */}
              {actions?.secondary?.map((action, idx) => (
                <Button
                  key={idx}
                  variant="secondary"
                  leftIcon={action.icon}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  size={isTablet ? 'sm' : 'md'}
                  sx={{ 
                    whiteSpace: 'nowrap', 
                    flexShrink: 0,
                    width: { xs: '100%', sm: 'auto' },
                    display: { xs: isSmallMobile && idx > 0 ? 'none' : 'inline-flex', sm: 'inline-flex' }
                  }}
                >
                  {action.label}
                </Button>
              ))}
              
              {/* 주 액션 버튼 */}
              {actions?.primary && (
                <Button
                  variant="primary"
                  size={isSmallMobile ? 'sm' : isTablet ? 'sm' : 'md'}
                  leftIcon={actions.primary.icon || <Plus size={16} />}
                  onClick={actions.primary.onClick}
                  disabled={actions.primary.disabled}
                  fullWidth={isSmallMobile}
                  sx={{ 
                    whiteSpace: 'nowrap', 
                    flexShrink: 0,
                    width: { xs: '100%', sm: isMobile ? '100%' : 'auto', md: 'auto' }
                  }}
                >
                  {actions.primary.label}
                </Button>
              )}
              
              {/* 작은 모바일 내보내기 버튼 (작은 모바일에서만 표시) */}
              {exportAction && isSmallMobile && (
                <Button
                  variant="secondary"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={exportAction.onClick}
                  disabled={exportAction.disabled}
                  fullWidth
                  size="sm"
                >
                  {exportAction.label || '내보내기'}
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* 필터 */}
      {filters && (
        <Box>
          {filters}
        </Box>
      )}
    </Stack>
  )
}
