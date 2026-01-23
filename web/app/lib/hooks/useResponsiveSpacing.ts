'use client'

/**
 * 반응형 spacing 훅
 * 앱 전반 spacing 규칙 강제
 * 반응형 spacing 값 제공
 */

import { useMemo } from 'react'
import { sectionSpacing, componentSpacing, cardSpacing, type ResponsiveSpacing } from '../utils/spacing'

export interface UseResponsiveSpacingReturn {
  section: ResponsiveSpacing
  component: ResponsiveSpacing
  card: ResponsiveSpacing
  getSpacing: (type: 'section' | 'component' | 'card') => ResponsiveSpacing
}

/**
 * 반응형 spacing 훅
 * 
 * UX 규칙:
 * - sectionSpacing: 모바일 8~12px, 웹 24~32px
 * - componentSpacing: 모바일 8px, 웹 16px
 * - cardSpacing: 모바일 8~12px, 웹 16px
 * 
 * @example
 * const spacing = useResponsiveSpacing()
 * <Stack spacing={spacing.section}>
 */
export function useResponsiveSpacing(): UseResponsiveSpacingReturn {
  const getSpacing = useMemo(
    () => (type: 'section' | 'component' | 'card'): ResponsiveSpacing => {
      switch (type) {
        case 'section':
          return sectionSpacing
        case 'component':
          return componentSpacing
        case 'card':
          return cardSpacing
        default:
          return componentSpacing
      }
    },
    []
  )

  return {
    section: sectionSpacing,
    component: componentSpacing,
    card: cardSpacing,
    getSpacing,
  }
}
