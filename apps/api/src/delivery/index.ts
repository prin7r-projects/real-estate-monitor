import { db } from '../db';
import { matches, profiles, users, listings, type Match, type Profile, type User, type Listing } from '../db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';

export interface DeliveryResult {
  success: boolean;
  channel: 'email' | 'telegram';
  error?: string;
  messageId?: string;
}

export interface MatchNotification {
  match: Match;
  profile: Profile;
  listing: Listing;
  user: User;
}

export class DeliveryService {
  private postmarkToken: string;
  private telegramBotToken: string;
  private siteUrl: string;

  constructor(
    postmarkToken: string,
    telegramBotToken: string,
    siteUrl: string = 'https://real-estate-monitor.prin7r.com'
  ) {
    this.postmarkToken = postmarkToken;
    this.telegramBotToken = telegramBotToken;
    this.siteUrl = siteUrl;
  }

  async deliverMatch(matchId: string): Promise<DeliveryResult[]> {
    const results: DeliveryResult[] = [];

    // Get match with profile and user info
    const [matchData] = await db
      .select({
        match: matches,
        profile: profiles,
        user: users,
        listing: listings,
      })
      .from(matches)
      .innerJoin(profiles, eq(matches.profileId, profiles.id))
      .innerJoin(users, eq(profiles.userId, users.id))
      .innerJoin(listings, eq(matches.listingId, listings.id))
      .where(eq(matches.id, matchId));

    if (!matchData) {
      return [{ success: false, channel: 'email', error: 'Match not found' }];
    }

    const notification: MatchNotification = {
      match: matchData.match,
      profile: matchData.profile,
      listing: matchData.listing,
      user: matchData.user,
    };

    // Deliver via email
    if (notification.user.email) {
      const emailResult = await this.deliverEmail(notification);
      results.push(emailResult);
    }

    // Deliver via Telegram
    if (notification.user.tgChatId) {
      const tgResult = await this.deliverTelegram(notification);
      results.push(tgResult);
    }

    return results;
  }

  private async deliverEmail(notification: MatchNotification): Promise<DeliveryResult> {
    try {
      console.log(`[SKYLINE_DELIVER] Sending email to ${notification.user.email} for match ${notification.match.id}`);

      // Format price
      const price = this.formatPrice(notification.listing.priceCents);
      const score = Math.round(notification.match.score * 100);

      // Build email content
      const subject = `🏠 Skyline Watch Alert: ${notification.listing.addressNorm} - ${price}`;
      
      const htmlBody = this.buildEmailHtml(notification, price, score);
      const textBody = this.buildEmailText(notification, price, score);

      // Send via Postmark
      const response = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': this.postmarkToken,
        },
        body: JSON.stringify({
          From: 'alerts@real-estate-monitor.prin7r.com',
          To: notification.user.email,
          Subject: subject,
          HtmlBody: htmlBody,
          TextBody: textBody,
          MessageStream: 'outbound',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Postmark error: ${response.status} - ${error}`);
      }

      const result = await response.json();

      // Update delivered timestamp
      await db
        .update(matches)
        .set({ deliveredEmailAt: new Date() })
        .where(eq(matches.id, notification.match.id));

      console.log(`[SKYLINE_DELIVER] Email sent to ${notification.user.email}, MessageID: ${result.MessageID}`);

      return { 
        success: true, 
        channel: 'email',
        messageId: result.MessageID,
      };
    } catch (err) {
      console.error(`[SKYLINE_DELIVER] Email delivery failed:`, err);
      return { success: false, channel: 'email', error: String(err) };
    }
  }

  private buildEmailHtml(notification: MatchNotification, price: string, score: number): string {
    const matchUrl = `${this.siteUrl}/app/matches/${notification.match.id}`;
    const listingUrl = notification.listing.sourceKey.startsWith('idealista') 
      ? `https://idealista.com/listing/${notification.listing.fingerprint}`
      : `${this.siteUrl}/app/listings/${notification.listing.id}`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skyline Watch Alert</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #171417; background-color: #F9F8F6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #0C1754; color: white; padding: 20px; text-align: center; }
    .content { background-color: white; padding: 30px; border-radius: 8px; margin-top: 20px; }
    .score { font-size: 48px; font-weight: bold; color: #2545FF; }
    .details { margin-top: 20px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ECEAE5; }
    .cta { display: inline-block; background-color: #2545FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 100px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #4B5050; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏠 Skyline Watch Alert</h1>
      <p>New match for ${notification.profile.name}</p>
    </div>
    
    <div class="content">
      <div style="text-align: center;">
        <div class="score">${score}</div>
        <p>Match Score</p>
      </div>
      
      <div class="details">
        <div class="detail-row">
          <strong>Address</strong>
          <span>${notification.listing.addressNorm}</span>
        </div>
        <div class="detail-row">
          <strong>Price</strong>
          <span>${price}</span>
        </div>
        ${notification.listing.sqm ? `
        <div class="detail-row">
          <strong>Size</strong>
          <span>${notification.listing.sqm} m²</span>
        </div>
        ` : ''}
        ${notification.listing.bedrooms ? `
        <div class="detail-row">
          <strong>Bedrooms</strong>
          <span>${notification.listing.bedrooms}</span>
        </div>
        ` : ''}
        <div class="detail-row">
          <strong>Type</strong>
          <span>${notification.listing.side === 'rent' ? '🔑 Rent' : '🏷️ Sale'}</span>
        </div>
        <div class="detail-row">
          <strong>City</strong>
          <span>${notification.listing.city}</span>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${matchUrl}" class="cta">View Match Details</a>
      </div>
    </div>
    
    <div class="footer">
      <p>This alert was sent by Skyline Watch</p>
      <p><a href="${this.siteUrl}/app/profiles/${notification.profile.id}">Manage Profile</a> | <a href="${this.siteUrl}/app/profiles/${notification.profile.id}">Pause Alerts</a></p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private buildEmailText(notification: MatchNotification, price: string, score: number): string {
    const matchUrl = `${this.siteUrl}/app/matches/${notification.match.id}`;
    
    return `
🏠 SKYLINE WATCH ALERT

New match for ${notification.profile.name}

Score: ${score}/100

Details:
- Address: ${notification.listing.addressNorm}
- Price: ${price}
${notification.listing.sqm ? `- Size: ${notification.listing.sqm} m²` : ''}
${notification.listing.bedrooms ? `- Bedrooms: ${notification.listing.bedrooms}` : ''}
- Type: ${notification.listing.side === 'rent' ? 'Rent' : 'Sale'}
- City: ${notification.listing.city}

View match details: ${matchUrl}

Manage profile: ${this.siteUrl}/app/profiles/${notification.profile.id}

---
This alert was sent by Skyline Watch
    `.trim();
  }

  private async deliverTelegram(notification: MatchNotification): Promise<DeliveryResult> {
    try {
      console.log(`[SKYLINE_DELIVER] Sending Telegram to ${notification.user.tgChatId} for match ${notification.match.id}`);

      // Format price
      const price = this.formatPrice(notification.listing.priceCents);
      const score = Math.round(notification.match.score * 100);

      // Build message
      const message = this.buildTelegramMessage(notification, price, score);

      // Send via Telegram Bot API
      const response = await fetch(`https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: notification.user.tgChatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Telegram error: ${response.status} - ${error}`);
      }

      const result = await response.json();

      if (!result.ok) {
        throw new Error(`Telegram API error: ${result.description}`);
      }

      // Update delivered timestamp
      await db
        .update(matches)
        .set({ deliveredTgAt: new Date() })
        .where(eq(matches.id, notification.match.id));

      console.log(`[SKYLINE_DELIVER] Telegram sent to ${notification.user.tgChatId}, MessageID: ${result.result.message_id}`);

      return { 
        success: true, 
        channel: 'telegram',
        messageId: result.result.message_id.toString(),
      };
    } catch (err) {
      console.error(`[SKYLINE_DELIVER] Telegram delivery failed:`, err);
      return { success: false, channel: 'telegram', error: String(err) };
    }
  }

  private buildTelegramMessage(notification: MatchNotification, price: string, score: number): string {
    const matchUrl = `${this.siteUrl}/app/matches/${notification.match.id}`;
    
    return `
🏠 <b>SKYLINE WATCH ALERT</b>

<b>New match for ${notification.profile.name}</b>

<b>Score:</b> ${score}/100

<b>Details:</b>
📍 <b>Address:</b> ${notification.listing.addressNorm}
💰 <b>Price:</b> ${price}
${notification.listing.sqm ? `📐 <b>Size:</b> ${notification.listing.sqm} m²\n` : ''}${notification.listing.bedrooms ? `🛏️ <b>Bedrooms:</b> ${notification.listing.bedrooms}\n` : ''}${notification.listing.side === 'rent' ? '🔑' : '🏷️'} <b>Type:</b> ${notification.listing.side === 'rent' ? 'Rent' : 'Sale'}
🌆 <b>City:</b> ${notification.listing.city}

<a href="${matchUrl}">View Match Details</a>
    `.trim();
  }

  async processMatchQueue(): Promise<{ processed: number; successful: number; failed: number }> {
    console.log('[SKYLINE_DELIVER] Processing match queue...');

    const stats = { processed: 0, successful: 0, failed: 0 };

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
      stats.processed++;
      
      const results = await this.deliverMatch(match.id);
      
      const anySuccess = results.some(r => r.success);
      if (anySuccess) {
        stats.successful++;
      } else {
        stats.failed++;
      }
    }

    console.log(`[SKYLINE_DELIVER] Queue processing complete: ${stats.successful} successful, ${stats.failed} failed`);
    return stats;
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
