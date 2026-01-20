/**
 * 감사 로그 유틸리티
 */

import type { AuditLogCreateInput } from '@/types/audit'

let auditLogQueue: Array<{ input: AuditLogCreateInput; userId?: string | null }> = []
let isProcessing = false

/**
 * 감사 로그 기록 (비동기 큐 방식)
 */
export async function logAudit(input: AuditLogCreateInput, userId?: string | null): Promise<void> {
  // 큐에 추가
  auditLogQueue.push({ input, userId })

  // 즉시 처리 시작 (이미 처리 중이면 스킵)
  if (!isProcessing) {
    processAuditQueue()
  }
}

/**
 * 감사 로그 큐 처리
 */
async function processAuditQueue(): Promise<void> {
  if (isProcessing || auditLogQueue.length === 0) return

  isProcessing = true

  while (auditLogQueue.length > 0) {
    const item = auditLogQueue.shift()
    if (!item) break

    try {
      // API 호출
      await fetch('/api/audit/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item.input,
          user_id: item.userId || null,
        }),
      })
    } catch (error) {
      console.error('감사 로그 기록 실패:', error)
      // 실패한 항목을 다시 큐에 추가 (최대 3회까지)
      if (!item.input.description?.includes('[RETRY')) {
        auditLogQueue.push({
          ...item,
          input: {
            ...item.input,
            description: `${item.input.description || ''} [RETRY:${Date.now()}]`,
          },
        })
      }
    }
  }

  isProcessing = false
}

/**
 * 주요 작업 로깅 헬퍼
 */
export const auditHelpers = {
  logCreate: (resourceType: AuditLogCreateInput['resource_type'], resourceId: string, newData: any, description?: string) =>
    logAudit({
      action_type: 'create',
      resource_type: resourceType,
      resource_id: resourceId,
      new_data: newData,
      description,
    }),

  logUpdate: (resourceType: AuditLogCreateInput['resource_type'], resourceId: string, oldData: any, newData: any, description?: string) =>
    logAudit({
      action_type: 'update',
      resource_type: resourceType,
      resource_id: resourceId,
      old_data: oldData,
      new_data: newData,
      description,
    }),

  logDelete: (resourceType: AuditLogCreateInput['resource_type'], resourceId: string, oldData: any, description?: string) =>
    logAudit({
      action_type: 'delete',
      resource_type: resourceType,
      resource_id: resourceId,
      old_data: oldData,
      description,
    }),

  logView: (resourceType: AuditLogCreateInput['resource_type'], resourceId: string, description?: string) =>
    logAudit({
      action_type: 'view',
      resource_type: resourceType,
      resource_id: resourceId,
      description,
    }),

  logExport: (resourceType: AuditLogCreateInput['resource_type'], description?: string) =>
    logAudit({
      action_type: 'export',
      resource_type: resourceType,
      description,
    }),

  logBackup: (description?: string) =>
    logAudit({
      action_type: 'backup',
      resource_type: 'system',
      description,
    }),

  logRestore: (description?: string) =>
    logAudit({
      action_type: 'restore',
      resource_type: 'system',
      description,
    }),
}
