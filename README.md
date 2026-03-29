# Raw to Ready — Data Engineering Blog

Персональный технический блог о Data Engineering. Next.js 14 + Tailwind CSS + Prisma + Neon PostgreSQL + Vercel.

---

## Быстрый старт

### 1. Установи зависимости

```bash
npm install
```

### 2. Настрой Neon PostgreSQL

1. Зайди на [neon.tech](https://neon.tech) → Sign Up (бесплатно)
2. Создай новый проект (например, `raw-to-ready`)
3. В dashboard нажми **"Connection string"** → скопируй строку подключения
4. Она выглядит так:
   ```
   postgresql://user:password@ep-xxx-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

### 3. Создай .env.local

```bash
cp .env.local.example .env.local
```

Вставь свои значения:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"
ADMIN_PASSWORD="твой-надёжный-пароль"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Raw to Ready"
```

### 4. Инициализируй базу данных

```bash
# Применить схему к Neon
npm run db:push

# Сгенерировать Prisma client
npm run db:generate

# Загрузить начальные данные (топики + тестовый пост)
npm run db:seed
```

### 5. Запусти локально

```bash
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000) 🎉

---

## Структура проекта

```
raw-to-ready/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Главная /
│   ├── not-found.tsx           # 404
│   ├── sitemap.ts              # /sitemap.xml
│   ├── robots.ts               # /robots.txt
│   ├── globals.css
│   ├── blog/
│   │   ├── page.tsx            # Список статей /blog
│   │   └── [slug]/page.tsx     # Статья /blog/[slug]
│   ├── admin/
│   │   ├── page.tsx            # Список постов (защищён)
│   │   ├── AdminPostActions.tsx
│   │   ├── login/page.tsx      # Форма логина
│   │   └── editor/
│   │       ├── page.tsx        # Новый пост
│   │       └── [id]/page.tsx   # Редактирование
│   └── api/
│       ├── posts/route.ts      # GET (list), POST (create)
│       ├── posts/[id]/route.ts # GET, PUT, DELETE
│       ├── topics/route.ts     # GET, POST
│       ├── rss/route.ts        # RSS feed
│       └── auth/route.ts       # Login/logout
├── components/
│   ├── Header.tsx
│   ├── PostCard.tsx
│   ├── TopicBadge.tsx
│   ├── SearchBar.tsx
│   ├── TopicFilter.tsx
│   ├── MarkdownRenderer.tsx
│   ├── TableOfContents.tsx
│   └── PostEditor.tsx          # Markdown редактор (админка)
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── auth.ts                 # Пароль + cookie сессия
│   ├── reading-time.ts         # Расчёт времени чтения
│   ├── slugify.ts              # Транслитерация + slug
│   └── rss.ts                  # Генерация RSS XML
├── middleware.ts               # Защита /admin и write API
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── .env.local                  # Твои секреты (не коммитить!)
```

---

## Деплой на Vercel

### 1. Загрузи код на GitHub

```bash
git init
git add .
git commit -m "initial commit"
gh repo create raw-to-ready --public --push
# или создай repo вручную на github.com и запушь
```

### 2. Задеплой на Vercel

1. Зайди на [vercel.com](https://vercel.com) → Sign Up (через GitHub)
2. **"Add New Project"** → выбери репозиторий `raw-to-ready`
3. В разделе **"Environment Variables"** добавь:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Connection string из Neon |
   | `ADMIN_PASSWORD` | Твой пароль |
   | `NEXT_PUBLIC_SITE_URL` | `https://твой-домен.vercel.app` |
   | `NEXT_PUBLIC_SITE_NAME` | `Raw to Ready` |

4. Нажми **"Deploy"**
5. После деплоя зайди в Vercel Functions или локально и запусти seed:
   ```bash
   DATABASE_URL="твоя-строка" npm run db:seed
   ```

### 3. Обнови NEXT_PUBLIC_SITE_URL

После деплоя Vercel даст тебе URL вида `raw-to-ready-xxx.vercel.app`. Обнови переменную в Vercel Settings → Environment Variables.

---

## Использование

### Публикация статей

1. Зайди на `/admin/login`
2. Введи `ADMIN_PASSWORD`
3. Нажми **"New post"**
4. Пиши в Markdown с live-preview
5. **"Save draft"** — сохраняет черновик (не видно читателям)
6. **"Publish"** — публикует статью

### Markdown возможности

```markdown
# H1 заголовок
## H2 заголовок

**жирный** и *курсив*

`inline code`

```python
# Код с подсветкой
def hello():
    return "world"
```

| Колонка 1 | Колонка 2 |
|-----------|-----------|
| Данные    | Данные    |

> Цитата

[Ссылка](https://example.com)
```

### API

Все публичные endpoint'ы доступны без авторизации:

```bash
# Список постов
GET /api/posts

# Поиск
GET /api/posts?search=airflow

# Фильтр по топику
GET /api/posts?topic=dbt

# Пагинация
GET /api/posts?page=2&limit=10

# Один пост
GET /api/posts/medallion-architecture

# Топики
GET /api/topics

# RSS
GET /api/rss
```

---

## Разработка

```bash
# Запуск dev-сервера
npm run dev

# Prisma Studio (GUI для БД)
npm run db:studio

# Применить изменения схемы
npm run db:push

# Создать миграцию
npm run db:migrate
```

---

## Переменные окружения

| Variable | Описание | Пример |
|----------|----------|--------|
| `DATABASE_URL` | Neon connection string | `postgresql://...` |
| `ADMIN_PASSWORD` | Пароль для `/admin` | `my-secret-pass` |
| `NEXT_PUBLIC_SITE_URL` | URL сайта | `https://rawtoready.com` |
| `NEXT_PUBLIC_SITE_NAME` | Название сайта | `Raw to Ready` |

---

## Технический стек

- **Framework:** Next.js 14 (App Router, SSR/SSG/ISR)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + @tailwindcss/typography
- **Database:** Neon (Serverless PostgreSQL)
- **ORM:** Prisma
- **Markdown:** react-markdown + remark-gfm
- **Editor:** @uiw/react-md-editor
- **Deploy:** Vercel

---

## Фаза 2 (будущее)

- [ ] Тёмная тема
- [ ] Table of Contents sidebar
- [ ] Двуязычность RU/EN
- [ ] Email-подписка
- [ ] Аналитика (Plausible)
- [ ] Кнопки "Поделиться"
