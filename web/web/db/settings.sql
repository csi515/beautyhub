-- Settings 테이블 생성
-- 사용자별 설정을 저장하는 테이블

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 인덱스 생성
create index if not exists idx_settings_owner on public.settings(owner_id);

-- RLS 활성화
alter table public.settings enable row level security;

-- RLS 정책: 사용자는 자신의 설정만 조회/수정 가능
create policy if not exists settings_select_policy
on public.settings for select
using (owner_id = auth.uid());

create policy if not exists settings_insert_policy
on public.settings for insert
with check (owner_id = auth.uid());

create policy if not exists settings_update_policy
on public.settings for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy if not exists settings_delete_policy
on public.settings for delete
using (owner_id = auth.uid());

-- updated_at 자동 업데이트 트리거
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger if not exists update_settings_updated_at
before update on public.settings
for each row
execute function update_updated_at_column();

