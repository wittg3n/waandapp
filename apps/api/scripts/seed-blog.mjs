import { createBlogIndexes } from '../src/blog/indexes.js';
import { seedBlogDevelopmentData } from '../src/blog/seed.js';
import { config } from '../src/config/index.js';
import { connectMongoDb, disconnectMongoDb } from '../src/infrastructure/mongodb.js';
import { logger } from '../src/logger.js';

try {
  if (config.nodeEnvironment !== 'development') {
    throw new Error('Refusing to seed blog data outside development.');
  }

  await connectMongoDb(config.mongodbUri, logger);
  await createBlogIndexes();
  const result = await seedBlogDevelopmentData({ nodeEnvironment: config.nodeEnvironment });
  logger.info(result, 'Development blog data is ready');
} finally {
  await disconnectMongoDb();
}
