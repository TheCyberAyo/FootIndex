-- Site analytics: page views, returning visitors, and 404 tracking (PROJECT_SPEC §105)

create table if not exists public.analytics_visitors (
  visitor_id text primary key,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  visit_count integer not null default 1
);

create table if not exists public.site_page_views (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  visitor_id text not null references public.analytics_visitors (visitor_id) on delete cascade,
  user_id uuid references public.users (id) on delete set null,
  path text not null,
  referrer text,
  is_returning boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists site_page_views_session_created_idx
  on public.site_page_views (session_id, created_at desc);

create index if not exists site_page_views_created_at_idx
  on public.site_page_views (created_at desc);

create index if not exists site_page_views_visitor_idx
  on public.site_page_views (visitor_id, created_at desc);

create table if not exists public.site_not_found_events (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  visitor_id text,
  path text not null,
  referrer text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists site_not_found_events_created_at_idx
  on public.site_not_found_events (created_at desc);

create index if not exists site_not_found_events_path_idx
  on public.site_not_found_events (path);

alter table public.analytics_visitors enable row level security;
alter table public.site_page_views enable row level security;
alter table public.site_not_found_events enable row level security;
