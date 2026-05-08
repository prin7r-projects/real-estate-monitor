import { pgTable, uuid, text, integer, float, timestamp, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique(),
  tgChatId: text('tg_chat_id').unique(),
  tz: text('tz').default('UTC'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('users_email_idx').on(table.email),
]);

// Profiles table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  city: text('city').notNull(),
  side: text('side').notNull().default('rent'), // rent | sale | both
  minPriceCents: integer('min_price_cents').default(0),
  maxPriceCents: integer('max_price_cents').default(0),
  minBedrooms: integer('min_bedrooms').default(1),
  radiusKm: float('radius_km').default(5.0),
  extras: jsonb('extras').default({}),
  status: text('status').notNull().default('active'), // active | paused | stopped
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('profiles_user_id_idx').on(table.userId),
  index('profiles_city_status_idx').on(table.city, table.status),
]);

// Listings table with PostGIS geography column
export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceKey: text('source_key').notNull(),
  city: text('city').notNull(),
  side: text('side').notNull(), // rent | sale
  priceCents: integer('price_cents').notNull(),
  sqm: integer('sqm'),
  bedrooms: integer('bedrooms'),
  addressNorm: text('address_norm').notNull(),
  // PostGIS geography point - stored as raw SQL
  location: text('location'), // Will be cast to geography(Point, 4326) in migrations
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow(),
  fingerprint: text('fingerprint').unique().notNull(),
}, (table) => [
  uniqueIndex('listings_fingerprint_idx').on(table.fingerprint),
  index('listings_city_published_idx').on(table.city, table.publishedAt),
]);

// Matches table
export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id),
  listingId: uuid('listing_id').notNull().references(() => listings.id),
  score: float('score').notNull(),
  signals: jsonb('signals').default({}), // {residual, velocity, dom, quality, fit, freshness, anomaly}
  matchedAt: timestamp('matched_at', { withTimezone: true }).defaultNow(),
  deliveredEmailAt: timestamp('delivered_email_at', { withTimezone: true }),
  deliveredTgAt: timestamp('delivered_tg_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('matches_profile_listing_idx').on(table.profileId, table.listingId),
  index('matches_profile_matched_idx').on(table.profileId, table.matchedAt),
]);

// Sources table
export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').unique().notNull(),
  cityCoverage: text('city_coverage').notNull(),
  pollIntervalS: integer('poll_interval_s').default(60),
  status: text('status').notNull().default('healthy'), // healthy | degraded | down
  lastSuccessAt: timestamp('last_success_at', { withTimezone: true }),
}, (table) => [
  index('sources_status_idx').on(table.status),
]);

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  tier: text('tier').notNull().default('watch'), // watch | deep_watch
  status: text('status').notNull().default('active'), // active | cancelled | expired
  endsAt: timestamp('ends_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('subscriptions_user_status_idx').on(table.userId, table.status),
]);

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
