import { seedRoles } from '../src/authorization/roles.js';
import { User } from '../src/auth/models/user.js';
import { createAuthIndexes, verifyAuthIndexes } from '../src/auth/indexes.js';
import { config } from '../src/config/index.js';
import { connectMongoDb, disconnectMongoDb } from '../src/infrastructure/mongodb.js';
import { logger } from '../src/logger.js';

try {
  await connectMongoDb(config.mongodbUri, logger, {
    coreDatabase: config.mongodbCoreDatabase,
    cmsDatabase: config.mongodbCmsDatabase,
  });
  await createAuthIndexes();
  await seedRoles();
  let migrated = 0;
  for await (const user of User.collection.find({
    $or: [{ permissionsVersion: { $exists: false } }, { permissionsVersion: 0 }],
  })) {
    const adminRoles = user.adminRoles?.length
      ? user.adminRoles
      : ({ admin: ['ADMIN'], staff: ['SUPPORT'] }[user.role] ?? []);
    const result = await User.collection.updateOne(
      {
        _id: user._id,
        $or: [{ permissionsVersion: { $exists: false } }, { permissionsVersion: 0 }],
      },
      { $set: { adminRoles, permissionsVersion: 1 }, $inc: { sessionVersion: 1 } },
    );
    migrated += result.modifiedCount;
  }
  await verifyAuthIndexes();
  console.log(`Authorization migration complete: ${migrated} users preserved and versioned.`);
} finally {
  await disconnectMongoDb();
}
