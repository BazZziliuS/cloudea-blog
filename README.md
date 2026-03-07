# Cloudea Blog

Платформа для блогов и документации, вдохновлённая Docusaurus. Построена на Next.js 16, Tailwind CSS v4 и shadcn/ui.

## Возможности

- **Блог** — публикация постов в формате MDX с подсветкой кода (Shiki), тегами и расчётом времени чтения
- **Документация** — многоуровневая структура с боковым меню и оглавлением (TOC)
- **Тёмная тема** — переключение light/dark/system через next-themes
- **Авторизация** — вход через GitHub OAuth (Supabase Auth)
- **MDX** — поддержка GFM, автоссылки на заголовки, подсветка синтаксиса

## Стек

| Технология | Назначение |
|---|---|
| [Next.js 16](https://nextjs.org) | App Router, RSC, Turbopack |
| [Tailwind CSS v4](https://tailwindcss.com) | Стили |
| [shadcn/ui](https://ui.shadcn.com) | UI-компоненты |
| [Supabase](https://supabase.com) | Авторизация (GitHub OAuth) |
| [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) | Рендеринг MDX |
| [Shiki](https://shiki.style) | Подсветка кода |

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env.local
# Заполните NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY

# Запуск dev-сервера
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Настройка GitHub OAuth

1. Создайте проект в [Supabase](https://supabase.com)
2. В Dashboard перейдите в **Authentication > Providers > GitHub**
3. Создайте OAuth App в [GitHub Developer Settings](https://github.com/settings/developers):
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `https://<project>.supabase.co/auth/v1/callback`
4. Скопируйте Client ID и Client Secret в настройки Supabase
5. Добавьте URL и anon key проекта в `.env.local`

## Структура проекта

```
src/
  app/
    page.tsx                    # Лендинг
    layout.tsx                  # Корневой layout
    blog/
      page.tsx                  # Список постов
      [slug]/page.tsx           # Страница поста
    docs/
      page.tsx                  # Обзор документации
      layout.tsx                # Layout с sidebar
      [...slug]/page.tsx        # Страница документа
    auth/
      login/page.tsx            # Страница входа
      signout/route.ts          # Выход
    api/auth/callback/route.ts  # OAuth callback
  components/
    ui/                         # shadcn/ui компоненты
    header.tsx                  # Шапка сайта
    footer.tsx                  # Подвал
    sidebar.tsx                 # Боковое меню docs
    toc.tsx                     # Оглавление
    mdx-components.tsx          # MDX-компоненты
  lib/
    content.ts                  # Загрузка контента
    mdx.ts                      # Компиляция MDX
    utils.ts                    # Утилиты (cn)
    supabase/                   # Supabase клиенты
content/
  blog/                         # MDX-посты блога
  docs/                         # MDX-документация
```

## Добавление контента

### Блог-пост

Создайте файл `content/blog/my-post.mdx`:

```mdx
---
title: "Заголовок поста"
description: "Краткое описание"
date: "2026-03-07"
tags: ["tag1", "tag2"]
---

Содержимое поста в формате MDX...
```

### Документация

Создайте файл `content/docs/<категория>/my-doc.mdx`:

```mdx
---
title: "Заголовок"
description: "Описание"
order: 1
---

Содержимое документа...
```

Категория определяется именем папки. Поле `order` задаёт порядок в sidebar.

## Скрипты

| Команда | Описание |
|---|---|
| `npm run dev` | Запуск dev-сервера (Turbopack) |
| `npm run build` | Production-сборка |
| `npm run start` | Запуск production-сервера |
| `npm run lint` | Линтинг |

## Лицензия

MIT
