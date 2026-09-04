import { createAdminIndexes, verifyAdminIndexes } from '../src/admin/indexes.js';
import { createAuthIndexes, verifyAuthIndexes } from '../src/auth/indexes.js';
import { createCmsIndexes, verifyCmsIndexes } from '../src/cms/indexes.js';
import { config } from '../src/config/index.js';
import { connectMongoDb, disconnectMongoDb } from '../src/infrastructure/mongodb.js';
import { logger } from '../src/logger.js';

try {
  await connectMongoDb(config.mongodbUri, logger, {
    coreDatabase: config.mongodbCoreDatabase,
    cmsDatabase: config.mongodbCmsDatabase,
  });
  await Promise.all([createAuthIndexes(), createAdminIndexes(), createCmsIndexes()]);
  await Promise.all([verifyAuthIndexes(), verifyAdminIndexes(), verifyCmsIndexes()]);
  logger.info('Authentication, admin, session, and CMS indexes synchronized');
} finally {
  await disconnectMongoDb();
}
