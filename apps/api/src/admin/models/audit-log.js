import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorUserId: { type: mongoose.Schema.Types.ObjectId, default: null, index: false },
    actorType: { type: String, enum: ['USER', 'SYSTEM'], required: true },
    action: { type: String, required: true, trim: true, maxlength: 120 },
    resourceType: { type: String, required: true, trim: true, maxlength: 80 },
    resourceId: { type: String, default: null, trim: true, maxlength: 180 },
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },
    reason: { type: String, default: null, trim: true, maxlength: 500 },
    requestId: { type: String, default: null, trim: true, maxlength: 100 },
    ip: { type: String, default: null, trim: true, maxlength: 80 },
    userAgent: { type: String, default: null, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, strict: 'throw', versionKey: false },
);

auditLogSchema.index({ createdAt: -1, _id: -1 }, { name: 'admin_audit_timeline' });
auditLogSchema.index(
  { resourceType: 1, resourceId: 1, createdAt: -1 },
  { name: 'admin_audit_resource' },
);
auditLogSchema.index(
  { actorUserId: 1, createdAt: -1 },
  { name: 'admin_audit_actor', sparse: true },
);

export const AuditLog =
  mongoose.models.AdminAuditLog ?? mongoose.model('AdminAuditLog', auditLogSchema);
