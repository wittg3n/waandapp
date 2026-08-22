import mongoose from 'mongoose';

import { AUTH_INDEX_DEFINITIONS } from '../index-names.js';

const legalAcceptanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    document: { type: String, enum: ['terms_and_privacy'], required: true },
    version: { type: String, required: true, maxlength: 64 },
    acceptedAt: { type: Date, required: true },
    sourceIpHash: { type: String, required: true, maxlength: 64 },
  },
  { timestamps: false, strict: 'throw', versionKey: false },
);

for (const { key, options } of AUTH_INDEX_DEFINITIONS.legal) {
  legalAcceptanceSchema.index(key, options);
}

export const LegalAcceptance =
  mongoose.models.LegalAcceptance ?? mongoose.model('LegalAcceptance', legalAcceptanceSchema);
