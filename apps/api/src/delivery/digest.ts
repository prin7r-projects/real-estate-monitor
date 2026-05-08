import { db } from '../db';
import { matches, profiles, users, listings, type Match, type Profile, type User, type Listing } from '../db/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { DeliveryService } from './delivery';

export interface DailyDigestStats {
  totalMatches: number;
  topMatches: Array<{
    match: Match;
    listing: Listing;
    score: number;
  }>;
  anomalies: Array<{
    listing: Listing;
    type: string;
    description: string;
  }>;
}

export class DailyDigestService {
  private deliveryService: DeliveryService;

  constructor(deliveryService: DeliveryService) {
    this.deliveryService = deliveryService;
  }

  async generateDigestForProfile(profileId: string): Promise<DailyDigestStats> {
    console.log(`[SKYLINE_DIGEST] Generating digest for profile ${profileId}`);

    // Get profile
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, profileId));

    if (!profile) {
      throw new Error('Profile not found');
    }

    // Get matches from last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentMatches = await db
      .select({
        match: matches,
        listing: listings,
      })
      .from(matches)
      .innerJoin(listings, eq(matches.listingId, listings.id))
      .where(
        and(
          eq(matches.profileId, profileId),
          gte(matches.matchedAt, twentyFourHoursAgo)
        )
      )
      .orderBy(desc(matches.score))
      .limit(10);

    // Get anomalies
    const anomalies = await this.detectAnomalies(profile);

    const stats: DailyDigestStats = {
      totalMatches: recentMatches.length,
      topMatches: recentMatches.map(m => ({
        match: m.match,
        listing: m.listing,
        score: m.match.score,
      })),
      anomalies,
    };

    console.log(`[SKYLINE_DIGEST] Profile ${profileId}: ${stats.totalMatches} matches, ${stats.anomalies.length} anomalies`);

    return stats;
  }

  async sendDailyDigest(profileId: string): Promise<boolean> {
    try {
      const stats = await this.generateDigestForProfile(profileId);

      if (stats.totalMatches === 0 && stats.anomalies.length === 0) {
        console.log(`[SKYLINE_DIGEST] No matches or anomalies for profile ${profileId}, skipping`);
        return true;
      }

      // Get profile and user
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, profileId));

      if (!profile) {
        throw new Error('Profile not found');
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, profile.userId));

      if (!user) {
        throw new Error('User not found');
      }

      // Send digest via email
      if (user.email) {
        await this.sendDigestEmail(user, profile, stats);
      }

      // Send digest via Telegram
      if (user.tgChatId) {
        await this.sendDigestTelegram(user, profile, stats);
      }

      return true;
    } catch (err) {
      console.error(`[SKYLINE_DIGEST] Failed to send digest for profile ${profileId}:`, err);
      return false;
    }
  }

  async sendAllDailyDigests(): Promise<{ sent: number; failed: number }> {
    console.log('[SKYLINE_DIGEST] Sending all daily digests...');

    const stats = { sent: 0, failed: 0 };

    // Get all active profiles
    const activeProfiles = await db
      .select()
      .from(profiles)
      .where(eq(profiles.status, 'active'));

    console.log(`[SKYLINE_DIGEST] Found ${activeProfiles.length} active profiles`);

    for (const profile of activeProfiles) {
      // Check if it's 09:00 in the user's timezone
      const user = await db
        .select({ tz: users.tz })
        .from(users)
        .where(eq(users.id, profile.userId))
        .limit(1);

      const timezone = user[0]?.tz || 'UTC';
      const now = new Date();
      const userTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
      const hour = userTime.getHours();

      // Only send at 09:00 local time
      if (hour !== 9) {
        continue;
      }

      const success = await this.sendDailyDigest(profile.id);
      
      if (success) {
        stats.sent++;
      } else {
        stats.failed++;
      }
    }

    console.log(`[SKYLINE_DIGEST] Digest complete: ${stats.sent} sent, ${stats.failed} failed`);
    return stats;
  }

  private async detectAnomalies(profile: Profile): Promise<Array<{ listing: Listing; type: string; description: string }>> {
    const anomalies: Array<{ listing: Listing; type: string; description: string }> = [];

    // Get listings from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Anomaly 1: Relisted 3+ times in 30 days
    const relisted = await db
      .select({
        fingerprint: listings.fingerprint,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(listings)
      .where(
        and(
          eq(listings.city, profile.city),
          gte(listings.publishedAt, thirtyDaysAgo)
        )
      )
      .groupBy(listings.fingerprint)
      .having(sql`count(*) >= 3`);

    for (const item of relisted) {
      const [listing] = await db
        .select()
        .from(listings)
        .where(eq(listings.fingerprint, item.fingerprint))
        .limit(1);

      if (listing) {
        anomalies.push({
          listing,
          type: 'relisted',
          description: `Relisted ${item.count} times in the last 30 days`,
        });
      }
    }

    // Anomaly 2: Descending prices
    const descending = await db
      .select({
        fingerprint: listings.fingerprint,
        prices: sql<string>`array_agg(${listings.priceCents} order by ${listings.publishedAt})`.as('prices'),
      })
      .from(listings)
      .where(
        and(
          eq(listings.city, profile.city),
          gte(listings.publishedAt, thirtyDaysAgo)
        )
      )
      .groupBy(listings.fingerprint)
      .having(sql`count(*) >= 2`);

    for (const item of descending) {
      const prices = item.prices.split(',').map(Number);
      let isDescending = true;
      
      for (let i = 1; i < prices.length; i++) {
        if (prices[i] >= prices[i - 1]) {
          isDescending = false;
          break;
        }
      }

      if (isDescending && prices.length >= 2) {
        const [listing] = await db
          .select()
          .from(listings)
          .where(eq(listings.fingerprint, item.fingerprint))
          .limit(1);

        if (listing) {
          const totalDrop = ((prices[0] - prices[prices.length - 1]) / prices[0]) * 100;
          anomalies.push({
            listing,
            type: 'price_drop',
            description: `Price dropped ${totalDrop.toFixed(1)}% over ${prices.length} listings`,
          });
        }
      }
    }

    return anomalies.slice(0, 10); // Limit to 10 anomalies
  }

  private async sendDigestEmail(user: User, profile: Profile, stats: DailyDigestStats): Promise<void> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://real-estate-monitor.prin7r.com';
    const profileUrl = `${siteUrl}/app/profiles/${profile.id}`;

    const subject = `📊 Skyline Watch Daily Digest: ${stats.totalMatches} matches for ${profile.name}`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skyline Watch Daily Digest</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #171417; background-color: #F9F8F6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #0C1754; color: white; padding: 20px; text-align: center; }
    .content { background-color: white; padding: 30px; border-radius: 8px; margin-top: 20px; }
    .stat { font-size: 48px; font-weight: bold; color: #2545FF; }
    .match { border-bottom: 1px solid #ECEAE5; padding: 15px 0; }
    .anomaly { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 10px; margin: 10px 0; }
    .cta { display: inline-block; background-color: #2545FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 100px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Daily Digest</h1>
      <p>${profile.name} • ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="content">
      <div style="text-align: center;">
        <div class="stat">${stats.totalMatches}</div>
        <p>New matches in the last 24 hours</p>
      </div>
      
      ${stats.topMatches.length > 0 ? `
      <h3>Top Matches</h3>
      ${stats.topMatches.map(m => `
        <div class="match">
          <strong>${m.listing.addressNorm}</strong><br>
          <span style="color: #2545FF;">Score: ${Math.round(m.score * 100)}</span> • 
          <span>${this.formatPrice(m.listing.priceCents)}</span>
          ${m.listing.sqm ? ` • ${m.listing.sqm} m²` : ''}
        </div>
      `).join('')}
      ` : ''}
      
      ${stats.anomalies.length > 0 ? `
      <h3>🚨 Anomalies Detected</h3>
      ${stats.anomalies.map(a => `
        <div class="anomaly">
          <strong>${a.listing.addressNorm}</strong><br>
          <span>${a.description}</span>
        </div>
      `).join('')}
      ` : ''}
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${profileUrl}" class="cta">View All Matches</a>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Send via Postmark
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': process.env.POSTMARK_SERVER_TOKEN || '',
      },
      body: JSON.stringify({
        From: 'digest@real-estate-monitor.prin7r.com',
        To: user.email,
        Subject: subject,
        HtmlBody: htmlBody,
        MessageStream: 'outbound',
      }),
    });

    if (!response.ok) {
      throw new Error(`Postmark error: ${response.status}`);
    }
  }

  private async sendDigestTelegram(user: User, profile: Profile, stats: DailyDigestStats): Promise<void> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://real-estate-monitor.prin7r.com';
    const profileUrl = `${siteUrl}/app/profiles/${profile.id}`;

    const message = `
📊 <b>DAILY DIGEST</b>
${profile.name} • ${new Date().toLocaleDateString()}

<b>${stats.totalMatches}</b> new matches in the last 24 hours

${stats.topMatches.length > 0 ? `
<b>Top Matches:</b>
${stats.topMatches.slice(0, 5).map(m => `
• ${m.listing.addressNorm} — Score: ${Math.round(m.score * 100)} — ${this.formatPrice(m.listing.priceCents)}
`).join('')}
` : ''}

${stats.anomalies.length > 0 ? `
🚨 <b>Anomalies:</b>
${stats.anomalies.slice(0, 3).map(a => `
• ${a.listing.addressNorm} — ${a.description}
`).join('')}
` : ''}

<a href="${profileUrl}">View All Matches</a>
    `.trim();

    // Send via Telegram
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: user.tgChatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram error: ${response.status}`);
    }
  }

  private formatPrice(cents: number): string {
    const euros = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(euros);
  }
}
