/**
 * Service Worker - 하이브리드 캐싱 전략
 * 
 * - 정적 자산: Stale-While-Revalidate (빠른 응답 + 백그라운드 업데이트)
 * - API 요청: Network-First (최신 데이터 우선)
 * - 오프라인: 캐시된 리소스 제공
 */

const CACHE_VERSION = 'v2'
const CACHE_NAME = `beautyhub-static-${CACHE_VERSION}`
const RUNTIME_CACHE = `beautyhub-runtime-${CACHE_VERSION}`

// 캐시할 정적 리소스 목록
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/dashboard',
  '/customers',
  '/products',
  '/appointments',
  '/finance',
  '/staff',
  '/inventory',
  '/payroll',
  '/settings',
  '/analytics',
]

// 정적 자산 확장자 (Stale-While-Revalidate 적용)
const STATIC_EXTENSIONS = ['.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.svg', '.woff', '.woff2', '.ttf', '.ico']

// 설치 이벤트: 정적 리소스 캐싱
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...', CACHE_VERSION)

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets')
      // 오프라인 페이지를 우선 캐싱
      return Promise.all([
        cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' }))),
        // 오프라인 페이지가 없을 경우를 대비해 빈 HTML도 준비
        cache.put('/offline', new Response(
          '<!DOCTYPE html><html><head><title>오프라인</title></head><body><h1>오프라인 상태입니다</h1></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        )).catch(() => {})
      ])
    })
  )

  // 즉시 활성화하여 이전 버전을 대체
  self.skipWaiting()
})

// 활성화 이벤트: 오래된 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...', CACHE_VERSION)

  event.waitUntil(
    Promise.all([
      // 오래된 캐시 삭제
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // 현재 버전이 아닌 캐시 삭제
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      }),
      // 모든 클라이언트에 즉시 제어권 부여
      self.clients.claim()
    ])
  )
})

// 정적 자산인지 확인
function isStaticAsset(url) {
  return STATIC_EXTENSIONS.some(ext => url.pathname.endsWith(ext)) ||
         url.pathname === '/' ||
         STATIC_ASSETS.includes(url.pathname)
}

// API 요청인지 확인
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')
}

// fetch 이벤트: 하이브리드 캐싱 전략
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 같은 출처의 요청만 처리
  if (url.origin !== location.origin) {
    return
  }

  // GET 요청만 캐싱
  if (request.method !== 'GET') {
    return
  }

  // API 요청: Network-First 전략
  if (isAPIRequest(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 네트워크 요청 성공 시 응답을 캐시에 저장
          if (response && response.status === 200) {
            const responseToCache = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서 찾기
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // 캐시에도 없으면 오프라인 응답
            return new Response(JSON.stringify({ error: '오프라인 상태입니다.' }), {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'application/json; charset=utf-8',
              }),
            })
          })
        })
    )
    return
  }

  // 정적 자산: Stale-While-Revalidate 전략
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // 백그라운드에서 네트워크 요청 수행
        const fetchPromise = fetch(request).then((networkResponse) => {
          // 네트워크 응답이 성공적이면 캐시 업데이트
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return networkResponse
        }).catch(() => {
          // 네트워크 실패는 무시 (캐시 사용)
        })

        // 캐시된 응답이 있으면 즉시 반환, 없으면 네트워크 대기
        if (cachedResponse) {
          return cachedResponse
        }
        return fetchPromise
      }).catch(() => {
        // 캐시 매칭 실패 시 네트워크 시도
        return fetch(request).catch(() => {
          // 네트워크도 실패하면 오프라인 페이지 (HTML 요청인 경우)
          if (request.destination === 'document') {
            return caches.match('/offline').then((offlinePage) => {
              return offlinePage || caches.match('/')
            })
          }
          // 기타 정적 자산은 빈 응답
          return new Response('', { status: 503 })
        })
      })
    )
    return
  }

  // 기타 요청: Network-First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          if (request.destination === 'document') {
            return caches.match('/offline').then((offlinePage) => {
              return offlinePage || caches.match('/')
            })
          }
          return new Response('오프라인 상태입니다.', {
            status: 503,
            headers: new Headers({
              'Content-Type': 'text/plain; charset=utf-8',
            }),
          })
        })
      })
  )
})

// 메시지 이벤트: 클라이언트와 통신
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls)
      })
    )
  }
})

