# Supabase Connection Setup

## Проблема з Connection Pooler

Supabase має два типи підключень:
1. **Connection Pooler** (порт 6543) - для додатків, оптимізований для багатьох одночасних підключень
2. **Direct Connection** (порт 5432) - для міграцій та адміністративних операцій

Prisma міграції (`prisma migrate`, `prisma db push`) **НЕ ПРАЦЮЮТЬ** з connection pooler, тому потрібно використовувати direct connection.

## Як отримати Direct Connection URL

1. Відкрийте ваш Supabase проект
2. Перейдіть в **Settings** → **Database**
3. Знайдіть секцію **Connection string**
4. Виберіть **URI** (не Transaction mode)
5. Скопіюйте URL - він має виглядати так:
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
   ```
   або
   ```
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```

## Налаштування .env

Додайте обидві змінні в `backend/.env`:

```env
# Connection Pooler (для додатку - порт 6543)
# Використовується для роботи додатку
DATABASE_URL=postgresql://postgres.awbykdnmhcnvfgqbntoa:RVG4wzYpLFDPfy*@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct Connection (для міграцій - порт 5432)
# Використовується для prisma migrate та prisma db push
DIRECT_URL=postgresql://postgres.awbykdnmhcnvfgqbntoa:RVG4wzYpLFDPfy*@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

**Важливо:**
- `DIRECT_URL` має використовувати порт **5432** (не 6543)
- Якщо ваш pooler URL не працює з портом 5432, використайте direct connection URL з Supabase панелі
- `DATABASE_URL` має містити параметр `?pgbouncer=true` для коректної роботи з pooler

## Альтернативне рішення

Якщо у вас є тільки pooler URL, спробуйте:

1. Замінити `pooler.supabase.com` на `db.[PROJECT_REF].supabase.co` в DIRECT_URL
2. Або використати той самий hostname, але з портом 5432

Приклад:
```env
DIRECT_URL=postgresql://postgres.awbykdnmhcnvfgqbntoa:RVG4wzYpLFDPfy*@db.awbykdnmhcnvfgqbntoa.supabase.co:5432/postgres
```

## Перевірка підключення

Після налаштування перевірте:

```bash
cd backend
npx prisma db push
```

Якщо все налаштовано правильно, міграція пройде успішно.
