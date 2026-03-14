-- =====================================================
-- BeautyHub CRM 통합 스키마
-- 회원(users) 테이블을 제외한 나머지 테이블 정리
--
-- 주의: users 테이블은 유지되고, 그 외 테이블은 DROP 후 재생성됩니다.
-- Supabase SQL Editor에서 직접 실행
-- =====================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- DROP (의존성 역순)
-- 뷰/테이블이 혼재될 수 있으므로 VIEW 먼저 DROP
-- ============================================
DROP VIEW IF EXISTS public.inquiries CASCADE;
DROP VIEW IF EXISTS public.staff_attendance CASCADE;
DROP VIEW IF EXISTS public.voucher_uses CASCADE;
DROP VIEW IF EXISTS public.vouchers CASCADE;
DROP VIEW IF EXISTS public.customer_product_ledger CASCADE;
DROP VIEW IF EXISTS public.customer_products CASCADE;
DROP VIEW IF EXISTS public.points_ledger CASCADE;
DROP VIEW IF EXISTS public.transactions CASCADE;
DROP VIEW IF EXISTS public.expenses CASCADE;
DROP VIEW IF EXISTS public.appointment_reminders CASCADE;
DROP VIEW IF EXISTS public.appointment_templates CASCADE;
DROP VIEW IF EXISTS public.consultation_notes CASCADE;
DROP VIEW IF EXISTS public.customer_photos CASCADE;
DROP VIEW IF EXISTS public.appointments CASCADE;
DROP VIEW IF EXISTS public.inventory_transactions CASCADE;
DROP VIEW IF EXISTS public.inventory_alerts CASCADE;
DROP VIEW IF EXISTS public.payroll_records CASCADE;
DROP VIEW IF EXISTS public.payroll_settings CASCADE;
DROP VIEW IF EXISTS public.staff CASCADE;
DROP VIEW IF EXISTS public.products CASCADE;
DROP VIEW IF EXISTS public.customers CASCADE;
DROP VIEW IF EXISTS public.settings CASCADE;

DROP TABLE IF EXISTS public.inquiries CASCADE;
DROP TABLE IF EXISTS public.staff_attendance CASCADE;
DROP TABLE IF EXISTS public.voucher_uses CASCADE;
DROP TABLE IF EXISTS public.vouchers CASCADE;
DROP TABLE IF EXISTS public.customer_product_ledger CASCADE;
DROP TABLE IF EXISTS public.customer_products CASCADE;
DROP TABLE IF EXISTS public.points_ledger CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.appointment_reminders CASCADE;
DROP TABLE IF EXISTS public.appointment_templates CASCADE;
DROP TABLE IF EXISTS public.consultation_notes CASCADE;
DROP TABLE IF EXISTS public.customer_photos CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.inventory_transactions CASCADE;
DROP TABLE IF EXISTS public.inventory_alerts CASCADE;
DROP TABLE IF EXISTS public.payroll_records CASCADE;
DROP TABLE IF EXISTS public.payroll_settings CASCADE;
DROP TABLE IF EXISTS public.staff CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
-- users 테이블은 유지 (회원 정보 보존)

-- ============================================
-- 1. CUSTOMERS
-- ============================================
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    features TEXT,
    skin_type TEXT,
    allergy_info TEXT,
    memo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_owner ON public.customers(owner_id);
CREATE INDEX idx_customers_name ON public.customers(name);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_all" ON public.customers FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 2. PRODUCTS
-- ============================================
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    stock_count INTEGER DEFAULT 0,
    safety_stock INTEGER DEFAULT 0,
    duration_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_owner ON public.products(owner_id);
CREATE INDEX idx_products_active ON public.products(active);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_all" ON public.products FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 3. STAFF
-- ============================================
CREATE TABLE public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    role TEXT,
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    status TEXT,
    skills TEXT,
    incentive_rate NUMERIC(5, 2),
    profile_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_owner ON public.staff(owner_id);
CREATE INDEX idx_staff_active ON public.staff(active);
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_all" ON public.staff FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 4. APPOINTMENTS
-- ============================================
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    appointment_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled',
    total_price NUMERIC(10, 2),
    notes TEXT,
    no_show BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_owner ON public.appointments(owner_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_customer ON public.appointments(customer_id);
CREATE INDEX idx_appointments_staff ON public.appointments(staff_id);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appointments_all" ON public.appointments FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 5. TRANSACTIONS
-- ============================================
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    type TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    category TEXT,
    payment_method TEXT,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_owner ON public.transactions(owner_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_customer ON public.transactions(customer_id);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_all" ON public.transactions FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 6. EXPENSES
-- ============================================
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    expense_date DATE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL,
    memo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_owner ON public.expenses(owner_id);
CREATE INDEX idx_expenses_date ON public.expenses(expense_date);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expenses_all" ON public.expenses FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 7. SETTINGS
-- ============================================
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL UNIQUE,
    settings JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_settings_owner ON public.settings(owner_id);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_select_own" ON public.settings FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "settings_insert_own" ON public.settings FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "settings_update_own" ON public.settings FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "settings_delete_own" ON public.settings FOR DELETE USING (owner_id = auth.uid());

-- ============================================
-- 8. POINTS_LEDGER
-- ============================================
CREATE TABLE public.points_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    delta INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_points_ledger_owner ON public.points_ledger(owner_id);
CREATE INDEX idx_points_ledger_customer ON public.points_ledger(customer_id);
CREATE INDEX idx_points_ledger_created ON public.points_ledger(created_at DESC);
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "points_ledger_select" ON public.points_ledger FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "points_ledger_insert" ON public.points_ledger FOR INSERT WITH CHECK (owner_id = auth.uid());

-- ============================================
-- 9. CUSTOMER_PRODUCTS
-- ============================================
CREATE TABLE public.customer_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, product_id)
);

CREATE INDEX idx_customer_products_owner ON public.customer_products(owner_id);
CREATE INDEX idx_customer_products_customer ON public.customer_products(customer_id);
CREATE INDEX idx_customer_products_product ON public.customer_products(product_id);
ALTER TABLE public.customer_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer_products_all" ON public.customer_products FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 10. CUSTOMER_PRODUCT_LEDGER
-- ============================================
CREATE TABLE public.customer_product_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    delta INTEGER NOT NULL,
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_product_ledger_owner ON public.customer_product_ledger(owner_id);
CREATE INDEX idx_customer_product_ledger_customer ON public.customer_product_ledger(customer_id);
CREATE INDEX idx_customer_product_ledger_product ON public.customer_product_ledger(product_id);
ALTER TABLE public.customer_product_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer_product_ledger_select" ON public.customer_product_ledger FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "customer_product_ledger_insert" ON public.customer_product_ledger FOR INSERT WITH CHECK (owner_id = auth.uid());

-- ============================================
-- 11. VOUCHERS (금액 기반)
-- ============================================
CREATE TABLE public.vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    name TEXT,
    voucher_type TEXT,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    remaining_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_amount NUMERIC(10, 2),
    notes TEXT,
    expires_at DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vouchers_owner ON public.vouchers(owner_id);
CREATE INDEX idx_vouchers_customer ON public.vouchers(customer_id);
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vouchers_all" ON public.vouchers FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 12. VOUCHER_USES
-- ============================================
CREATE TABLE public.voucher_uses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT
);

CREATE INDEX idx_voucher_uses_owner ON public.voucher_uses(owner_id);
CREATE INDEX idx_voucher_uses_voucher ON public.voucher_uses(voucher_id);
ALTER TABLE public.voucher_uses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "voucher_uses_all" ON public.voucher_uses FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 13. STAFF_ATTENDANCE
-- ============================================
CREATE TABLE public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('scheduled', 'actual')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT,
    memo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_attendance_owner ON public.staff_attendance(owner_id);
CREATE INDEX idx_staff_attendance_staff ON public.staff_attendance(staff_id);
CREATE INDEX idx_staff_attendance_start ON public.staff_attendance(start_time);
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_attendance_all" ON public.staff_attendance FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 14. INQUIRIES (공개 문의)
-- ============================================
CREATE TABLE public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(name) <= 50),
    email TEXT NOT NULL CHECK (char_length(email) <= 100),
    phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 20),
    subject TEXT NOT NULL CHECK (char_length(subject) <= 100),
    message TEXT NOT NULL CHECK (char_length(message) <= 2000),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inquiries_created_at ON public.inquiries(created_at DESC);
CREATE INDEX idx_inquiries_status ON public.inquiries(status);
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inquiries_insert_public" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "inquiries_select_admin" ON public.inquiries FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin'))
);
CREATE POLICY "inquiries_update_admin" ON public.inquiries FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin'))
);
CREATE POLICY "inquiries_delete_admin" ON public.inquiries FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin'))
);

-- ============================================
-- 15. CONSULTATION_NOTES
-- ============================================
CREATE TABLE public.consultation_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    note_date DATE NOT NULL DEFAULT CURRENT_DATE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultation_notes_owner ON public.consultation_notes(owner_id);
CREATE INDEX idx_consultation_notes_customer ON public.consultation_notes(customer_id);
CREATE INDEX idx_consultation_notes_appointment ON public.consultation_notes(appointment_id);
ALTER TABLE public.consultation_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consultation_notes_all" ON public.consultation_notes FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 16. CUSTOMER_PHOTOS
-- ============================================
CREATE TABLE public.customer_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    photo_url TEXT NOT NULL,
    photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after', 'general')),
    notes TEXT,
    taken_at DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_photos_owner ON public.customer_photos(owner_id);
CREATE INDEX idx_customer_photos_customer ON public.customer_photos(customer_id);
ALTER TABLE public.customer_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer_photos_all" ON public.customer_photos FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 17. APPOINTMENT_REMINDERS
-- ============================================
CREATE TABLE public.appointment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('1_day_before', '3_hours_before', 'on_day')),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointment_reminders_owner ON public.appointment_reminders(owner_id);
CREATE INDEX idx_appointment_reminders_appointment ON public.appointment_reminders(appointment_id);
CREATE INDEX idx_appointment_reminders_sent ON public.appointment_reminders(sent_at);
ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appointment_reminders_all" ON public.appointment_reminders FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 18. APPOINTMENT_TEMPLATES
-- ============================================
CREATE TABLE public.appointment_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    name TEXT NOT NULL,
    service_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    duration_minutes INTEGER DEFAULT 60,
    default_price NUMERIC(10, 2),
    default_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointment_templates_owner ON public.appointment_templates(owner_id);
ALTER TABLE public.appointment_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appointment_templates_all" ON public.appointment_templates FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 19. INVENTORY_TRANSACTIONS
-- ============================================
CREATE TABLE public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'sale', 'adjustment')),
    quantity INTEGER NOT NULL,
    before_count INTEGER,
    after_count INTEGER,
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_transactions_owner ON public.inventory_transactions(owner_id);
CREATE INDEX idx_inventory_transactions_product ON public.inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_created ON public.inventory_transactions(created_at);
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory_transactions_all" ON public.inventory_transactions FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 20. INVENTORY_ALERTS
-- ============================================
CREATE TABLE public.inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock')),
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_alerts_owner ON public.inventory_alerts(owner_id);
CREATE INDEX idx_inventory_alerts_product ON public.inventory_alerts(product_id);
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory_alerts_all" ON public.inventory_alerts FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 21. PAYROLL_SETTINGS
-- ============================================
CREATE TABLE public.payroll_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    base_salary INTEGER DEFAULT 0,
    hourly_rate INTEGER DEFAULT 0,
    national_pension_rate NUMERIC(5,2) DEFAULT 4.5,
    health_insurance_rate NUMERIC(5,2) DEFAULT 3.545,
    employment_insurance_rate NUMERIC(5,2) DEFAULT 0.9,
    income_tax_rate NUMERIC(5,2) DEFAULT 3.3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id, staff_id)
);

CREATE INDEX idx_payroll_settings_owner ON public.payroll_settings(owner_id);
CREATE INDEX idx_payroll_settings_staff ON public.payroll_settings(staff_id);
ALTER TABLE public.payroll_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payroll_settings_all" ON public.payroll_settings FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 22. PAYROLL_RECORDS
-- ============================================
CREATE TABLE public.payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    base_salary INTEGER DEFAULT 0,
    overtime_pay INTEGER DEFAULT 0,
    incentive_pay INTEGER DEFAULT 0,
    total_gross INTEGER DEFAULT 0,
    national_pension INTEGER DEFAULT 0,
    health_insurance INTEGER DEFAULT 0,
    employment_insurance INTEGER DEFAULT 0,
    income_tax INTEGER DEFAULT 0,
    total_deductions INTEGER DEFAULT 0,
    net_salary INTEGER DEFAULT 0,
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id, staff_id, month)
);

CREATE INDEX idx_payroll_records_owner ON public.payroll_records(owner_id);
CREATE INDEX idx_payroll_records_staff ON public.payroll_records(staff_id);
CREATE INDEX idx_payroll_records_month ON public.payroll_records(month);
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payroll_records_all" ON public.payroll_records FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- TRIGGERS: updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customer_products_updated_at BEFORE UPDATE ON public.customer_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vouchers_updated_at BEFORE UPDATE ON public.vouchers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_attendance_updated_at BEFORE UPDATE ON public.staff_attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consultation_notes_updated_at BEFORE UPDATE ON public.consultation_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointment_templates_updated_at BEFORE UPDATE ON public.appointment_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payroll_settings_updated_at BEFORE UPDATE ON public.payroll_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
