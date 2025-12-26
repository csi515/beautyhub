-- =====================================================
-- 직원 통합 관리 시스템을 위한 스키마 확장
-- =====================================================

-- 1. staff 테이블 확장
ALTER TABLE public.staff 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'office';

ALTER TABLE public.staff 
ADD COLUMN IF NOT EXISTS skills TEXT;

ALTER TABLE public.staff 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- 2. 근태 기록 테이블 생성
CREATE TABLE IF NOT EXISTS public.staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'scheduled' (예정), 'actual' (실제)
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'normal', -- 'normal', 'late', 'absent', etc.
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_staff_attendance_owner ON public.staff_attendance(owner_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff ON public.staff_attendance(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_time ON public.staff_attendance(start_time);

-- RLS 활성화
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_attendance_all" ON public.staff_attendance
FOR ALL USING (owner_id = auth.uid());

-- updated_at 트리거 적용 (기존 함수 재사용)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_staff_attendance_updated_at') THEN
    CREATE TRIGGER update_staff_attendance_updated_at
      BEFORE UPDATE ON public.staff_attendance
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
