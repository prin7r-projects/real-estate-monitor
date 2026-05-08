import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { matches, profiles, users } from '../db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { DeliveryService } from '../delivery';

export const deliveryRouter = new Hono();

// Initialize delivery service
const deliveryService = new DeliveryService(
  process.env.POSTMARK_SERVER_TOKEN || '',
  process.env.TELEGRAM_BOT_TOKEN || '',
  process.env.NEXT_PUBLIC_SITE_URL || 'https://real-estate-monitor.prin7r.com'
);

// POST /api/v1/delivery/process-queue - Process match delivery queue (operator only)
deliveryRouter.post('/delivery/process-queue', async (c) => {
  const isOperator = c.req.header('X-User-Role') === 'operator';
  
  if (!isOperator) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  try {
    const stats = await deliveryService.processMatchQueue();
    return c.json({ stats });
  } catch (err) {
    console.error('[SKYLINE_DELIVER] Queue processing error:', err);
    return c.json({ error: 'Failed to process queue' }, 500);
  }
});

// POST /api/v1/delivery/retry/:matchId - Retry delivery for a specific match (operator only)
deliveryRouter.post('/delivery/retry/:matchId', async (c) => {
  const isOperator = c.req.header('X-User-Role') === 'operator';
  
  if (!isOperator) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const matchId = c.req.param('matchId');

  try {
    const results = await deliveryService.deliverMatch(matchId);
    
    const anySuccess = results.some(r => r.success);
    
    return c.json({
      matchId,
      results,
      success: anySuccess,
    });
  } catch (err) {
    console.error(`[SKYLINE_DELIVER] Retry error for match ${matchId}:`, err);
    return c.json({ error: 'Failed to retry delivery' }, 500);
  }
});

// GET /api/v1/delivery/stats - Get delivery statistics (operator only)
deliveryRouter.get('/delivery/stats', async (c) => {
  const isOperator = c.req.header('X-User-Role') === 'operator';
  
  if (!isOperator) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  // Get counts
  const [totalMatches] = await db
    .select({ count: matches.id })
    .from(matches);

  const [deliveredEmail] = await db
    .select({ count: matches.id })
    .from(matches)
    .where(isNull(matches.deliveredEmailAt));

  const [deliveredTg] = await db
    .select({ count: matches.id })
    .from(matches)
    .where(isNull(matches.deliveredTgAt));

  const [pending] = await db
    .select({ count: matches.id })
    .from(matches)
    .where(
      and(
        isNull(matches.deliveredEmailAt),
        isNull(matches.deliveredTgAt)
      )
    );

  return c.json({
    stats: {
      total: totalMatches?.count || 0,
      deliveredEmail: deliveredEmail?.count || 0,
      deliveredTelegram: deliveredTg?.count || 0,
      pending: pending?.count || 0,
    },
  });
});

// POST /api/v1/delivery/telegram/pair - Pair Telegram chat with user
deliveryRouter.post('/delivery/telegram/pair', async (c) => {
  // TODO: Get user from session/auth
  const userId = c.req.header('X-User-Id') || 'anonymous';

  const body = await c.req.json();
  
  const schema = z.object({
    chatId: z.string(),
    code: z.string().length(6),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.errors }, 400);
  }

  const { chatId, code } = parsed.data;

  // TODO: Verify pairing code
  // For now, just update the user's tgChatId
  try {
    await db
      .update(users)
      .set({ tgChatId: chatId })
      .where(eq(users.id, userId));

    return c.json({ 
      success: true,
      message: 'Telegram chat paired successfully',
    });
  } catch (err) {
    console.error('[SKYLINE_DELIVER] Telegram pairing error:', err);
    return c.json({ error: 'Failed to pair Telegram' }, 500);
  }
});

// POST /api/v1/delivery/telegram/unpair - Unpair Telegram chat
deliveryRouter.post('/delivery/telegram/unpair', async (c) => {
  // TODO: Get user from session/auth
  const userId = c.req.header('X-User-Id') || 'anonymous';

  try {
    await db
      .update(users)
      .set({ tgChatId: null })
      .where(eq(users.id, userId));

    return c.json({ 
      success: true,
      message: 'Telegram chat unpaired successfully',
    });
  } catch (err) {
    console.error('[SKYLINE_DELIVER] Telegram unpairing error:', err);
    return c.json({ error: 'Failed to unpair Telegram' }, 500);
  }
});
