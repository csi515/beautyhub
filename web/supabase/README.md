# Supabase 스키마

## 마이그레이션 실행 순서

**신규 설치 시** (기존 데이터 없음):
```bash
# Supabase CLI 사용 시
supabase db push

# 또는 Supabase 대시보드 SQL Editor에서
# supabase/migrations/20250313000000_consolidated_schema.sql 내용 실행
```

**기존 DB가 있는 경우**  
`20250313000000_consolidated_schema.sql`는 **users 테이블을 제외한** 나머지 테이블만 DROP 후 재생성합니다.  
회원 정보는 유지되고, 그 외 데이터는 삭제됩니다.

## 테이블 목록 (22개, users 제외)

| # | 테이블 | 설명 |
|---|--------|------|
| 1 | customers | 고객 |
| 2 | products | 상품/서비스 |
| 3 | staff | 직원 |
| 4 | appointments | 예약 |
| 5 | transactions | 거래/매출 |
| 6 | expenses | 지출 |
| 7 | settings | 사용자별 설정 |
| 8 | points_ledger | 포인트 적립/사용 |
| 9 | customer_products | 고객별 상품 보유 |
| 10 | customer_product_ledger | 상품 입출고 내역 |
| 11 | vouchers | 바우처(금액권) |
| 12 | voucher_uses | 바우처 사용 내역 |
| 13 | staff_attendance | 직원 근무 |
| 14 | inquiries | 공개 문의 |
| 15 | consultation_notes | 상담 일지 |
| 16 | customer_photos | 고객 사진 |
| 17 | appointment_reminders | 예약 리마인더 |
| 18 | appointment_templates | 예약 템플릿 |
| 19 | inventory_transactions | 재고 입출고 |
| 20 | inventory_alerts | 재고 알림 |
| 21 | payroll_settings | 급여 설정 |
| 22 | payroll_records | 급여 기록 |
| - | users | **유지** (회원 정보, DROP/CREATE 제외) |

## Storage 버킷

- `customer-photos`: 고객 사진 업로드 (Supabase Storage에서 수동 생성 필요)
