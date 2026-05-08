-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  tg_chat_id TEXT UNIQUE,
  tz TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  side TEXT NOT NULL DEFAULT 'rent',
  min_price_cents INTEGER DEFAULT 0,
  max_price_cents INTEGER DEFAULT 0,
  min_bedrooms INTEGER DEFAULT 1,
  radius_km REAL DEFAULT 5.0,
  extras JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_city_status_idx ON profiles(city, status);

-- Listings table with PostGIS geography column
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key TEXT NOT NULL,
  city TEXT NOT NULL,
  side TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  sqm INTEGER,
  bedrooms INTEGER,
  address_norm TEXT NOT NULL,
  location GEOGRAPHY(Point, 4326),
  published_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  fingerprint TEXT UNIQUE NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS listings_fingerprint_idx ON listings(fingerprint);
CREATE INDEX IF NOT EXISTS listings_city_published_idx ON listings(city, published_at);
CREATE INDEX IF NOT EXISTS listings_location_idx ON listings USING GIST(location);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  listing_id UUID NOT NULL REFERENCES listings(id),
  score REAL NOT NULL,
  signals JSONB DEFAULT '{}',
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_email_at TIMESTAMPTZ,
  delivered_tg_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, listing_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS matches_profile_listing_idx ON matches(profile_id, listing_id);
CREATE INDEX IF NOT EXISTS matches_profile_matched_idx ON matches(profile_id, matched_at);

-- Sources table
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  city_coverage TEXT NOT NULL,
  poll_interval_s INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'healthy',
  last_success_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS sources_status_idx ON sources(status);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  tier TEXT NOT NULL DEFAULT 'watch',
  status TEXT NOT NULL DEFAULT 'active',
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_status_idx ON subscriptions(user_id, status);

-- Insert initial sources for Phase 2
INSERT INTO sources (key, city_coverage, poll_interval_s, status) VALUES
  ('idealista-lisbon', 'Lisbon', 60, 'healthy'),
  ('idealista-madrid', 'Madrid', 60, 'healthy'),
  ('immobilienscout24-berlin', 'Berlin', 60, 'healthy')
ON CONFLICT (key) DO NOTHING;
