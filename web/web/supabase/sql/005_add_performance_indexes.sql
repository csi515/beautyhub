-- 005: 성능 최적화를 위한 데이터베이스 인덱스 추가
-- 자주 검색되고 필터링되는 컬럼에 인덱스를 생성하여 쿼리 성능을 향상시킵니다.

-- 고객(customers) 테이블 인덱스
-- 전화번호로 고객 검색 시 성능 향상
CREATE INDEX IF NOT EXISTS idx_customers_phone 
ON customers(phone) 
WHERE phone IS NOT NULL;

-- 이름으로 고객 검색 시 성능 향상
CREATE INDEX IF NOT EXISTS idx_customers_name 
ON customers(name);

-- owner_id + created_at 복합 인덱스 (최근 생성된 고객 조회)
CREATE INDEX IF NOT EXISTS idx_customers_owner_created 
ON customers(owner_id, created_at DESC);

-- 예약(appointments) 테이블 인덱스
-- 예약 날짜로 필터링 시 성능 향상
CREATE INDEX IF NOT EXISTS idx_appointments_date 
ON appointments(appointment_date);

-- 고객별 예약 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id 
ON appointments(customer_id) 
WHERE customer_id IS NOT NULL;

-- 직원별 예약 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_appointments_staff_id 
ON appointments(staff_id) 
WHERE staff_id IS NOT NULL;

-- owner_id + appointment_date 복합 인덱스 (특정 날짜의 예약 조회)
CREATE INDEX IF NOT EXISTS idx_appointments_owner_date 
ON appointments(owner_id, appointment_date DESC);

-- 상태별 예약 필터링 성능 향상
CREATE INDEX IF NOT EXISTS idx_appointments_status 
ON appointments(status) 
WHERE status IS NOT NULL;

-- 거래내역(transactions) 테이블 인덱스
-- 고객별 거래 내역 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id 
ON transactions(customer_id) 
WHERE customer_id IS NOT NULL;

-- 예약별 거래 내역 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_transactions_appointment_id 
ON transactions(appointment_id) 
WHERE appointment_id IS NOT NULL;

-- 거래 날짜로 필터링 시 성능 향상
CREATE INDEX IF NOT EXISTS idx_transactions_date 
ON transactions(transaction_date) 
WHERE transaction_date IS NOT NULL;

-- owner_id + transaction_date 복합 인덱스 (기간별 거래 조회)
CREATE INDEX IF NOT EXISTS idx_transactions_owner_date 
ON transactions(owner_id, transaction_date DESC);

-- 결제 방법별 통계 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method 
ON transactions(payment_method) 
WHERE payment_method IS NOT NULL;

-- 거래 유형별 필터링 성능 향상
CREATE INDEX IF NOT EXISTS idx_transactions_type 
ON transactions(type) 
WHERE type IS NOT NULL;

-- 지출(expenses) 테이블 인덱스
-- 지출 날짜로 필터링 시 성능 향상
CREATE INDEX IF NOT EXISTS idx_expenses_date 
ON expenses(expense_date);

-- owner_id + expense_date 복합 인덱스 (기간별 지출 조회)
CREATE INDEX IF NOT EXISTS idx_expenses_owner_date 
ON expenses(owner_id, expense_date DESC);

-- 카테고리별 지출 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_expenses_category 
ON expenses(category);

-- 제품(products) 테이블 인덱스
-- 활성화된 제품 필터링 성능 향상
CREATE INDEX IF NOT EXISTS idx_products_active 
ON products(active);

-- owner_id + active 복합 인덱스 (활성 제품 조회)
CREATE INDEX IF NOT EXISTS idx_products_owner_active 
ON products(owner_id, active);

-- 제품명으로 검색 시 성능 향상
CREATE INDEX IF NOT EXISTS idx_products_name 
ON products(name);

-- 직원(staff) 테이블 인덱스
-- 활성화된 직원 필터링 성능 향상
CREATE INDEX IF NOT EXISTS idx_staff_active 
ON staff(active);

-- owner_id + active 복합 인덱스 (활성 직원 조회)
CREATE INDEX IF NOT EXISTS idx_staff_owner_active 
ON staff(owner_id, active);

-- 직원 이름으로 검색 시 성능 향상
CREATE INDEX IF NOT EXISTS idx_staff_name 
ON staff(name);

-- Full-text search 인덱스 (선택적)
-- PostgreSQL의 to_tsvector를 사용한 한국어 검색 최적화
-- 고객 이름 및 전화번호로 전체 텍스트 검색
CREATE INDEX IF NOT EXISTS idx_customers_search 
ON customers 
USING gin(to_tsvector('simple', name || ' ' || COALESCE(phone, '')));

-- 제품명으로 전체 텍스트 검색
CREATE INDEX IF NOT EXISTS idx_products_search 
ON products 
USING gin(to_tsvector('simple', name || ' ' || COALESCE(description, '')));

-- 인덱스 생성 완료 메시지
COMMENT ON INDEX idx_customers_phone IS '고객 전화번호 검색 성능 최적화';
COMMENT ON INDEX idx_appointments_date IS '예약 날짜 필터링 성능 최적화';
COMMENT ON INDEX idx_transactions_date IS '거래 날짜 필터링 성능 최적화';
COMMENT ON INDEX idx_expenses_date IS '지출 날짜 필터링 성능 최적화';
