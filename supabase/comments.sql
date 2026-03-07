-- Таблица комментариев для Cloudea Blog
-- Выполните этот SQL в Supabase Dashboard → SQL Editor

create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  slug text not null,
  content text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null default '',
  user_avatar text not null default '',
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now() not null
);

-- Индексы
create index if not exists comments_slug_idx on public.comments(slug);
create index if not exists comments_parent_id_idx on public.comments(parent_id);
create index if not exists comments_created_at_idx on public.comments(created_at);

-- RLS (Row Level Security)
alter table public.comments enable row level security;

-- Чтение: все могут читать комментарии
create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

-- Создание: только авторизованные пользователи
create policy "Authenticated users can create comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

-- Удаление: только автор может удалить свой комментарий
create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

-- Обновление: только автор может редактировать
create policy "Users can update own comments"
  on public.comments for update
  using (auth.uid() = user_id);
