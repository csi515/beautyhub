/**
 * Web Speech API를 이용한 음성 인식 유틸리티
 */

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
}

export interface UseSpeechRecognitionOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  onResult?: (result: SpeechRecognitionResult) => void
  onError?: (error: Error) => void
  onEnd?: () => void
}

/**
 * 음성 인식 지원 여부 확인
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
}

/**
 * 음성 인식 인스턴스 생성
 */
export function createSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  if (!isSpeechRecognitionSupported()) {
    throw new Error('음성 인식을 지원하지 않는 브라우저입니다.')
  }

  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
  const recognition = new SpeechRecognition()

  recognition.lang = options.language || 'ko-KR'
  recognition.continuous = options.continuous ?? false
  recognition.interimResults = options.interimResults ?? false

  recognition.onresult = (event: any) => {
    let finalTranscript = ''
    let confidence = 0

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      const resultConfidence = event.results[i][0].confidence || 0

      if (event.results[i].isFinal) {
        finalTranscript += transcript
        confidence = Math.max(confidence, resultConfidence)
      }
    }

    if (finalTranscript && options.onResult) {
      options.onResult({
        transcript: finalTranscript,
        confidence,
      })
    }
  }

  recognition.onerror = (event: any) => {
    const errorMessage = event.error || '음성 인식 중 오류가 발생했습니다.'
    if (options.onError) {
      options.onError(new Error(errorMessage))
    }
  }

  recognition.onend = () => {
    if (options.onEnd) {
      options.onEnd()
    }
  }

  return recognition
}

/**
 * 음성 인식 시작
 */
export function startSpeechRecognition(options: UseSpeechRecognitionOptions = {}): () => void {
  try {
    const recognition = createSpeechRecognition(options)
    recognition.start()

    return () => {
      recognition.stop()
    }
  } catch (error) {
    if (options.onError) {
      options.onError(error instanceof Error ? error : new Error('음성 인식을 시작할 수 없습니다.'))
    }
    return () => {}
  }
}
