create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  promo_email_opt_in boolean not null default false,
  promo_email_opt_in_at timestamptz,
  created_at timestamptz not null default now()
);

alter table if exists users
  add column if not exists full_name text,
  add column if not exists promo_email_opt_in boolean not null default false,
  add column if not exists promo_email_opt_in_at timestamptz;

create table if not exists life_areas (
  id int primary key,
  name text not null unique
);

create table if not exists questions (
  id int primary key,
  life_area_id int not null references life_areas(id) on delete cascade,
  text text not null,
  order_index int not null
);

do $$
begin
  if to_regtype('public.assessment_status') is null then
    create type assessment_status as enum ('in_progress', 'completed');
  end if;
end
$$;

create table if not exists assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  status assessment_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  overall_score float,
  area_scores jsonb not null default '{}'::jsonb
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references assessment_sessions(id) on delete cascade,
  question_id int not null references questions(id) on delete cascade,
  score int not null check (score between 1 and 5),
  unique (session_id, question_id)
);

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  description text not null default '',
  life_area_id int not null references life_areas(id),
  frequency text not null check (frequency in ('daily', 'weekly')),
  created_at timestamptz not null default now()
);

create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  date date not null,
  completed boolean not null default false,
  unique (habit_id, date)
);

insert into life_areas (id, name) values
  (1, 'Health'),
  (2, 'Appearance'),
  (3, 'Love'),
  (4, 'Family'),
  (5, 'Friends'),
  (6, 'Career'),
  (7, 'Money'),
  (8, 'Self-Growth'),
  (9, 'Spirituality'),
  (10, 'Recreation'),
  (11, 'Environment'),
  (12, 'Community')
on conflict (id) do update set name = excluded.name;
