-- ============================================================
--  ClearJob — Supabase Schema
--  הרץ את הקובץ הזה ב-Supabase SQL Editor
-- ============================================================

-- ---- Profiles (extends auth.users) ----
create table if not exists public.profiles (
  id         uuid references auth.users on delete cascade not null primary key,
  role       text not null check (role in ('candidate', 'employer', 'admin')),
  full_name  text,
  phone      text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---- Employers ----
create table if not exists public.employers (
  id                   uuid default gen_random_uuid() primary key,
  user_id              uuid references public.profiles(id) on delete cascade,
  company_name         text not null,
  industry             text,
  size                 text,
  website              text,
  description          text,
  logo_url             text,
  is_confidential      boolean default false,
  confidentiality_level int default 0,
  area                 text,
  reveal_condition     text,
  employer_type        text default 'direct' check (employer_type in ('direct','agency')),
  response_time        int default 7,
  response_rate        int default 0,
  performance_score    int default 0,
  tags                 text[] default '{}',
  is_approved          boolean default false,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ---- Candidates ----
create table if not exists public.candidates (
  id                    uuid default gen_random_uuid() primary key,
  user_id               uuid references public.profiles(id) on delete cascade,
  headline              text,
  location              text,
  experience_years      int default 0,
  cv_url                text,
  skills                text[] default '{}',
  discrete_mode         boolean default false,
  hide_phone            boolean default false,
  hide_employer         boolean default false,
  show_first_name_only  boolean default false,
  blocked_companies     uuid[] default '{}',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ---- Jobs ----
create table if not exists public.jobs (
  id                    uuid default gen_random_uuid() primary key,
  employer_id           uuid references public.employers(id) on delete cascade,
  title                 text not null,
  category              text,
  description           text,
  responsibilities      text[] default '{}',
  must_have_requirements text[] default '{}',
  nice_to_have_requirements text[] default '{}',
  location              text,
  work_model            text check (work_model in ('remote','hybrid','onsite')),
  work_days_office      int default 0,
  employment_type       text default 'fullTime',
  experience_level      text default 'mid',
  salary_min            int,
  salary_max            int,
  salary_type           text default 'monthly',
  salary_flexible       boolean default false,
  salary_notes          text,
  includes_bonus        boolean default false,
  bonus_percent         int default 0,
  includes_car          boolean default false,
  includes_study_fund   boolean default false,
  includes_meals        boolean default false,
  includes_options      boolean default false,
  hiring_process        jsonb default '[]',
  has_home_assignment   boolean default false,
  review_method         jsonb default '{"humanReview":true,"atsReview":false,"aiAssisted":false,"screeningQuestions":false}',
  average_response_days int default 7,
  average_process_days  int default 30,
  confidentiality_level int default 0,
  transparency_score    int default 0,
  applicant_count       int default 0,
  viewed_applicant_count int default 0,
  interview_count       int default 0,
  rejected_count        int default 0,
  pending_count         int default 0,
  status                text default 'draft' check (status in ('draft','active','closed','paused')),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ---- Applications ----
create table if not exists public.applications (
  id                  uuid default gen_random_uuid() primary key,
  job_id              uuid references public.jobs(id) on delete cascade,
  candidate_id        uuid references public.candidates(id) on delete cascade,
  status              text default 'new',
  cv_opened           boolean default false,
  cv_opened_at        timestamptz,
  salary_expectation  int,
  availability        text,
  note                text,
  is_confidential     boolean default false,
  rejection_reason    text,
  rejection_message   text,
  kanban_column       text default 'new',
  internal_notes      text,
  score               int default 0,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique(job_id, candidate_id)
);

-- ---- Application Timeline ----
create table if not exists public.application_timeline (
  id             uuid default gen_random_uuid() primary key,
  application_id uuid references public.applications(id) on delete cascade,
  event_type     text not null,
  title          text not null,
  description    text,
  created_at     timestamptz default now()
);

-- ---- Saved Jobs ----
create table if not exists public.saved_jobs (
  id           uuid default gen_random_uuid() primary key,
  candidate_id uuid references public.candidates(id) on delete cascade,
  job_id       uuid references public.jobs(id) on delete cascade,
  created_at   timestamptz default now(),
  unique(candidate_id, job_id)
);

-- ============================================================
--  Row Level Security (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.employers enable row level security;
alter table public.candidates enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.application_timeline enable row level security;
alter table public.saved_jobs enable row level security;

-- Helper: is current user admin?
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---- Profiles policies ----
create policy "profiles_self_select" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert"      on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_admin_all"   on public.profiles for all using (public.is_admin());

-- ---- Employers policies ----
create policy "employers_public_read" on public.employers for select using (is_approved = true or user_id = auth.uid() or public.is_admin());
create policy "employers_own_crud"    on public.employers for all using (user_id = auth.uid() or public.is_admin());

-- ---- Candidates policies ----
create policy "candidates_own_crud"  on public.candidates for all using (user_id = auth.uid() or public.is_admin());
create policy "candidates_employers_view" on public.candidates for select using (
  exists (
    select 1 from public.applications a
    join public.jobs j on j.id = a.job_id
    join public.employers e on e.id = j.employer_id
    where a.candidate_id = candidates.id and e.user_id = auth.uid()
  ) or public.is_admin()
);

-- ---- Jobs policies ----
create policy "jobs_public_active" on public.jobs for select using (status = 'active' or public.is_admin() or
  employer_id in (select id from public.employers where user_id = auth.uid())
);
create policy "jobs_employer_crud" on public.jobs for all using (
  employer_id in (select id from public.employers where user_id = auth.uid()) or public.is_admin()
);

-- ---- Applications policies ----
create policy "applications_candidate_own" on public.applications for all using (
  candidate_id in (select id from public.candidates where user_id = auth.uid()) or public.is_admin()
);
create policy "applications_employer_view" on public.applications for select using (
  job_id in (
    select id from public.jobs where employer_id in (
      select id from public.employers where user_id = auth.uid()
    )
  ) or public.is_admin()
);
create policy "applications_employer_update" on public.applications for update using (
  job_id in (
    select id from public.jobs where employer_id in (
      select id from public.employers where user_id = auth.uid()
    )
  ) or public.is_admin()
);

-- ---- Timeline policies ----
create policy "timeline_through_application" on public.application_timeline for select using (
  application_id in (
    select id from public.applications where
      candidate_id in (select id from public.candidates where user_id = auth.uid())
      or job_id in (select id from public.jobs where employer_id in (select id from public.employers where user_id = auth.uid()))
  ) or public.is_admin()
);
create policy "timeline_insert" on public.application_timeline for insert with check (public.is_admin() or
  application_id in (
    select id from public.applications where
      candidate_id in (select id from public.candidates where user_id = auth.uid())
  )
);

-- ---- Saved Jobs policies ----
create policy "saved_jobs_own" on public.saved_jobs for all using (
  candidate_id in (select id from public.candidates where user_id = auth.uid()) or public.is_admin()
);

-- ============================================================
--  Triggers — auto-update updated_at
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_profiles_updated_at  before update on public.profiles  for each row execute function public.handle_updated_at();
create trigger trg_employers_updated_at before update on public.employers  for each row execute function public.handle_updated_at();
create trigger trg_candidates_updated_at before update on public.candidates for each row execute function public.handle_updated_at();
create trigger trg_jobs_updated_at      before update on public.jobs       for each row execute function public.handle_updated_at();
create trigger trg_apps_updated_at      before update on public.applications for each row execute function public.handle_updated_at();

-- Trigger: create profile after signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'candidate'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger: increment applicant_count on new application
create or replace function public.handle_new_application()
returns trigger language plpgsql security definer as $$
begin
  update public.jobs set applicant_count = applicant_count + 1, pending_count = pending_count + 1 where id = new.job_id;
  return new;
end;
$$;

create trigger trg_new_application
  after insert on public.applications
  for each row execute function public.handle_new_application();

-- ============================================================
--  Seed: Admin user
--  צור משתמש אדמין ידנית ב-Supabase Auth > Users > New User
--  לאחר יצירתו, הרץ:
-- ============================================================

-- update public.profiles set role = 'admin' where id = '<admin-user-uuid>';
