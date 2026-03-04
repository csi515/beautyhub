import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { CustomerPhotosRepository } from '@/app/lib/repositories/customer-photos.repository'

/**
 * DELETE /api/customers/[id]/photos/[photoId]
 * 고객 사진 삭제
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; photoId: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const photoId = params.photoId

    // 사진 정보 조회 (Storage에서 파일 삭제하기 위해)
    const repository = new CustomerPhotosRepository(userId, supabase)
    const photo = await repository.findById(photoId)

    // Storage에서 파일 삭제
    if (photo.photo_url) {
      // URL에서 파일 경로 추출
      const url = new URL(photo.photo_url)
      const pathParts = url.pathname.split('/')
      const filePath = pathParts.slice(pathParts.indexOf('customer-photos')).join('/')

      const { error: deleteError } = await supabase.storage
        .from('customer-photos')
        .remove([filePath])

      if (deleteError) {
        console.error('Error deleting file from storage:', deleteError)
        // Storage 삭제 실패해도 DB 삭제는 진행
      }
    }

    // 데이터베이스에서 삭제
    await repository.delete(photoId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer photo:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer photo' },
      { status: 500 }
    )
  }
}
