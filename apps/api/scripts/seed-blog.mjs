import { seedBlogDevelopmentData } from '../src/blog/seed.js';
import { createCmsIndexes } from '../src/cms/indexes.js';
import { config } from '../src/config/index.js';
import { connectMongoDb, disconnectMongoDb } from '../src/infrastructure/mongodb.js';
import { logger } from '../src/logger.js';

try {
  await connectMongoDb(config.mongodbUri, logger, {
    coreDatabase: config.mongodbCoreDatabase,
    cmsDatabase: config.mongodbCmsDatabase,
  });
  await createCmsIndexes();
  const result = await seedBlogDevelopmentData({ nodeEnvironment: config.nodeEnvironment });
  logger.info(result, 'CMS development content seeded');
} finally {
  await disconnectMongoDb();
}
