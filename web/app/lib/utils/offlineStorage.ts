/**
 * IndexedDB를 이용한 오프라인 저장소 유틸리티
 */

const DB_NAME = 'BeautyHubDB'
const DB_VERSION = 1

interface StoreSchema {
  appointments: Appointment
  customers: Customer
  transactions: Transaction
  products: Product
  staff: Staff
  expenses: Expense
}

interface OfflineOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  store: keyof StoreSchema
  data: any
  timestamp: number
}

/**
 * IndexedDB 초기화
 */
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // 오프라인 작업 큐 스토어
      if (!db.objectStoreNames.contains('offline_queue')) {
        const queueStore = db.createObjectStore('offline_queue', { keyPath: 'id', autoIncrement: true })
        queueStore.createIndex('timestamp', 'timestamp', { unique: false })
        queueStore.createIndex('type', 'type', { unique: false })
      }

      // 캐시 데이터 스토어
      const stores: Array<keyof StoreSchema> = ['appointments', 'customers', 'transactions', 'products', 'staff', 'expenses']

      stores.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id' })
          store.createIndex('updated_at', 'updated_at', { unique: false })
        }
      })
    }
  })
}

/**
 * 오프라인 작업 큐에 추가
 */
export async function addToOfflineQueue(operation: Omit<OfflineOperation, 'id' | 'timestamp'>): Promise<void> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    console.warn('IndexedDB를 지원하지 않는 브라우저입니다.')
    return
  }

  try {
    const db = await initDB()
    const transaction = db.transaction(['offline_queue'], 'readwrite')
    const store = transaction.objectStore('offline_queue')

    const queueItem: OfflineOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }

    await new Promise<void>((resolve, reject) => {
      const request = store.add(queueItem)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    db.close()
  } catch (error) {
    console.error('오프라인 큐 추가 실패:', error)
  }
}

/**
 * 오프라인 작업 큐 조회
 */
export async function getOfflineQueue(): Promise<OfflineOperation[]> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return []
  }

  try {
    const db = await initDB()
    const transaction = db.transaction(['offline_queue'], 'readonly')
    const store = transaction.objectStore('offline_queue')
    const index = store.index('timestamp')

    return new Promise((resolve, reject) => {
      const request = index.getAll()
      request.onsuccess = () => {
        db.close()
        resolve(request.result || [])
      }
      request.onerror = () => {
        db.close()
        reject(request.error)
      }
    })
  } catch (error) {
    console.error('오프라인 큐 조회 실패:', error)
    return []
  }
}

/**
 * 오프라인 작업 큐에서 제거
 */
export async function removeFromOfflineQueue(id: string): Promise<void> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return
  }

  try {
    const db = await initDB()
    const transaction = db.transaction(['offline_queue'], 'readwrite')
    const store = transaction.objectStore('offline_queue')

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    db.close()
  } catch (error) {
    console.error('오프라인 큐 제거 실패:', error)
  }
}

/**
 * 데이터를 로컬 캐시에 저장
 */
export async function cacheData<T>(storeName: keyof StoreSchema, data: T | T[]): Promise<void> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return
  }

  try {
    const db = await initDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)

    const items = Array.isArray(data) ? data : [data]

    await Promise.all(
      items.map(
        (item: any) =>
          new Promise<void>((resolve, reject) => {
            const request = store.put({ ...item, cached_at: Date.now() })
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
          })
      )
    )

    db.close()
  } catch (error) {
    console.error('데이터 캐시 저장 실패:', error)
  }
}

/**
 * 로컬 캐시에서 데이터 조회
 */
export async function getCachedData<T>(storeName: keyof StoreSchema): Promise<T[]> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return []
  }

  try {
    const db = await initDB()
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        db.close()
        resolve(request.result || [])
      }
      request.onerror = () => {
        db.close()
        reject(request.error)
      }
    })
  } catch (error) {
    console.error('캐시 데이터 조회 실패:', error)
    return []
  }
}

/**
 * 로컬 캐시 삭제
 */
export async function clearCache(storeName?: keyof StoreSchema): Promise<void> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return
  }

  try {
    const db = await initDB()
    const stores = storeName ? [storeName] : ['appointments', 'customers', 'transactions', 'products', 'staff', 'expenses']

    await Promise.all(
      stores.map(
        (store) =>
          new Promise<void>((resolve, reject) => {
            const transaction = db.transaction([store], 'readwrite')
            const objectStore = transaction.objectStore(store)
            const request = objectStore.clear()
            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
          })
      )
    )

    db.close()
  } catch (error) {
    console.error('캐시 삭제 실패:', error)
  }
}

// 타입 정의 (간단화)
type Appointment = any
type Customer = any
type Transaction = any
type Product = any
type Staff = any
type Expense = any
