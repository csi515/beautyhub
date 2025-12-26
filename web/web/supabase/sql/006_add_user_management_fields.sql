-- 사용자 관리 필드 추가 및 RLS 정책 설정

-- 1. users 테이블에 branch_name과 status 컬럼 추가
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS branch_name text,
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'PENDING';

-- 2. status 컬럼에 CHECK 제약 조건 추가
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_status_check' AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_status_check 
    CHECK (status IN ('PENDING', 'ACTIVE', 'INACTIVE'));
  END IF;
END $$;

-- 3. role 컬럼 CHECK 제약 조건 추가 (super_admin 포함)
DO $$
BEGIN
  -- 기존 제약 조건 삭제
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_role_check' AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_role_check;
  END IF;
  
  -- 새 제약 조건 추가
  ALTER TABLE public.users 
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('pending', 'user', 'admin', 'super_admin'));
END $$;

-- 4. 슈퍼 관리자 전용 RLS 정책: 모든 사용자 조회 가능
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'super_admin_select_all_users' AND tablename = 'users'
  ) THEN
    CREATE POLICY "super_admin_select_all_users" ON public.users
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
      )
    );
  END IF;
END $$;

-- 5. 슈퍼 관리자 전용 RLS 정책: 모든 사용자 업데이트 가능
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'super_admin_update_all_users' AND tablename = 'users'
  ) THEN
    CREATE POLICY "super_admin_update_all_users" ON public.users
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
      )
    );
  END IF;
END $$;

-- 6. handle_new_user 트리거 함수 업데이트 (branch_name 추가 및 status 기본값 설정)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone, birthdate, branch_name, status)
  VALUES (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'name'), null),
    coalesce((new.raw_user_meta_data->>'phone'), null),
    nullif((new.raw_user_meta_data->>'birthdate'), '')::date,
    coalesce((new.raw_user_meta_data->>'branch_name'), null),
    'PENDING'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_branch_name ON public.users(branch_name);

COMMENT ON COLUMN public.users.branch_name IS '사용자가 소속된 지점명';
COMMENT ON COLUMN public.users.status IS '사용자 승인 상태: PENDING(대기), ACTIVE(승인됨), INACTIVE(비활성화)';
