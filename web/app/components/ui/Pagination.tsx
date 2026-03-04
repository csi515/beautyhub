/**
 * @deprecated 이 파일은 더 이상 사용되지 않습니다.
 * 대신 components/common/Pagination을 사용하세요.
 * 
 * 이전 API와의 호환성을 위한 wrapper입니다.
 */
'use client'

import CommonPagination from '../common/Pagination'

type Props = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string | undefined
}

/**
 * @deprecated components/common/Pagination 사용 권장
 */
function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: Props) {
  if (totalPages <= 1) return null

  // totalItems를 계산하기 위해 pageSize를 1로 가정
  // 실제 사용 시에는 common/Pagination을 직접 사용하는 것이 좋습니다
  const totalItems = totalPages
  const pageSize = 1

  return (
    <CommonPagination
      page={currentPage}
      pageSize={pageSize}
      totalItems={totalItems}
      totalPages={totalPages}
      onPageChange={onPageChange}
      {...(className !== undefined ? { className } : {})}
      showInfo={false}
    />
  )
}

// 이전 API와의 호환성을 위해 export
export default SimplePagination
