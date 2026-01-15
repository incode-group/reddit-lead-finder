# Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and running
- OpenAI API key (for AI filtering)
- Reddit API credentials (optional, for higher rate limits)

## Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

Or use the convenience script:
```bash
npm run install:all
```

## Step 2: Database Setup

The project is configured to use Supabase PostgreSQL. The connection string is already set in the `.env` file.

1. Generate Prisma Client:
```bash
cd backend
npm run prisma:generate
```

2. Якщо база даних порожня, push schema:
```bash
npm run prisma:push
```

**Якщо виникає помилка "syntax error at or near RENAME":**
Це означає, що в базі вже є старі таблиці. Виконайте один з варіантів:

**Варіант A: Скинути базу (для development, якщо дані не важливі):**
```bash
npm run prisma:migrate:reset
```

**Варіант B: Видалити таблиці вручну через Supabase SQL Editor:**
```sql
DROP TABLE IF EXISTS "leads" CASCADE;
DROP TABLE IF EXISTS "comments" CASCADE;
DROP TABLE IF EXISTS "posts" CASCADE;
DROP TABLE IF EXISTS "subreddits" CASCADE;
```
Потім виконайте `npm run prisma:push`

**Примітка:** Якщо `prisma db push` зависає, переконайтеся що:
- У `.env` файлі є обидві змінні: `DATABASE_URL` (pooler) та `DIRECT_URL` (direct)
- `DIRECT_URL` використовує порт **5432** (не 6543)
- Перевірте підключення до Supabase в панелі проекту

Or run migrations:
```bash
npm run prisma:migrate
```

The app will automatically connect to Supabase when you start it.

## Step 3: Environment Variables

### Backend (.env)

Create `backend/.env` file:

```env
# Connection Pooler (для додатку - порт 6543)
DATABASE_URL=postgresql://postgres.awbykdnmhcnvfgqbntoa:RVG4wzYpLFDPfy*@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct Connection (для міграцій - порт 5432)
DIRECT_URL=postgresql://postgres.awbykdnmhcnvfgqbntoa:RVG4wzYpLFDPfy*@aws-1-eu-west-1.pooler.supabase.com:5432/postgres

OPENAI_API_KEY=sk-your-openai-api-key-here
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Важливо:**
- `DATABASE_URL` використовує connection pooler (порт 6543) з параметром `pgbouncer=true` для роботи додатку
- `DIRECT_URL` використовує пряме підключення (порт 5432) для міграцій Prisma
- Для міграцій (`prisma migrate` або `prisma db push`) використовується `DIRECT_URL`
- Для роботи додатку використовується `DATABASE_URL` (pooler)

**Note:**
- `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` are optional. Without them, the app will use Reddit's public API (with rate limits).
- To get Reddit API credentials: https://www.reddit.com/prefs/apps
- To get OpenAI API key: https://platform.openai.com/api-keys

### Frontend (.env.local)

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Step 4: Run the Application

### Option 1: Run both together
```bash
npm run dev
```

### Option 2: Run separately

Terminal 1 (Backend):
```bash
cd backend
npm run start:dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

## Step 5: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Usage

1. Open the frontend in your browser
2. Select up to 5 subreddits (e.g., webdev, forhire, startups)
3. Set posts limit (default: 25)
4. Click "Parse & Analyze"
5. Wait for the analysis to complete
6. View statistics and leads

## Database Schema

The application automatically creates the following tables:
- `subreddits` - Subreddit information
- `posts` - Reddit posts
- `comments` - Reddit comments
- `leads` - Identified leads with AI analysis

## Troubleshooting

### Database Connection Issues
- Make sure PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format: `postgresql://user:password@host:port/database`

### Reddit API Rate Limits
- Without Reddit credentials, you're limited to ~60 requests per minute
- Get Reddit API credentials to increase limits

### OpenAI API Errors
- Check your API key is valid
- Ensure you have credits in your OpenAI account
- The app will fall back to keyword matching if OpenAI fails

## Development Notes

- Database schema is auto-created in development mode (`synchronize: true`)
- In production, use migrations instead
- The app fetches comments from the last 7 days by default
- AI analysis uses GPT-3.5-turbo for cost efficiency
