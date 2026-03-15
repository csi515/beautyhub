'use client'

import { useState, useEffect, type RefObject } from 'react'
import clsx from 'clsx'
import { ArrowUp } from 'lucide-react'
import Button from './Button'
import FadeIn from './FadeIn'

type Props = {
  threshold?: number
  className?: string
  smooth?: boolean
  /** 스크롤 컨테이너 ref (미제공 시 window 사용) */
  scrollContainerRef?: RefObject<HTMLElement | null>
}

export default function ScrollToTop({
  threshold = 400,
  className,
  smooth = true,
  scrollContainerRef,
}: Props) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const container = scrollContainerRef?.current
    const useWindow = !container

    const handleScroll = () => {
      const scrollTop = useWindow ? window.scrollY : container.scrollTop
      setIsVisible(scrollTop > threshold)
    }

    const target = useWindow ? window : container
    target.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      target.removeEventListener('scroll', handleScroll)
    }
  }, [threshold, scrollContainerRef])

  const scrollToTop = () => {
    const container = scrollContainerRef?.current
    if (!container) {
      if (smooth) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        window.scrollTo(0, 0)
      }
    } else {
      container.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
    }
  }

  if (!isVisible) return null

  return (
    <FadeIn triggerOnce={false} className={clsx('fixed bottom-8 right-8 z-[1000]', className)}>
      <Button
        variant="primary"
        size="md"
        onClick={scrollToTop}
        className="rounded-full h-12 w-12 p-0 shadow-lg hover:shadow-xl"
        aria-label="맨 위로 스크롤"
        leftIcon={<ArrowUp className="h-5 w-5" />}
      />
    </FadeIn>
  )
}
