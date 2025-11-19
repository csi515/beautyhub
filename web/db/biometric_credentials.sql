-- Biometric credentials 테이블 생성
-- WebAuthn 자격증명 저장용

create table if not exists public.biometric_credentials (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  credential_id text not null,
  public_key jsonb not null,
  counter bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, credential_id)
);

-- 인덱스 생성
create index if not exists idx_biometric_credentials_owner on public.biometric_credentials(owner_id);
create index if not exists idx_biometric_credentials_id on public.biometric_credentials(credential_id);

-- RLS 활성화
alter table public.biometric_credentials enable row level security;

-- RLS 정책: 사용자는 자신의 자격증명만 조회/수정/삭제 가능
create policy if not exists biometric_credentials_select_policy
on public.biometric_credentials for select
using (owner_id = auth.uid());

create policy if not exists biometric_credentials_insert_policy
on public.biometric_credentials for insert
with check (owner_id = auth.uid());

create policy if not exists biometric_credentials_update_policy
on public.biometric_credentials for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy if not exists biometric_credentials_delete_policy
on public.biometric_credentials for delete
using (owner_id = auth.uid());

-- updated_at 자동 업데이트 트리거
create trigger if not exists update_biometric_credentials_updated_at
before update on public.biometric_credentials
for each row
execute function update_updated_at_column();

