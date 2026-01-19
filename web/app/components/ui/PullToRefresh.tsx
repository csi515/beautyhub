'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress, Typography } from '@mui/material'
import { RefreshCw } from 'lucide-react'

type Props = {
  children: React.ReactNode
  onRefresh?: () => Promise<void>
  disabled?: boolean
  className?: string
}

/**
 * 통합된 Pull-to-Refresh 컴포넌트
 * 모바일에서 아래로 당겨서 새로고침
 */
export default function PullToRefresh({ 
  children, 
  onRefresh, 
  disabled = false,
  className = ''
}: Props) {
  const router = useRouter()
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [pulling, setPulling] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const isRefreshingRef = useRef(false)

  // Threshold to trigger refresh (px)
  const PULL_THRESHOLD = 80
  // Max pull distance visually
  const MAX_PULL = 120

  useEffect(() => {
    if (refreshing || disabled) return

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && !disabled && e.touches[0] && !isRefreshingRef.current) {
        setStartY(e.touches[0].clientY)
        setPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling || disabled || isRefreshingRef.current) return

      const y = e.touches[0]?.clientY ?? 0
      const diff = y - startY

      // Pulling down at top
      if (diff > 0 && window.scrollY === 0) {
        // Add resistance
        const newY = Math.min(diff * 0.5, MAX_PULL)
        setCurrentY(newY)

        // Prevent default only if we are significantly pulling
        // to avoid interfering with small scrolls
        if (diff > 10 && e.cancelable) {
          e.preventDefault()
        }
      } else {
        // Scrolled down or pushing up
        setPulling(false)
        setCurrentY(0)
      }
    }

    const handleTouchEnd = async () => {
      if (!pulling || disabled || isRefreshingRef.current) return

      if (currentY >= PULL_THRESHOLD) {
        setRefreshing(true)
        isRefreshingRef.current = true
        setCurrentY(PULL_THRESHOLD) // Snap to threshold

        try {
          if (onRefresh) {
            await onRefresh()
          } else {
            // Default: Router refresh
            const start = Date.now()
            router.refresh()
            // Ensure minimum spin time
            const elapsed = Date.now() - start
            if (elapsed < 500) await new Promise(r => setTimeout(r, 500 - elapsed))
          }
        } finally {
          setRefreshing(false)
          isRefreshingRef.current = false
          setCurrentY(0)
        }
      } else {
        setCurrentY(0)
      }
      setPulling(false)
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [startY, pulling, refreshing, currentY, router, onRefresh, disabled])

  const pullProgress = Math.min(currentY / PULL_THRESHOLD, 1)

  return (
    <Box className={className}>
      {/* Loading Indicator */}
      <Box
        sx={{
          height: currentY,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: pulling ? 'none' : 'height 0.3s ease-out',
          bgcolor: 'background.default',
          position: 'relative',
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 1, 
            opacity: Math.min(pullProgress, 1),
            transform: `scale(${0.5 + pullProgress * 0.5})`,
            transition: pulling ? 'none' : 'all 0.2s ease-out',
          }}
        >
          {refreshing ? (
            <CircularProgress size={24} thickness={4} />
          ) : (
            <>
              <RefreshCw
                size={24}
                className={`text-neutral-500 transition-transform duration-200 ${
                  currentY >= PULL_THRESHOLD ? 'rotate-180' : ''
                }`}
                style={{
                  transform: `rotate(${pullProgress * 180}deg)`,
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {currentY >= PULL_THRESHOLD ? '놓아서 새로고침' : '당겨서 새로고침'}
              </Typography>
            </>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box
        ref={contentRef}
        sx={{
          transition: pulling ? 'none' : 'transform 0.3s ease-out',
          transform: pulling ? `translateY(${currentY * 0.3}px)` : 'translateY(0)',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
