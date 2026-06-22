-- Roles enum
create type public.app_role as enum ('admin', 'user');

-- user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamp with time zone not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- has_role security definer
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Users can read their own roles
create policy "Users can read their own roles"
on public.user_roles for select
to authenticated
using (auth.uid() = user_id);

-- Admins can read all roles
create policy "Admins can read all roles"
on public.user_roles for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Admins can read all chat conversations
create policy "Admins can read all conversations"
on public.chat_conversations for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Admins can read all chat messages
create policy "Admins can read all messages"
on public.chat_messages for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));
