-- Optional AI-generated comparison summaries (cached on comparison_cache)

alter table public.comparison_cache
  add column if not exists ai_summary text,
  add column if not exists ai_summary_generated_at timestamptz;
