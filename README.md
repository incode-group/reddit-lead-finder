## Tech Stack

- **Frontend**: Next.js
- **Backend**: Nest.js
- **Database**: PostgreSQL

## Features

- Select up to 5 subreddits to analyze
- Parse posts and comments from selected subreddits
- AI-powered filtering to identify service requests vs. general advice
- Display results with statistics (matches/total parsed)

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL
- OpenAI API key (for AI filtering)

### Installation

```bash
npm run install:all
```

### Environment Variables

Create `.env` files in both `frontend/` and `backend/` directories.

**Backend `.env`:**
```
# Connection Pooler (для додатку - порт 6543)
DATABASE_URL=postgresql://postgres.awbykdnmhcnvfgqbntoa:RVG4wzYpLFDPfy*@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct Connection (для міграцій - порт 5432)
DIRECT_URL=postgresql://postgres.awbykdnmhcnvfgqbntoa:RVG4wzYpLFDPfy*@aws-1-eu-west-1.pooler.supabase.com:5432/postgres

OPENAI_API_KEY=your_openai_api_key
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Важливо:** `DIRECT_URL` потрібен для міграцій Prisma. Порт 5432 - це пряме підключення, порт 6543 - connection pooler.

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Database Setup

The project uses Supabase PostgreSQL. The database connection is configured in `backend/.env`. No local database setup is required.

### Running the Application

```bash
# Run both frontend and backend
npm run dev

# Or run separately
npm run dev:backend  # Backend on port 3001
npm run dev:frontend  # Frontend on port 3000
```

## Project Structure

```
reddit-lead-finder/
├── frontend/          # Next.js application
├── backend/           # Nest.js application
└── README.md
```
