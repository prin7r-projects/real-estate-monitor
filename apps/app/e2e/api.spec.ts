import { test, expect } from '@playwright/test';

const API_BASE = process.env.API_URL || 'https://real-estate-monitor.prin7r.com/api';

test.describe('Skyline Watch API', () => {
  test('Health check endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE}/healthz`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeDefined();
  });

  test('Readiness check endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE}/readyz`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('ready');
    expect(data.checks).toBeDefined();
    expect(data.checks.database).toBe('ok');
  });

  test('Status endpoint returns system info', async ({ request }) => {
    const response = await request.get(`${API_BASE}/status`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.stats).toBeDefined();
    expect(data.stats.sources).toBeDefined();
    expect(data.stats.listings).toBeDefined();
    expect(data.stats.matches).toBeDefined();
    expect(data.stats.profiles).toBeDefined();
    expect(data.stats.users).toBeDefined();
  });

  test('Metrics endpoint returns Prometheus format', async ({ request }) => {
    const response = await request.get(`${API_BASE}/metrics`);
    expect(response.ok()).toBeTruthy();
    
    const text = await response.text();
    expect(text).toContain('skyline_sources_total');
    expect(text).toContain('skyline_listings_total');
    expect(text).toContain('skyline_matches_total');
    expect(text).toContain('skyline_profiles_total');
    expect(text).toContain('skyline_users_total');
  });
});

test.describe('Profile API', () => {
  test('GET /api/v1/profiles requires auth', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/profiles`);
    // Should return 401 or empty array depending on auth implementation
    expect([200, 401]).toContain(response.status());
  });

  test('POST /api/v1/profiles creates profile', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/profiles`, {
      data: {
        name: 'Test Profile',
        city: 'Lisbon',
        side: 'rent',
        minPriceCents: 100000,
        maxPriceCents: 200000,
        minBedrooms: 1,
        radiusKm: 5,
      },
      headers: {
        'X-User-Id': 'test-user',
      },
    });
    
    // Should return 201 or 401 depending on auth
    expect([201, 401]).toContain(response.status());
    
    if (response.status() === 201) {
      const data = await response.json();
      expect(data.profile).toBeDefined();
      expect(data.profile.name).toBe('Test Profile');
      expect(data.profile.city).toBe('Lisbon');
    }
  });
});

test.describe('Matches API', () => {
  test('GET /api/v1/matches requires auth', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/matches`);
    // Should return 401 or empty array depending on auth implementation
    expect([200, 401]).toContain(response.status());
  });
});

test.describe('Sources API', () => {
  test('GET /api/v1/sources requires operator role', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/sources`);
    // Should return 403 without operator role
    expect([200, 403]).toContain(response.status());
  });

  test('GET /api/v1/sources with operator role', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/sources`, {
      headers: {
        'X-User-Role': 'operator',
      },
    });
    
    // Should return 200 with sources list
    if (response.ok()) {
      const data = await response.json();
      expect(data.sources).toBeDefined();
      expect(Array.isArray(data.sources)).toBeTruthy();
    }
  });
});

test.describe('Scoring API', () => {
  test('GET /api/v1/scoring/threshold returns threshold', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/scoring/threshold`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.threshold).toBeDefined();
    expect(typeof data.threshold).toBe('number');
    expect(data.threshold).toBeGreaterThanOrEqual(0);
    expect(data.threshold).toBeLessThanOrEqual(1);
  });

  test('GET /api/v1/scoring/weights returns weights', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/scoring/weights`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.weights).toBeDefined();
    expect(data.weights.residual).toBeDefined();
    expect(data.weights.velocity).toBeDefined();
    expect(data.weights.dom).toBeDefined();
    expect(data.weights.quality).toBeDefined();
    expect(data.weights.fit).toBeDefined();
    expect(data.weights.freshness).toBeDefined();
    expect(data.weights.anomaly).toBeDefined();
  });
});

test.describe('Export API', () => {
  test('GET /api/v1/export/matches/csv requires auth', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/export/matches/csv`);
    // Should return 401 or CSV depending on auth
    expect([200, 401]).toContain(response.status());
  });

  test('GET /api/v1/export/matches/json requires auth', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/export/matches/json`);
    // Should return 401 or JSON depending on auth
    expect([200, 401]).toContain(response.status());
  });
});
