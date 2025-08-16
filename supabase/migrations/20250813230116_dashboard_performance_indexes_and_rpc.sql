-- Dashboard performance indexes and RPC
-- Creates helpful indexes and an aggregate function for total article views

-- Indexes
create index if not exists idx_articles_status on public.articles(status);
create index if not exists idx_profiles_created_at on public.profiles(created_at);
create index if not exists idx_newsletter_subscribers_status_created_at on public.newsletter_subscribers(status, created_at);

-- Aggregate RPC for total article views
create or replace function public.total_article_views()
returns bigint
language sql
stable
as $$
  select coalesce(sum(view_count), 0)::bigint from public.articles;
$$;
