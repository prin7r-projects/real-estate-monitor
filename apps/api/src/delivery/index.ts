import { db } from '../db';
import { matches, profiles, users, type Match, type Profile, type User } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export interface DeliveryResult {
  success: boolean;
  channel: 'email' | 'telegram';
  error?: string;
}

export class DeliveryService {
  private postmarkToken: string;
  private telegramBotToken: string;

  constructor(postmarkToken: string, telegramBotToken: string) {
    this.postmarkToken = postmarkToken;
    this.telegramBotToken = telegramBotToken;
  }

  async deliverMatch(matchId: string): Promise<DeliveryResult[]> {
    const results: DeliveryResult[] = [];

    // Get match with profile and user info
    const [match] = await db
      .select({
        match: matches,
        profile: profiles,
        user: users,
      })
      .from(matches)
      .innerJoin(profiles, eq(matches.profileId, profiles.id))
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(eq(matches.id, matchId));

    if (!match) {
      return [{ success: false, channel: 'email', error: 'Match not found' }];
    }

    // Get listing info
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, match.match.listingId));

    if (!listing) {
      return [{ success: false, channel: 'email', error: 'Listing not found' }];
    }

    // Deliver via email
    if (match.user.email) {
      const emailResult = await this.deliverEmail(match.user, match.profile, listing, match.match);
      results.push(emailResult);
    }

    // Deliver via Telegram
    if (match.user.tgChatId) {
      const tgResult = await this.deliverTelegram(match.user, match.profile, listing, match.match);
      results.push(tgResult);
    }

    return results;
  }

  private async deliverEmail(
    user: User,
    profile: Profile,
    listing: typeof listings.$inferSelect,
    match: Match
  ): Promise<DeliveryResult> {
    try {
      // TODO: Implement actual Postmark email sending
      console.log(`[SKYLINE_DELIVER] Sending email to ${user.email} for match ${match.id}`);

      // Update delivered timestamp
      await db
        .update(matches)
        .set({ deliveredEmailAt: new Date() })
        .where(eq(matches.id, match.id));

      return { success: true, channel: 'email' };
    } catch (err) {
      console.error(`[SKYLINE_DELIVER] Email delivery failed:`, err);
      return { success: false, channel: 'email', error: String(err) };
    }
  }

  private async deliverTelegram(
    user: User,
    profile: Profile,
    listing: typeof listings.$inferSelect,
    match: Match
  ): Promise<DeliveryResult> {
    try {
      // TODO: Implement actual Telegram bot sending
      console.log(`[SKYLINE_DELIVER] Sending Telegram to ${user.tgChatId} for match ${match.id}`);

      // Update delivered timestamp
      await db
        .update(matches)
        .set({ deliveredTgAt: new Date() })
        .where(eq(matches.id, match.id));

      return { success: true, channel: 'telegram' };
    } catch (err) {
      console.error(`[SKYLINE_DELIVER] Telegram delivery failed:`, err);
      return { success: false, channel: 'telegram', error: String(err) };
    }
  }

  async processMatchQueue(): Promise<void> {
    console.log('[SKYLINE_DELIVER] Processing match queue...');

    // Get undelivered matches
    const undelivered = await db
      .select()
      .from(matches)
      .where(
        and(
          isNull(matches.deliveredEmailAt),
          isNull(matches.deliveredTgAt)
        )
      )
      .orderBy(matches.matchedAt)
      .limit(100);

    console.log(`[SKYLINE_DELIVER] Found ${undelivered.length} undelivered matches`);

    for (const match of undelivered) {
      await this.deliverMatch(match.id);
    }
  }
}
