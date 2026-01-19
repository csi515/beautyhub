/**
 * 애니메이션 유틸리티
 * 일관된 애니메이션 효과를 위한 유틸리티 함수
 */

export const animations = {
  // 페이드 인/아웃
  fadeIn: {
    keyframes: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    duration: '200ms',
    easing: 'ease-out',
  },
  
  fadeOut: {
    keyframes: {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
    duration: '200ms',
    easing: 'ease-in',
  },
  
  // 슬라이드 업/다운
  slideUp: {
    keyframes: {
      from: { opacity: 0, transform: 'translateY(8px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    duration: '250ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  slideDown: {
    keyframes: {
      from: { opacity: 1, transform: 'translateY(0)' },
      to: { opacity: 0, transform: 'translateY(8px)' },
    },
    duration: '250ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // 스케일 인/아웃
  scaleIn: {
    keyframes: {
      from: { opacity: 0, transform: 'scale(0.95)' },
      to: { opacity: 1, transform: 'scale(1)' },
    },
    duration: '200ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  scaleOut: {
    keyframes: {
      from: { opacity: 1, transform: 'scale(1)' },
      to: { opacity: 0, transform: 'scale(0.95)' },
    },
    duration: '200ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // 바운스 (경고/알림용)
  bounce: {
    keyframes: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-4px)' },
    },
    duration: '300ms',
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // 펄스 (로딩/대기 상태)
  pulse: {
    keyframes: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    duration: '2s',
    easing: 'ease-in-out',
  },
  
  // 회전 (로딩 스피너)
  spin: {
    keyframes: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    duration: '1s',
    easing: 'linear',
  },
  
  // 흔들림 (에러 표시)
  shake: {
    keyframes: {
      '0%, 100%': { transform: 'translateX(0)' },
      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
      '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
    },
    duration: '250ms',
    easing: 'ease-in-out',
  },
} as const

/**
 * 트랜지션 설정
 */
export const transitions = {
  // 기본 트랜지션
  default: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  
  // 빠른 트랜지션
  fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  
  // 느린 트랜지션
  slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  
  // 색상 전용 (더 빠름)
  colors: 'color 150ms ease, background-color 150ms ease, border-color 150ms ease',
  
  // 변환 전용
  transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  
  // 그림자 전용
  shadow: 'box-shadow 200ms ease',
  
  // 투명도 전용
  opacity: 'opacity 200ms ease',
} as const

