'use client'

import { useState } from 'react'
import { Box, Container, Typography, Card, CardContent, Stack, Button, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel } from '@mui/material'
import { Download, Upload, Database, AlertTriangle, FileText } from 'lucide-react'
import PageHeader from '@/app/components/common/PageHeader'
import { useAppToast } from '@/app/components/ui/Toast'

export default function BackupPage() {
  const [downloading, setDownloading] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [restoreModalOpen, setRestoreModalOpen] = useState(false)
  const [restoreConfirm, setRestoreConfirm] = useState(false)
  const [restoreFile, setRestoreFile] = useState<File | null>(null)
  const toast = useAppToast()

  const handleBackup = async () => {
    try {
      setDownloading(true)
      const response = await fetch('/api/backup')

      if (!response.ok) {
        throw new Error('백업 생성에 실패했습니다')
      }

      const backupData = await response.json()

      // JSON 파일로 다운로드
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `backup_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('백업 파일이 다운로드되었습니다.')
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : '백업 생성에 실패했습니다.')
    } finally {
      setDownloading(false)
    }
  }

  const handleRestore = async () => {
    if (!restoreFile || !restoreConfirm) {
      toast.error('파일을 선택하고 확인을 체크해주세요.')
      return
    }

    try {
      setRestoring(true)
      const text = await restoreFile.text()
      const backupData = JSON.parse(text)

      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupData,
          confirmReplace: restoreConfirm,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (error.requiresConfirmation) {
          toast.error('복구를 진행하려면 확인을 체크해주세요.')
          return
        }
        throw new Error(error.message || '복구에 실패했습니다')
      }

      await response.json()
      toast.success('데이터 복구가 완료되었습니다.')
      setRestoreModalOpen(false)
      setRestoreFile(null)
      setRestoreConfirm(false)

      // 페이지 새로고침 (선택적)
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : '데이터 복구에 실패했습니다.')
    } finally {
      setRestoring(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="데이터 백업 및 복구"
        description="데이터 백업 생성 및 복구 관리"
        icon={<Database />}
        actions={[]}
      />

      <Stack spacing={4} sx={{ mt: 4 }}>
        {/* 경고 메시지 */}
        <Alert severity="warning" icon={<AlertTriangle />}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            주의사항
          </Typography>
          <Typography variant="body2">
            • 백업은 정기적으로 수행하는 것을 권장합니다.
            <br />
            • 복구 시 기존 데이터가 덮어씌워질 수 있습니다.
            <br />
            • 백업 파일은 안전한 곳에 보관하세요.
          </Typography>
        </Alert>

        {/* 백업 */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Download size={24} color="#667eea" />
              <Typography variant="h6" fontWeight={600}>
                데이터 백업
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              현재 데이터베이스의 모든 데이터를 JSON 파일로 백업합니다.
            </Typography>
            <Button
              variant="contained"
              startIcon={downloading ? <CircularProgress size={16} /> : <Download size={18} />}
              onClick={handleBackup}
              disabled={downloading}
            >
              {downloading ? '백업 생성 중...' : '백업 다운로드'}
            </Button>
          </CardContent>
        </Card>

        {/* 복구 */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Upload size={24} color="#f59e0b" />
              <Typography variant="h6" fontWeight={600}>
                데이터 복구
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              이전에 생성한 백업 파일을 업로드하여 데이터를 복구합니다.
            </Typography>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<Upload size={18} />}
              onClick={() => setRestoreModalOpen(true)}
            >
              백업 파일 업로드
            </Button>
          </CardContent>
        </Card>

        {/* 백업 정보 */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <FileText size={24} color="#4facfe" />
              <Typography variant="h6" fontWeight={600}>
                백업 정보
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              백업 파일에는 다음 데이터가 포함됩니다:
            </Typography>
            <Box component="ul" sx={{ mt: 2, pl: 3 }}>
              <li>고객 정보</li>
              <li>예약 내역</li>
              <li>거래 내역</li>
              <li>제품 정보</li>
              <li>직원 정보</li>
              <li>지출 내역</li>
              <li>재고 트랜잭션</li>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* 복구 모달 */}
      <Dialog open={restoreModalOpen} onClose={() => setRestoreModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>데이터 복구</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="error">
              <Typography variant="body2" fontWeight={600} gutterBottom>
                ⚠️ 주의
              </Typography>
              <Typography variant="body2">
                복구 시 기존 데이터가 덮어씌워질 수 있습니다. 복구하기 전에 현재 데이터를 백업하는 것을 권장합니다.
              </Typography>
            </Alert>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
              style={{ marginTop: 16 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={restoreConfirm}
                  onChange={(e) => setRestoreConfirm(e.target.checked)}
                  color="error"
                />
              }
              label="데이터 복구를 진행하겠습니다 (기존 데이터가 덮어씌워질 수 있습니다)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreModalOpen(false)}>취소</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRestore}
            disabled={!restoreFile || !restoreConfirm || restoring}
            startIcon={restoring ? <CircularProgress size={16} /> : <Upload size={18} />}
          >
            {restoring ? '복구 중...' : '복구 시작'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
