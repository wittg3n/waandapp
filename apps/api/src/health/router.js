import { Router } from 'express';

import { pingCmsMongoDb, pingCoreMongoDb } from '../infrastructure/mongodb.js';

export function createHealthRouter(
  redis,
  pingCore = pingCoreMongoDb,
  pingCms = pingCmsMongoDb,
) {
  const router = Router();

  router.get('/', async (_request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    const [core, cms, redisResult] = await Promise.allSettled([
      pingCore(),
      pingCms(),
      redis.ping(),
    ]);
    const healthy =
      core.status === 'fulfilled' &&
      cms.status === 'fulfilled' &&
      redisResult.status === 'fulfilled';

    response.status(healthy ? 200 : 503).json({
      data: {
        status: healthy ? 'ok' : 'degraded',
        dependencies: {
          coreMongoDb: core.status === 'fulfilled' ? 'up' : 'down',
          cmsMongoDb: cms.status === 'fulfilled' ? 'up' : 'down',
          redis: redisResult.status === 'fulfilled' ? 'up' : 'down',
        },
      },
    });
  });

  return router;
}
