/**
 * 메모 템플릿 관리 훅
 */

import { useState, useEffect } from 'react'
import type { MemoTemplate } from '@/app/components/modals/MemoTemplateModal'

const STORAGE_KEY = 'memo_templates'

/**
 * 로컬 스토리지에서 템플릿 불러오기
 */
function loadTemplatesFromStorage(): MemoTemplate[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as MemoTemplate[]
    }
  } catch (error) {
    console.error('템플릿 로드 실패:', error)
  }
  return []
}

/**
 * 로컬 스토리지에 템플릿 저장
 */
function saveTemplatesToStorage(templates: MemoTemplate[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
  } catch (error) {
    console.error('템플릿 저장 실패:', error)
  }
}

/**
 * 메모 템플릿 관리 훅
 */
export function useMemoTemplates() {
  const [templates, setTemplates] = useState<MemoTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 로드
    const loaded = loadTemplatesFromStorage()
    setTemplates(loaded)
    setLoading(false)
  }, [])

  const createTemplate = (data: Omit<MemoTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    const newTemplate: MemoTemplate = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updated = [...templates, newTemplate]
    setTemplates(updated)
    saveTemplatesToStorage(updated)
    return newTemplate
  }

  const updateTemplate = (id: string, data: Partial<Omit<MemoTemplate, 'id' | 'created_at'>>) => {
    const updated = templates.map((t) =>
      t.id === id
        ? {
            ...t,
            ...data,
            updated_at: new Date().toISOString(),
          }
        : t
    )
    setTemplates(updated)
    saveTemplatesToStorage(updated)
  }

  const deleteTemplate = (id: string) => {
    const updated = templates.filter((t) => t.id !== id)
    setTemplates(updated)
    saveTemplatesToStorage(updated)
  }

  const getTemplatesByCategory = (category?: string) => {
    if (!category) return templates
    return templates.filter((t) => t.category === category)
  }

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByCategory,
  }
}
