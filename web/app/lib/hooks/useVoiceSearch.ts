/**
 * 음성 검색 훅
 */

import { useState, useCallback } from 'react'
import { isSpeechRecognitionSupported, startSpeechRecognition } from '../utils/speechToText'

export interface UseVoiceSearchReturn {
  isListening: boolean
  transcript: string
  error: string | null
  startListening: () => void
  stopListening: () => void
  reset: () => void
}

/**
 * 음성 검색 훅
 */
export function useVoiceSearch(): UseVoiceSearchReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [stopRecognition, setStopRecognition] = useState<(() => void) | null>(null)

  const startListening = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      setError('음성 인식을 지원하지 않는 브라우저입니다.')
      return
    }

    setIsListening(true)
    setError(null)
    setTranscript('')

    const stop = startSpeechRecognition({
      language: 'ko-KR',
      continuous: false,
      interimResults: false,
      onResult: (result) => {
        setTranscript(result.transcript)
        setIsListening(false)
        setStopRecognition(null)
      },
      onError: (err) => {
        setError(err.message || '음성 인식 중 오류가 발생했습니다.')
        setIsListening(false)
        setStopRecognition(null)
      },
      onEnd: () => {
        setIsListening(false)
        setStopRecognition(null)
      },
    })

    setStopRecognition(() => stop)
  }, [])

  const stopListening = useCallback(() => {
    if (stopRecognition) {
      stopRecognition()
      setStopRecognition(null)
    }
    setIsListening(false)
  }, [stopRecognition])

  const reset = useCallback(() => {
    stopListening()
    setTranscript('')
    setError(null)
  }, [stopListening])

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    reset,
  }
}
