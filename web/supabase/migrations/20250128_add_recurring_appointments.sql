-- 반복 예약을 위한 recurring_id 필드 추가
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS recurring_id UUID;

-- recurring_id 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_appointments_recurring_id ON public.appointments(recurring_id);

-- recurring_id로 그룹화된 예약 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_appointments_recurring_owner ON public.appointments(owner_id, recurring_id) WHERE recurring_id IS NOT NULL;
