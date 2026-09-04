import { AuditLog } from './models/audit-log.js';

export async function recordAdminAudit({
  request,
  actorUserId = request?.adminAuth?.user?._id ?? null,
  actorType = actorUserId ? 'USER' : 'SYSTEM',
  action,
  resourceType,
  resourceId = null,
  before = null,
  after = null,
  reason = null,
}) {
  return AuditLog.create({
    actorUserId,
    actorType,
    action,
    resourceType,
    resourceId: resourceId == null ? null : String(resourceId),
    before,
    after,
    reason,
    requestId: request?.id ?? null,
    ip: request?.ip ?? null,
    userAgent: request?.get?.('user-agent') ?? null,
  });
}
