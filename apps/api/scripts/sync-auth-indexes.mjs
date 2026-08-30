import { createAuthIndexes, verifyAuthIndexes } from '../src/auth/indexes.js';
import { createBlogIndexes, verifyBlogIndexes } from '../src/blog/indexes.js';
import { config } from '../src/config/index.js';
import { connectMongoDb, disconnectMongoDb } from '../src/infrastructure/mongodb.js';
import { logger } from '../src/logger.js';

try {
  await connectMongoDb(config.mongodbUri, logger);
  await Promise.all([createAuthIndexes(), createBlogIndexes()]);
  await Promise.all([verifyAuthIndexes(), verifyBlogIndexes()]);
  logger.info('Authentication, session, and blog indexes synchronized');
} finally {
  await disconnectMongoDb();
}
