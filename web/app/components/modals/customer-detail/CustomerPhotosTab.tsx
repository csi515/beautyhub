/**
 * 고객 사진 탭 컴포넌트
 */

'use client'

import { useState, useRef } from 'react'
import { Card, Typography, Box, Stack, Chip, MenuItem, Select, FormControl, InputLabel, Grid } from '@mui/material'
import { Camera, Plus, Trash2, X, Image as ImageIcon } from 'lucide-react'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import ConfirmDialog from '@/app/components/ui/ConfirmDialog'
import { useCustomerPhotos, useUploadCustomerPhoto, useDeleteCustomerPhoto } from '@/app/lib/hooks/useCustomerPhotos'
import { useAppToast } from '@/app/lib/ui/toast'
import type { CustomerPhoto } from '@/types/entities'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import Image from 'next/image'

type CustomerPhotosTabProps = {
  customerId: string
}

export default function CustomerPhotosTab({ customerId }: CustomerPhotosTabProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null)
  const [selectedPhotoType, setSelectedPhotoType] = useState<'before' | 'after' | 'general'>('general')
  const [photoNotes, setPhotoNotes] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useAppToast()

  const { data: photos = [], isLoading } = useCustomerPhotos(customerId)
  const uploadMutation = useUploadCustomerPhoto(customerId)
  const deleteMutation = useDeleteCustomerPhoto(customerId)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드할 수 있습니다')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('파일 크기는 10MB를 초과할 수 없습니다')
        return
      }
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('파일을 선택해주세요')
      return
    }

    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        input: {
          photo_type: selectedPhotoType,
          notes: photoNotes.trim() || null,
          taken_at: new Date().toISOString(),
        },
      })
      setIsUploadModalOpen(false)
      setSelectedFile(null)
      setPreviewUrl(null)
      setPhotoNotes('')
      setSelectedPhotoType('general')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      toast.success('사진이 업로드되었습니다')
    } catch (error) {
      toast.error('사진 업로드 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다')
    }
  }

  const handleDelete = async () => {
    if (!deletePhotoId) return

    try {
      await deleteMutation.mutateAsync(deletePhotoId)
      setDeletePhotoId(null)
      toast.success('사진이 삭제되었습니다')
    } catch (error) {
      toast.error('사진 삭제 실패', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다')
    }
  }

  const handleCloseModal = () => {
    setIsUploadModalOpen(false)
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setPhotoNotes('')
    setSelectedPhotoType('general')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const beforePhotos = photos.filter(p => p.photo_type === 'before')
  const afterPhotos = photos.filter(p => p.photo_type === 'after')
  const generalPhotos = photos.filter(p => p.photo_type === 'general')

  if (!customerId) return null

  return (
    <Stack spacing={3}>
      <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Camera size={20} className="text-primary-main" />
            <Typography variant="subtitle1" fontWeight={700}>
              고객 사진
            </Typography>
          </Box>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            leftIcon={<Plus size={18} />}
          >
            사진 추가
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">로딩 중...</Typography>
          </Box>
        ) : photos.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">등록된 사진이 없습니다</Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Before 사진 */}
            {beforePhotos.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                  Before ({beforePhotos.length})
                </Typography>
                <Grid container spacing={2}>
                  {beforePhotos.map((photo) => (
                    <Grid item xs={6} sm={4} md={3} key={photo.id}>
                      <PhotoCard photo={photo} onDelete={() => setDeletePhotoId(photo.id)} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* After 사진 */}
            {afterPhotos.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                  After ({afterPhotos.length})
                </Typography>
                <Grid container spacing={2}>
                  {afterPhotos.map((photo) => (
                    <Grid item xs={6} sm={4} md={3} key={photo.id}>
                      <PhotoCard photo={photo} onDelete={() => setDeletePhotoId(photo.id)} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* 일반 사진 */}
            {generalPhotos.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                  일반 ({generalPhotos.length})
                </Typography>
                <Grid container spacing={2}>
                  {generalPhotos.map((photo) => (
                    <Grid item xs={6} sm={4} md={3} key={photo.id}>
                      <PhotoCard photo={photo} onDelete={() => setDeletePhotoId(photo.id)} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Stack>
        )}
      </Card>

      {/* 업로드 모달 */}
      {isUploadModalOpen && (
        <Card variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            사진 업로드
          </Typography>
          <Stack spacing={2}>
            <Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<ImageIcon size={18} />}
                fullWidth
              >
                {selectedFile ? '파일 변경' : '파일 선택'}
              </Button>
              {selectedFile && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  선택된 파일: {selectedFile.name}
                </Typography>
              )}
              {previewUrl && (
                <Box sx={{ mt: 2, position: 'relative', width: '100%', maxWidth: 400, aspectRatio: '4/3' }}>
                  <Image
                    src={previewUrl}
                    alt="미리보기"
                    fill
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null)
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl)
                        setPreviewUrl(null)
                      }
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
                  >
                    <X size={16} />
                  </Button>
                </Box>
              )}
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel>사진 유형</InputLabel>
              <Select
                value={selectedPhotoType}
                label="사진 유형"
                onChange={(e) => setSelectedPhotoType(e.target.value as 'before' | 'after' | 'general')}
              >
                <MenuItem value="before">Before</MenuItem>
                <MenuItem value="after">After</MenuItem>
                <MenuItem value="general">일반</MenuItem>
              </Select>
            </FormControl>
            <Input
              label="메모 (선택)"
              placeholder="사진에 대한 메모를 입력하세요"
              value={photoNotes}
              onChange={(e) => setPhotoNotes(e.target.value)}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={handleCloseModal}>
                취소
              </Button>
              <Button
                variant="primary"
                onClick={handleUpload}
                loading={uploadMutation.isPending}
                disabled={!selectedFile}
              >
                업로드
              </Button>
            </Box>
          </Stack>
        </Card>
      )}

      <ConfirmDialog
        open={!!deletePhotoId}
        onClose={() => setDeletePhotoId(null)}
        onConfirm={handleDelete}
        title="사진 삭제"
        description="이 사진을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        variant="danger"
      />
    </Stack>
  )
}

function PhotoCard({ photo, onDelete }: { photo: CustomerPhoto; onDelete: () => void }) {
  return (
    <Card
      variant="outlined"
      sx={{
        position: 'relative',
        aspectRatio: '4/3',
        overflow: 'hidden',
        borderRadius: 2,
        '&:hover .photo-overlay': {
          opacity: 1,
        },
      }}
    >
      <Image
        src={photo.photo_url}
        alt={photo.notes || '고객 사진'}
        fill
        style={{ objectFit: 'cover' }}
      />
      <Box
        className="photo-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0,0,0,0.5)',
          opacity: 0,
          transition: 'opacity 0.2s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            sx={{ minWidth: 'auto', p: 0.5, color: 'white' }}
          >
            <Trash2 size={16} />
          </Button>
        </Box>
        <Box>
          <Chip
            label={photo.photo_type === 'before' ? 'Before' : photo.photo_type === 'after' ? 'After' : '일반'}
            size="small"
            sx={{ mb: 0.5, bgcolor: 'rgba(255,255,255,0.9)' }}
          />
          {photo.notes && (
            <Typography variant="caption" sx={{ color: 'white', display: 'block' }}>
              {photo.notes}
            </Typography>
          )}
          {photo.taken_at && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mt: 0.5 }}>
              {format(new Date(photo.taken_at), 'yyyy.MM.dd', { locale: ko })}
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  )
}
