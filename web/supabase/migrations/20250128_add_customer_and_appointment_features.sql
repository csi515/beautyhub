-- =====================================================
-- 고객 관리 강화 및 예약 시스템 개선 (1단계)
-- =====================================================
-- 날짜: 2025-01-28
-- 설명: 고객 상담 일지, 사진 관리, 예약 리마인더, 템플릿, 노쇼 관리 기능 추가
-- =====================================================

-- 1. 제품 테이블에 소요 시간 필드 추가
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;

-- 2. 예약 테이블에 노쇼 필드 추가
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS no_show BOOLEAN DEFAULT FALSE;

-- ============================================
-- 3. 고객 상담 일지 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.consultation_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    note_date DATE NOT NULL DEFAULT CURRENT_DATE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultation_notes_owner ON public.consultation_notes(owner_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notes_customer ON public.consultation_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notes_appointment ON public.consultation_notes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_consultation_notes_date ON public.consultation_notes(note_date);

ALTER TABLE public.consultation_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consultation_notes_all" ON public.consultation_notes
    FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 4. 고객 사진 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.customer_photos (
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

CREATE INDEX IF NOT EXISTS idx_customer_photos_owner ON public.customer_photos(owner_id);
CREATE INDEX IF NOT EXISTS idx_customer_photos_customer ON public.customer_photos(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_photos_appointment ON public.customer_photos(appointment_id);
CREATE INDEX IF NOT EXISTS idx_customer_photos_type ON public.customer_photos(photo_type);

ALTER TABLE public.customer_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_photos_all" ON public.customer_photos
    FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 5. 예약 리마인더 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.appointment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('1_day_before', '3_hours_before', 'on_day')),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointment_reminders_owner ON public.appointment_reminders(owner_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_appointment ON public.appointment_reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_sent ON public.appointment_reminders(sent_at);

ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointment_reminders_all" ON public.appointment_reminders
    FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 6. 예약 템플릿 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.appointment_templates (
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

CREATE INDEX IF NOT EXISTS idx_appointment_templates_owner ON public.appointment_templates(owner_id);
CREATE INDEX IF NOT EXISTS idx_appointment_templates_service ON public.appointment_templates(service_id);

ALTER TABLE public.appointment_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointment_templates_all" ON public.appointment_templates
    FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- 트리거 추가 (updated_at 자동 업데이트)
-- ============================================
CREATE TRIGGER update_consultation_notes_updated_at
    BEFORE UPDATE ON public.consultation_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_templates_updated_at
    BEFORE UPDATE ON public.appointment_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 완료!
-- =====================================================
