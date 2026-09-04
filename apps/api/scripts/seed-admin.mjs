import { randomBytes } from 'node:crypto';

import { createAdminIndexes } from '../src/admin/indexes.js';
import { seedDevelopmentSuperAdmin } from '../src/admin/seed.js';
import { createAuthIndexes } from '../src/auth/indexes.js';
import { config } from '../src/config/index.js';
import { connectMongoDb, disconnectMongoDb } from '../src/infrastructure/mongodb.js';
import { logger } from '../src/logger.js';

try {
  if (config.nodeEnvironment !== 'development') {
    throw new Error(
      'The development Super Admin seed is only available when NODE_ENV=development.',
    );
  }

  await connectMongoDb(config.mongodbUri, logger, {
    coreDatabase: config.mongodbCoreDatabase,
    cmsDatabase: config.mongodbCmsDatabase,
  });
  await createAuthIndexes();
  await createAdminIndexes();

  const password = randomBytes(24).toString('base64url');
  const result = await seedDevelopmentSuperAdmin({ settings: config, password });
  const outcome = result.created ? 'created' : 'reseeded';

  console.log(
    [
      `Development Super Admin ${outcome}.`,
      `Email: ${result.user.email}`,
      `Username: ${result.user.username}`,
      `Password: ${password}`,
      'The password is shown once. Rerunning this seed rotates it and revokes existing sessions.',
    ].join('\n'),
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Development admin seed failed.');
  process.exitCode = 1;
} finally {
  await disconnectMongoDb();
}
