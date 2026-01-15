# Architecture Overview

## Project Structure

```
reddit-lead-finder/
├── frontend/          # Next.js 14 application
│   ├── app/          # App router pages
│   └── package.json
├── backend/          # Nest.js application
│   ├── src/
│   │   ├── ai/       # AI filtering service
│   │   ├── database/ # Database entities and module
│   │   ├── lead/     # Lead management module
│   │   └── reddit/   # Reddit API integration
│   └── package.json
└── package.json      # Root workspace config
```

## Backend Architecture (Nest.js)

### Modules

1. **AppModule** - Root module
2. **DatabaseModule** - TypeORM configuration and entity exports
3. **RedditModule** - Reddit API integration
4. **AiModule** - OpenAI integration for lead detection
5. **LeadModule** - Lead management and statistics

### Key Services

#### RedditService
- Fetches posts from subreddits
- Fetches comments from posts (last 7 days)
- Handles OAuth authentication (optional)
- Falls back to public API if no credentials
- Saves data to database

#### AiService
- Analyzes posts/comments using OpenAI GPT-3.5-turbo
- Determines if content is a lead request vs. general advice
- Provides confidence scores and reasoning
- Falls back to keyword matching if OpenAI unavailable

#### LeadService
- Orchestrates parsing and analysis workflow
- Generates statistics per subreddit
- Manages lead records

### Database Schema

#### Subreddit
- Stores subreddit information
- One-to-many relationship with Posts

#### Post
- Reddit post data (title, content, author, etc.)
- Flags: `isLead`, `leadScore`
- Many-to-one with Subreddit
- One-to-many with Comments and Leads

#### Comment
- Reddit comment data
- Flags: `isLead`, `leadScore`
- Many-to-one with Post
- One-to-many with Leads

#### Lead
- Records of identified leads
- Links to either Post or Comment
- Stores AI confidence and reasoning

### API Endpoints

#### Reddit
- `GET /reddit/subreddits` - Get suggested subreddits
- `POST /reddit/parse` - Parse subreddits (fetch posts/comments)

#### Leads
- `POST /leads/parse-and-analyze` - Parse and analyze in one call
- `GET /leads` - Get all leads
- `GET /leads/statistics` - Get statistics per subreddit

## Frontend Architecture (Next.js)

### Pages
- `app/page.tsx` - Main application page with:
  - Subreddit selection (max 5)
  - Suggested subreddits
  - Parse & Analyze button
  - Statistics display
  - Leads list

### Features
- Real-time subreddit selection
- Loading states
- Error handling
- Responsive design
- Statistics visualization
- Lead cards with confidence scores

## Data Flow

1. **User selects subreddits** → Frontend
2. **Frontend calls** → `POST /leads/parse-and-analyze`
3. **Backend parses** → RedditService fetches posts/comments
4. **Backend saves** → Posts and comments to database
5. **Backend analyzes** → AiService processes content
6. **Backend marks leads** → Updates isLead flags, creates Lead records
7. **Backend calculates stats** → Per subreddit statistics
8. **Backend returns** → Statistics and leads
9. **Frontend displays** → Results to user

## Technology Stack

### Backend
- **Nest.js** - Progressive Node.js framework
- **TypeORM** - ORM for PostgreSQL
- **PostgreSQL** - Database
- **OpenAI API** - AI-powered lead detection
- **Axios** - HTTP client for Reddit API

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Axios** - API client

## Configuration

### Environment Variables

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key (required)
- `REDDIT_CLIENT_ID` - Reddit OAuth client ID (optional)
- `REDDIT_CLIENT_SECRET` - Reddit OAuth secret (optional)
- `PORT` - Backend server port (default: 3001)

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend API URL

## MVP Features

✅ Select up to 5 subreddits
✅ Parse posts and comments (last 7 days)
✅ AI-powered lead detection
✅ Statistics per subreddit (coefficients)
✅ Lead list with confidence scores
✅ One-time parsing (no periodic polling)
✅ Fallback keyword matching if AI unavailable

## Future Enhancements

- Periodic polling/background jobs
- Message brokers for scalability
- Keyword pre-filtering before AI
- Subreddit search/recommendations
- Export leads to CSV/Google Sheets
- User authentication
- Saved searches
- Email notifications for new leads
