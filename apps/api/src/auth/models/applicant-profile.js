import mongoose from 'mongoose';

import { AUTH_INDEX_DEFINITIONS } from '../index-names.js';

const languageCertificateSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['ielts', 'toefl', 'delf', 'dalf', 'tcf', 'tef', 'duolingo', 'cambridge'],
      required: true,
    },
    score: Number,
    level: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
    testDate: String,
  },
  { _id: false, strict: 'throw' },
);

const applicantProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currentDegree: {
      type: String,
      enum: ['diploma', 'associate', 'bachelor', 'master', 'professional-doctorate', 'phd'],
      required: true,
    },
    educationCountryCode: { type: String, enum: ['IR'], required: true },
    fieldId: { type: String, required: true, maxlength: 128 },
    universityId: { type: String, required: true, maxlength: 128 },
    studyStatus: { type: String, enum: ['graduated', 'studying'], required: true },
    gradeAverage: { type: Number, required: true, min: 0, max: 100 },
    gradeScale: { type: String, enum: ['20', '4', '100'], required: true },
    targetFieldId: { type: String, required: true, maxlength: 128 },
    targetDegree: {
      type: String,
      enum: ['bachelor', 'master', 'professional-doctorate', 'phd'],
      required: true,
    },
    targetCountries: {
      type: [{ type: String, enum: ['DE', 'FR', 'US', 'CA', 'IT'] }],
      required: true,
    },
    intake: {
      type: new mongoose.Schema(
        {
          term: { type: String, enum: ['spring', 'fall', 'undecided'], required: true },
          year: { type: Number, min: 2_000, max: 2_100, default: null },
        },
        { _id: false, strict: 'throw' },
      ),
      required: true,
    },
    hasLanguageCertificate: { type: Boolean, required: true },
    languageCertificates: { type: [languageCertificateSchema], default: [] },
    annualBudget: {
      type: String,
      enum: ['under-10000', '10000-20000', '20000-30000', 'over-30000', 'undecided'],
      required: true,
    },
    scholarshipImportance: {
      type: String,
      enum: ['essential', 'preferred', 'not-required'],
      required: true,
    },
  },
  { timestamps: true, strict: 'throw', versionKey: false },
);

for (const { key, options } of AUTH_INDEX_DEFINITIONS.profile) {
  applicantProfileSchema.index(key, options);
}

export const ApplicantProfile =
  mongoose.models.ApplicantProfile ?? mongoose.model('ApplicantProfile', applicantProfileSchema);
