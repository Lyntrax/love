-- Run this once in Supabase: SQL Editor > New query > paste > Run
-- Safe to run again (it replaces old policies), e.g. to add the delete rules.

-- 1) Table for photo captions + categories
create table if not exists public.memories (
  id bigint generated always as identity primary key,
  category text not null,
  caption text,
  path text not null,
  created_at timestamptz default now()
);

alter table public.memories enable row level security;

drop policy if exists "anyone can read memories" on public.memories;
create policy "anyone can read memories"
  on public.memories for select using (true);

drop policy if exists "anyone can add memories" on public.memories;
create policy "anyone can add memories"
  on public.memories for insert with check (true);

drop policy if exists "anyone can delete memories" on public.memories;
create policy "anyone can delete memories"
  on public.memories for delete using (true);

-- 2) Public storage bucket named "photos"
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "anyone can upload photos" on storage.objects;
create policy "anyone can upload photos"
  on storage.objects for insert
  with check (bucket_id = 'photos');

drop policy if exists "anyone can delete photos" on storage.objects;
create policy "anyone can delete photos"
  on storage.objects for delete
  using (bucket_id = 'photos');
