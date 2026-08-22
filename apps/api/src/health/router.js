import { Router } from 'express';

import { pingMongoDb } from '../infrastructure/mongodb.js';

export function createHealthRouter(redis, pingMongo = pingMongoDb) {
  const router = Router();

  router.get('/', async (_request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    const [mongodb, redisResult] = await Promise.allSettled([pingMongo(), redis.ping()]);
    const healthy = mongodb.status === 'fulfilled' && redisResult.status === 'fulfilled';

    response.status(healthy ? 200 : 503).json({
      data: {
        status: healthy ? 'ok' : 'degraded',
        dependencies: {
          mongodb: mongodb.status === 'fulfilled' ? 'up' : 'down',
          redis: redisResult.status === 'fulfilled' ? 'up' : 'down',
        },
      },
    });
  });

  return router;
}
