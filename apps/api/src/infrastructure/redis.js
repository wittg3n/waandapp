import { createClient } from 'redis';

export async function connectRedis(url, logger) {
  const client = createClient({
    url,
    socket: {
      connectTimeout: 5_000,
    },
  });

  client.on('error', (error) => {
    logger.error({ err: error }, 'Redis connection error');
  });

  await client.connect();
  logger.info('Redis connected');

  return client;
}

export async function disconnectRedis(client) {
  if (client?.isOpen) {
    await client.close();
  }
}
