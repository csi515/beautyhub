-- BeautyHub 테이블 이름 변경 (외래키 의존성을 고려한 순서로 변경)

-- 먼저 외래키 참조가 없는 테이블부터 변경
ALTER TABLE IF EXISTS customers RENAME TO beautyhub_customers;
ALTER TABLE IF EXISTS products RENAME TO beautyhub_products;
ALTER TABLE IF EXISTS staff RENAME TO beautyhub_staff;
ALTER TABLE IF EXISTS expenses RENAME TO beautyhub_expenses;
ALTER TABLE IF EXISTS settings RENAME TO beautyhub_settings;
ALTER TABLE IF EXISTS budgets RENAME TO beautyhub_budgets;
ALTER TABLE IF EXISTS audit_logs RENAME TO beautyhub_audit_logs;

-- 외래키 참조가 있는 테이블 변경
ALTER TABLE IF EXISTS appointments RENAME TO beautyhub_appointments;
ALTER TABLE IF EXISTS transactions RENAME TO beautyhub_transactions;
ALTER TABLE IF EXISTS points_ledger RENAME TO beautyhub_points_ledger;
ALTER TABLE IF EXISTS customer_products RENAME TO beautyhub_customer_products;
ALTER TABLE IF EXISTS customer_product_ledger RENAME TO beautyhub_customer_product_ledger;
ALTER TABLE IF EXISTS vouchers RENAME TO beautyhub_vouchers;
ALTER TABLE IF EXISTS voucher_uses RENAME TO beautyhub_voucher_uses;
ALTER TABLE IF EXISTS staff_attendance RENAME TO beautyhub_staff_attendance;
ALTER TABLE IF EXISTS payroll_settings RENAME TO beautyhub_payroll_settings;
ALTER TABLE IF EXISTS payroll_records RENAME TO beautyhub_payroll_records;
ALTER TABLE IF EXISTS consultation_notes RENAME TO beautyhub_consultation_notes;
ALTER TABLE IF EXISTS customer_photos RENAME TO beautyhub_customer_photos;
ALTER TABLE IF EXISTS appointment_reminders RENAME TO beautyhub_appointment_reminders;
ALTER TABLE IF EXISTS appointment_templates RENAME TO beautyhub_appointment_templates;
ALTER TABLE IF EXISTS product_batches RENAME TO beautyhub_product_batches;
ALTER TABLE IF EXISTS inventory_transactions RENAME TO beautyhub_inventory_transactions;
ALTER TABLE IF EXISTS inventory_alerts RENAME TO beautyhub_inventory_alerts;

-- 인덱스 이름 변경
ALTER INDEX IF EXISTS idx_customers_owner_id RENAME TO idx_beautyhub_customers_owner_id;
ALTER INDEX IF EXISTS idx_products_owner_id RENAME TO idx_beautyhub_products_owner_id;
ALTER INDEX IF EXISTS idx_staff_owner_id RENAME TO idx_beautyhub_staff_owner_id;
ALTER INDEX IF EXISTS idx_appointments_owner_id RENAME TO idx_beautyhub_appointments_owner_id;
ALTER INDEX IF EXISTS idx_appointments_customer_id RENAME TO idx_beautyhub_appointments_customer_id;
ALTER INDEX IF EXISTS idx_appointments_staff_id RENAME TO idx_beautyhub_appointments_staff_id;
ALTER INDEX IF EXISTS idx_appointments_service_id RENAME TO idx_beautyhub_appointments_service_id;
ALTER INDEX IF EXISTS idx_appointments_recurring_id RENAME TO idx_beautyhub_appointments_recurring_id;
ALTER INDEX IF EXISTS idx_budgets_owner_id RENAME TO idx_beautyhub_budgets_owner_id;
ALTER INDEX IF EXISTS idx_product_batches_owner_id RENAME TO idx_beautyhub_product_batches_owner_id;
ALTER INDEX IF EXISTS idx_audit_logs_owner_id RENAME TO idx_beautyhub_audit_logs_owner_id;
ALTER INDEX IF EXISTS idx_inventory_transactions_owner_id RENAME TO idx_beautyhub_inventory_transactions_owner_id;
ALTER INDEX IF EXISTS idx_inventory_alerts_owner_id RENAME TO idx_beautyhub_inventory_alerts_owner_id;

-- 외래키 제약조건은 자동으로 업데이트됨 (PostgreSQL이 테이블 이름 변경을 추적)