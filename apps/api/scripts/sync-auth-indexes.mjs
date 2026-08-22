import { createAuthIndexes, verifyAuthIndexes } from '../src/auth/indexes.js';
import { config } from '../src/config/index.js';
import { connectMongoDb, disconnectMongoDb } from '../src/infrastructure/mongodb.js';
import { logger } from '../src/logger.js';

try {
  await connectMongoDb(config.mongodbUri, logger);
  await createAuthIndexes();
  await verifyAuthIndexes();
  logger.info('Authentication and session indexes synchronized');
} finally {
  await disconnectMongoDb();
}
