-- New private-reader tables; leaves local SQLite and any existing tables unchanged.
-- Run in Supabase SQL Editor as the project administrator.
begin;
create table if not exists public.reader_books (
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 id text not null,
 title text not null,
 filename text not null,
 format text not null,
 sha256 text not null,
 object_path text not null,
 text_content text,
 sections jsonb not null default '[]',
 warnings jsonb not null default '[]',
 status text not null default 'ready',
 created_at timestamptz not null default now(),
 primary key(owner_id,id),unique(owner_id,sha256),
 check(split_part(object_path,'/',1)=owner_id::text)
);
create table if not exists public.reader_state (
 owner_id uuid not null default auth.uid(),
 book_id text not null,
 page integer not null default 1 check(page>=1),
 notes jsonb not null default '[]',
 updated_at timestamptz not null default now(),
 primary key(owner_id,book_id),
 foreign key(owner_id,book_id) references public.reader_books(owner_id,id) on delete cascade
);
create table if not exists public.reader_annotations (
 owner_id uuid not null default auth.uid(),
 id uuid not null default gen_random_uuid(),
 book_id text not null,
 page integer not null check(page>=1),
 quote text not null,
 user_input text not null default '',
 response jsonb not null,
 created_at timestamptz not null default now(),
 primary key(owner_id,id),
 foreign key(owner_id,book_id) references public.reader_books(owner_id,id) on delete cascade
);
create table if not exists public.reader_preferences (
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 name text not null,value jsonb not null,
 primary key(owner_id,name)
);
alter table public.reader_books enable row level security;
alter table public.reader_state enable row level security;
alter table public.reader_annotations enable row level security;
alter table public.reader_preferences enable row level security;
revoke all on public.reader_books,public.reader_state,public.reader_annotations,public.reader_preferences from anon;
grant select,insert,update,delete on public.reader_books,public.reader_state,public.reader_annotations,public.reader_preferences to authenticated;
do $$
declare t text;
begin
 foreach t in array array['reader_books','reader_state','reader_annotations','reader_preferences'] loop
  if not exists(select 1 from pg_policies where schemaname='public' and tablename=t and policyname='reader_owner_only') then
   execute format('create policy reader_owner_only on public.%I for all to authenticated using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()))',t);
  end if;
 end loop;
end $$;
insert into storage.buckets(id,name,public,file_size_limit)
 values('reader-originals','reader-originals',false,52428800)
 on conflict(id) do nothing;
-- Fail instead of silently reusing a public bucket.
do $$ begin
 if exists(select 1 from storage.buckets where id='reader-originals' and public=true) then
  raise exception 'reader-originals must be a private bucket';
 end if;
end $$;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='reader_private_objects') then
  create policy reader_private_objects on storage.objects for all to authenticated
   using(bucket_id='reader-originals' and (storage.foldername(name))[1]=(select auth.uid())::text)
   with check(bucket_id='reader-originals' and (storage.foldername(name))[1]=(select auth.uid())::text);
 end if;
end $$;
commit;
