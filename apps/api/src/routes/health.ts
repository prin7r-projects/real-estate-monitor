import { Hono } from 'hono';

export const healthRouter = new Hono();

healthRouter.get('/healthz', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

healthRouter.get('/readyz', (c) => {
  // TODO: Check database and Redis connections
  return c.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});
