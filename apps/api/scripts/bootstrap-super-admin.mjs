import { recordAdminAudit } from '../src/admin/audit.js';
import { User } from '../src/auth/models/user.js';
import { normalizeEmail } from '../src/auth/normalization.js';
import { config } from '../src/config/index.js';
import { connectMongoDb, disconnectMongoDb } from '../src/infrastructure/mongodb.js';
import { logger } from '../src/logger.js';

const emailFlag = process.argv.indexOf('--email');
const email = emailFlag >= 0 ? process.argv[emailFlag + 1] : null;

if (!email) {
  console.error('Usage: pnpm admin:bootstrap -- --email admin@example.com');
  process.exitCode = 1;
} else {
  try {
    await connectMongoDb(config.mongodbUri, logger, {
      coreDatabase: config.mongodbCoreDatabase,
      cmsDatabase: config.mongodbCmsDatabase,
    });
    const user = await User.findOne({ emailNormalized: normalizeEmail(email) }).select(
      '+sessionVersion +emailNormalized',
    );
    if (!user) throw new Error('The requested account does not exist.');
    if (user.status !== 'active' || !user.emailVerifiedAt || !user.phoneVerifiedAt) {
      throw new Error('The account must be active with verified email and phone identities.');
    }

    if (!user.adminRoles.includes('SUPER_ADMIN')) {
      const before = { adminRoles: [...user.adminRoles] };
      user.adminRoles = [...new Set([...user.adminRoles, 'SUPER_ADMIN'])];
      user.sessionVersion += 1;
      await user.save();
      await recordAdminAudit({
        actorType: 'SYSTEM',
        actorUserId: null,
        action: 'SUPER_ADMIN_BOOTSTRAPPED',
        resourceType: 'USER',
        resourceId: user._id,
        before,
        after: { adminRoles: [...user.adminRoles] },
        reason: 'Explicit bootstrap command',
      });
    }

    console.log('Super administrator ready for account ' + user.email);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await disconnectMongoDb();
  }
}
