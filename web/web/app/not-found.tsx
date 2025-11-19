'use client'

import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import Button from './components/ui/Button'

/**
 * 404 페이지 컴포넌트
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-neutral-50">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-neutral-100 flex items-center justify-center">
            <Search className="h-10 w-10 text-neutral-400" />
          </div>
        </div>
        
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-neutral-700 mb-2">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-neutral-600">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="primary"
              leftIcon={<Home className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              홈으로 이동
            </Button>
          </Link>
          <Button
            variant="secondary"
            onClick={() => {
              window.history.back()
            }}
            className="w-full sm:w-auto"
          >
            이전 페이지로
          </Button>
        </div>
      </div>
    </div>
  )
}

