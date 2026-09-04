import { AuditLog } from './models/audit-log.js';
import { User } from '../auth/models/user.js';

const required = [
  { model: User, names: ['admin_user_roles_status', 'admin_user_status_created'] },
  {
    model: AuditLog,
    names: ['admin_audit_timeline', 'admin_audit_resource', 'admin_audit_actor'],
  },
];

export async function createAdminIndexes() {
  await Promise.all(required.map(({ model }) => model.createIndexes()));
}

export async function verifyAdminIndexes() {
  const missing = [];
  for (const { model, names } of required) {
    let indexes = [];
    try {
      indexes = await model.collection.listIndexes().toArray();
    } catch (error) {
      if (error?.code !== 26 && error?.codeName !== 'NamespaceNotFound') throw error;
    }
    const existing = new Set(indexes.map(({ name }) => name));
    for (const name of names) {
      if (!existing.has(name)) missing.push(model.collection.collectionName + '.' + name);
    }
  }
  if (missing.length > 0) {
    throw new Error('Required admin indexes are missing: ' + missing.join(', '));
  }
}
