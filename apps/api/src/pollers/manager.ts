import { BasePoller } from './base';
import { createLisbonPoller, createMadridPoller } from './idealista';
import { createBerlinPoller } from './immobilienscout';
import { db } from '../db';
import { sources } from '../db/schema';
import { eq } from 'drizzle-orm';

export class PollerManager {
  private pollers: Map<string, BasePoller> = new Map();
  private isRunning: boolean = false;

  constructor() {
    this.initializePollers();
  }

  private initializePollers(): void {
    // Get API keys from environment
    const idealistaApiKey = process.env.IDEALISTA_API_KEY;

    // Create pollers for Phase 2 cities
    if (idealistaApiKey) {
      // Lisbon - Idealista
      const lisbonPoller = createLisbonPoller(idealistaApiKey);
      this.pollers.set('idealista-lisbon', lisbonPoller);

      // Madrid - Idealista
      const madridPoller = createMadridPoller(idealistaApiKey);
      this.pollers.set('idealista-madrid', madridPoller);
    } else {
      console.warn('[SKYLINE_INGEST] IDEALISTA_API_KEY not set, skipping Idealista pollers');
    }

    // Berlin - ImmoScout24 (no API key required for public listings)
    const berlinPoller = createBerlinPoller();
    this.pollers.set('immobilienscout24-berlin', berlinPoller);

    console.log(`[SKYLINE_INGEST] Initialized ${this.pollers.size} pollers`);
  }

  async startAll(): Promise<void> {
    if (this.isRunning) {
      console.warn('[SKYLINE_INGEST] Poller manager is already running');
      return;
    }

    console.log('[SKYLINE_INGEST] Starting all pollers...');
    this.isRunning = true;

    // Update source status in database
    for (const [key, poller] of this.pollers) {
      try {
        await db
          .update(sources)
          .set({ status: 'healthy', lastSuccessAt: new Date() })
          .where(eq(sources.key, key));

        // Start the poller
        poller.start();
      } catch (error) {
        console.error(`[SKYLINE_INGEST] Failed to start poller ${key}:`, error);
        
        await db
          .update(sources)
          .set({ status: 'degraded' })
          .where(eq(sources.key, key));
      }
    }

    console.log('[SKYLINE_INGEST] All pollers started');
  }

  async stopAll(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('[SKYLINE_INGEST] Stopping all pollers...');
    this.isRunning = false;

    for (const [key, poller] of this.pollers) {
      try {
        poller.stop();
        
        await db
          .update(sources)
          .set({ status: 'down' })
          .where(eq(sources.key, key));
      } catch (error) {
        console.error(`[SKYLINE_INGEST] Failed to stop poller ${key}:`, error);
      }
    }

    console.log('[SKYLINE_INGEST] All pollers stopped');
  }

  async startPoller(key: string): Promise<boolean> {
    const poller = this.pollers.get(key);
    if (!poller) {
      console.error(`[SKYLINE_INGEST] Poller not found: ${key}`);
      return false;
    }

    try {
      poller.start();
      
      await db
        .update(sources)
        .set({ status: 'healthy' })
        .where(eq(sources.key, key));

      return true;
    } catch (error) {
      console.error(`[SKYLINE_INGEST] Failed to start poller ${key}:`, error);
      
      await db
        .update(sources)
        .set({ status: 'degraded' })
        .where(eq(sources.key, key));

      return false;
    }
  }

  async stopPoller(key: string): Promise<boolean> {
    const poller = this.pollers.get(key);
    if (!poller) {
      console.error(`[SKYLINE_INGEST] Poller not found: ${key}`);
      return false;
    }

    try {
      poller.stop();
      
      await db
        .update(sources)
        .set({ status: 'down' })
        .where(eq(sources.key, key));

      return true;
    } catch (error) {
      console.error(`[SKYLINE_INGEST] Failed to stop poller ${key}:`, error);
      return false;
    }
  }

  async restartPoller(key: string): Promise<boolean> {
    const poller = this.pollers.get(key);
    if (!poller) {
      console.error(`[SKYLINE_INGEST] Poller not found: ${key}`);
      return false;
    }

    try {
      poller.stop();
      poller.start();
      
      await db
        .update(sources)
        .set({ status: 'healthy', lastSuccessAt: new Date() })
        .where(eq(sources.key, key));

      return true;
    } catch (error) {
      console.error(`[SKYLINE_INGEST] Failed to restart poller ${key}:`, error);
      
      await db
        .update(sources)
        .set({ status: 'degraded' })
        .where(eq(sources.key, key));

      return false;
    }
  }

  getPollerStatus(): Map<string, { isRunning: boolean; config: unknown }> {
    const status = new Map();
    
    for (const [key, poller] of this.pollers) {
      status.set(key, {
        isRunning: poller['isRunning'] || false,
        config: poller['config'],
      });
    }

    return status;
  }

  getPoller(key: string): BasePoller | undefined {
    return this.pollers.get(key);
  }
}
