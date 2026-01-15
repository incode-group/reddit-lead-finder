# Виправлення помилки міграції Prisma

## Проблема
Помилка `ERROR: syntax error at or near "RENAME"` виникає, коли Prisma намагається модифікувати існуючі таблиці, створені раніше (наприклад, через TypeORM).

## Рішення 1: Скинути базу даних (для development)

Якщо ви в development режимі і можете видалити дані:

```bash
cd backend
npx prisma migrate reset
```

Це видалить всі таблиці та створить їх заново згідно зі схемою.

## Рішення 2: Видалити таблиці вручну

Підключіться до Supabase SQL Editor і виконайте:

```sql
DROP TABLE IF EXISTS "leads" CASCADE;
DROP TABLE IF EXISTS "comments" CASCADE;
DROP TABLE IF EXISTS "posts" CASCADE;
DROP TABLE IF EXISTS "subreddits" CASCADE;
```

Потім виконайте:
```bash
npx prisma db push
```

## Рішення 3: Створити міграцію вручну

```bash
cd backend
npx prisma migrate dev --name init
```

Якщо це не спрацює, спробуйте спочатку видалити таблиці (Рішення 2).

## Рішення 4: Використати baseline міграцію

Якщо таблиці вже існують і відповідають схемі:

```bash
# Створіть початкову міграцію без застосування
npx prisma migrate dev --create-only --name init

# Потім позначте її як застосовану
npx prisma migrate resolve --applied init
```

## Рекомендація

Для development найпростіше використати **Рішення 1** (`prisma migrate reset`), якщо дані не важливі.
