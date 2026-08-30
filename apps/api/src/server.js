import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createApp } from './app.js';
import { createAuthIndexes, verifyAuthIndexes } from './auth/indexes.js';
import { createBlogIndexes, verifyBlogIndexes } from './blog/indexes.js';
import { config } from './config/index.js';
import { connectMongoDb, disconnectMongoDb } from './infrastructure/mongodb.js';
import { connectRedis, disconnectRedis } from './infrastructure/redis.js';
import { logger } from './logger.js';

const shutdownTimeoutMs = 10_000;

function listen(server) {
  return new Promise((resolve, reject) => {
    const onError = (error) => reject(error);
    server.once('error', onError);
    server.listen(config.port, '0.0.0.0', () => {
      server.off('error', onError);
      resolve();
    });
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

function registerShutdown(server, redis) {
  let shuttingDown = false;

  const shutdown = async (reason, error) => {
    if (shuttingDown) return;
    shuttingDown = true;

    if (error) {
      logger.fatal({ err: error }, reason);
      process.exitCode = 1;
    } else {
      logger.info({ reason }, 'Shutting down');
    }

    const timeout = setTimeout(() => {
      logger.fatal('Graceful shutdown timed out');
      server.closeAllConnections();
      process.exit(1);
    }, shutdownTimeoutMs);
    timeout.unref();

    try {
      await closeServer(server);
      await Promise.all([disconnectRedis(redis), disconnectMongoDb()]);
      logger.info('Shutdown complete');
    } catch (shutdownError) {
      logger.error({ err: shutdownError }, 'Shutdown failed');
      process.exitCode = 1;
    } finally {
      clearTimeout(timeout);
    }
  };

  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('uncaughtException', (error) => void shutdown('Uncaught exception', error));
  process.once('unhandledRejection', (error) => void shutdown('Unhandled rejection', error));
}

export async function start() {
  let redis;

  try {
    await connectMongoDb(config.mongodbUri, logger);
    if (config.nodeEnvironment === 'production') {
      await Promise.all([verifyAuthIndexes(), verifyBlogIndexes()]);
    } else {
      await Promise.all([createAuthIndexes(), createBlogIndexes()]);
    }
    redis = await connectRedis(config.redisUrl, logger);

    const server = createServer(createApp(redis));
    server.requestTimeout = 15_000;
    server.headersTimeout = 10_000;
    server.keepAliveTimeout = 5_000;
    server.maxHeadersCount = 100;

    await listen(server);
    registerShutdown(server, redis);
    logger.info(
      {
        port: config.port,
        nodeEnvironment: config.nodeEnvironment,
        authDeliveryMode: config.authDeliveryMode,
        authEmailWebhookUrl: config.authEmailWebhookUrl,
      },
      'Waandapp API listening',
    );
  } catch (error) {
    await Promise.allSettled([disconnectRedis(redis), disconnectMongoDb()]);
    logger.fatal({ err: error }, 'API failed to start');
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  void start();
}
