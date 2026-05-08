# Skyline Watch API

Ingestion + scoring engine for Skyline Watch. Built with Bun + Hono.

## Architecture

```
apps/api/
├── src/
│   ├── db/              # Database schema and connection
│   ├── pollers/         # Source pollers (Idealista, ImmoScout24, etc.)
│   ├── normalizer/      # Listing normalization
│   ├── deduper/         # Deduplication logic
│   ├── scoring/         # 7-signal scoring engine
│   ├── delivery/        # Email + Telegram delivery
│   └── routes/          # API routes
├── drizzle/             # Database migrations
└── package.json
```

## Quickstart

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL and API keys

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

## API Endpoints

### Health
- `GET /api/healthz` - Health check
- `GET /api/readyz` - Readiness check

### Profiles
- `GET /api/v1/profiles` - List user's profiles
- `POST /api/v1/profiles` - Create new profile
- `GET /api/v1/profiles/:id` - Get profile details
- `PATCH /api/v1/profiles/:id` - Update profile
- `POST /api/v1/profiles/:id/pause` - Pause profile
- `POST /api/v1/profiles/:id/resume` - Resume profile

### Matches
- `GET /api/v1/matches` - Get user's matches
- `GET /api/v1/matches/:id` - Get match details

### Sources (Operator only)
- `GET /api/v1/sources` - List all sources
- `POST /api/v1/sources/:id/restart` - Restart source

## Database

Uses PostgreSQL with PostGIS for geographic queries.

```bash
# Generate migrations
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema changes
pnpm db:push

# Open database studio
pnpm db:studio
```

## Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Deployment

```bash
# Build
pnpm build

# Start production server
pnpm start
```
