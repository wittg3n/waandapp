import mongoose from 'mongoose';
import { PERMISSION_VALUES, ROLE_PERMISSIONS } from '@waandapp/shared';

const roleSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, match: /^[A-Z][A-Z0-9_]{1,63}$/ },
    name: { type: String, required: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 500 },
    permissions: [{ type: String, enum: PERMISSION_VALUES }],
    system: { type: Boolean, default: false },
    version: { type: Number, default: 1, min: 1 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, strict: 'throw', versionKey: false },
);
roleSchema.index({ key: 1 }, { unique: true, name: 'authorization_role_key' });
export const Role = mongoose.models.Role ?? mongoose.model('Role', roleSchema);

export async function seedRoles() {
  for (const [key, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    await Role.updateOne(
      { key },
      { $setOnInsert: { key, name: key, permissions, system: true, version: 1 } },
      { upsert: true, runValidators: true },
    );
  }
}

export async function verifyRoleSeed() {
  const keys = Object.keys(ROLE_PERMISSIONS);
  const count = await Role.countDocuments({
    key: mongoose.trusted({ $in: keys }),
    system: true,
    deletedAt: null,
  });
  if (count !== keys.length)
    throw new Error('System roles are missing. Run db:migrate:auth before starting the API.');
}
