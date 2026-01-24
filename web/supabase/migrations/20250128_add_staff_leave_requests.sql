-- 직원 휴가 신청 테이블
CREATE TABLE IF NOT EXISTS beautyhub_staff_leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES beautyhub_staff(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'annual' CHECK (type IN ('annual', 'sick', 'etc')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_leave_requests_owner_id ON beautyhub_staff_leave_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_staff_leave_requests_staff_id ON beautyhub_staff_leave_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_leave_requests_status ON beautyhub_staff_leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_staff_leave_requests_start_date ON beautyhub_staff_leave_requests(start_date);

ALTER TABLE beautyhub_staff_leave_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own leave requests" ON beautyhub_staff_leave_requests;
CREATE POLICY "Users can view own leave requests"
  ON beautyhub_staff_leave_requests FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert own leave requests" ON beautyhub_staff_leave_requests;
CREATE POLICY "Users can insert own leave requests"
  ON beautyhub_staff_leave_requests FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update own leave requests" ON beautyhub_staff_leave_requests;
CREATE POLICY "Users can update own leave requests"
  ON beautyhub_staff_leave_requests FOR UPDATE
  USING (auth.uid() = owner_id);
