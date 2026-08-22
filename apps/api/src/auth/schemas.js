import { z } from 'zod';

import {
  normalizeCode,
  normalizeEmail,
  normalizePhone,
  normalizeUsername,
} from './normalization.js';
import { isCommonPassword } from './password.js';

const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'api',
  'root',
  'support',
  'system',
  'waand',
]);

const firstName = z.string().trim().min(1).max(80);
const lastName = z.string().trim().min(1).max(120);
const usernameLookup = z
  .string()
  .trim()
  .min(3)
  .max(30)
  .transform(normalizeUsername)
  .pipe(z.string().regex(/^[a-z0-9._-]+$/, 'Username contains unsupported characters.'));
const username = usernameLookup.refine(
  (value) => !RESERVED_USERNAMES.has(value),
  'Username is reserved.',
);
const email = z.string().trim().min(3).max(254).email().transform(normalizeEmail);
const phone = z
  .string()
  .trim()
  .min(8)
  .max(16)
  .transform((value, context) => {
    try {
      return normalizePhone(value);
    } catch {
      context.addIssue({ code: 'custom', message: 'Phone must be a valid E.164 number.' });
      return z.NEVER;
    }
  });
const code = z
  .string()
  .trim()
  .max(12)
  .transform(normalizeCode)
  .pipe(z.string().regex(/^\d{6}$/, 'Code must contain exactly six digits.'));
const password = z
  .string()
  .refine(
    (value) => Array.from(value).length >= 8,
    'Password must contain at least 8 characters.',
  )
  .refine(
    (value) => Array.from(value).length <= 128,
    'Password must contain at most 128 characters.',
  )
  .refine((value) => /\S/u.test(value), 'Password must not contain only whitespace.')
  .refine((value) => !isCommonPassword(value), 'Password is too common.');
const currentPassword = z
  .string()
  .refine((value) => Array.from(value).length >= 1 && Array.from(value).length <= 128);
const passwordConfirmation = z
  .string()
  .refine((value) => Array.from(value).length >= 1 && Array.from(value).length <= 128);
const passwordPair = {
  password,
  passwordConfirmation,
};
const matchingPasswords = (value, context) => {
  if (value.password !== value.passwordConfirmation) {
    context.addIssue({
      code: 'custom',
      path: ['passwordConfirmation'],
      message: 'Password confirmation does not match.',
    });
  }
};

export function createRegisterSchema(termsVersion) {
  return z
    .strictObject({
      firstName,
      lastName,
      username,
      email,
      phone,
      ...passwordPair,
      termsAccepted: z.literal(true),
      termsVersion: z.literal(termsVersion),
    })
    .superRefine(matchingPasswords);
}

const identifier = z
  .string()
  .trim()
  .min(3)
  .max(254)
  .transform((value, context) => {
    if (value.includes('@')) {
      const result = email.safeParse(value);
      if (result.success) return result.data;
    } else {
      const result = usernameLookup.safeParse(value);
      if (result.success) return result.data;
    }
    context.addIssue({ code: 'custom', message: 'Identifier must be a username or email.' });
    return z.NEVER;
  });

export const loginSchema = z.strictObject({ identifier, password: currentPassword });
export const forgotPasswordSchema = z.strictObject({ identifier });
export const codeVerifySchema = z.strictObject({ code });
export const secondStepRequestSchema = z.strictObject({ channel: z.enum(['email', 'sms']) });
export const secondStepVerifySchema = z.strictObject({
  channel: z.enum(['email', 'sms']),
  code,
});
export const passwordResetSchema = z.strictObject(passwordPair).superRefine(matchingPasswords);
export const passwordChangeSchema = z.strictObject(passwordPair).superRefine(matchingPasswords);
export const reauthSchema = z.strictObject({
  purpose: z.enum(['change_password', 'change_email', 'change_phone']),
  currentPassword,
});
export const emailChangeRequestSchema = z.strictObject({ email });
export const phoneChangeRequestSchema = z.strictObject({ phone });
export const emptyBodySchema = z
  .strictObject({})
  .optional()
  .transform((value) => value ?? {});

const testDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional();
const scoredCertificate = (type, minimum, maximum, step) =>
  z.strictObject({
    type: z.literal(type),
    score: z.number().min(minimum).max(maximum).multipleOf(step),
    testDate,
  });
const levelCertificate = (type, levels) =>
  z.strictObject({ type: z.literal(type), level: z.enum(levels), testDate });

const languageCertificate = z.discriminatedUnion('type', [
  scoredCertificate('ielts', 0, 9, 0.5),
  scoredCertificate('toefl', 0, 120, 1),
  scoredCertificate('tcf', 100, 699, 1),
  scoredCertificate('duolingo', 10, 160, 5),
  levelCertificate('delf', ['A1', 'A2', 'B1', 'B2']),
  levelCertificate('dalf', ['C1', 'C2']),
  levelCertificate('tef', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  levelCertificate('cambridge', ['B2', 'C1', 'C2']),
]);

export const profileSchema = z
  .strictObject({
    currentDegree: z.enum([
      'diploma',
      'associate',
      'bachelor',
      'master',
      'professional-doctorate',
      'phd',
    ]),
    educationCountryCode: z.literal('IR'),
    fieldId: z.string().trim().min(1).max(128),
    universityId: z.string().trim().min(1).max(128),
    studyStatus: z.enum(['graduated', 'studying']),
    gradeAverage: z.number().min(0).max(100),
    gradeScale: z.enum(['20', '4', '100']),
    targetFieldId: z.string().trim().min(1).max(128),
    targetDegree: z.enum(['bachelor', 'master', 'professional-doctorate', 'phd']),
    targetCountries: z
      .array(z.enum(['DE', 'FR', 'US', 'CA', 'IT']))
      .min(1)
      .max(5),
    intake: z.discriminatedUnion('term', [
      z.strictObject({ term: z.enum(['spring', 'fall']), year: z.number().int() }),
      z.strictObject({ term: z.literal('undecided'), year: z.null() }),
    ]),
    hasLanguageCertificate: z.boolean(),
    languageCertificates: z.array(languageCertificate).max(5),
    annualBudget: z.enum(['under-10000', '10000-20000', '20000-30000', 'over-30000', 'undecided']),
    scholarshipImportance: z.enum(['essential', 'preferred', 'not-required']),
  })
  .superRefine((profile, context) => {
    const gradeMaximum = { 4: 4, 20: 20, 100: 100 }[profile.gradeScale];
    if (profile.gradeAverage > gradeMaximum) {
      context.addIssue({
        code: 'custom',
        path: ['gradeAverage'],
        message: `Grade average exceeds the ${profile.gradeScale}-point scale.`,
      });
    }
    if (profile.hasLanguageCertificate !== profile.languageCertificates.length > 0) {
      context.addIssue({
        code: 'custom',
        path: ['languageCertificates'],
        message: 'Language certificate details do not match the selected status.',
      });
    }
    if (new Set(profile.targetCountries).size !== profile.targetCountries.length) {
      context.addIssue({
        code: 'custom',
        path: ['targetCountries'],
        message: 'Target countries must not contain duplicates.',
      });
    }
    if (profile.intake.term !== 'undecided') {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const intakeDate = new Date(profile.intake.year, profile.intake.term === 'spring' ? 0 : 8, 1);
      if (profile.intake.year > today.getFullYear() + 10 || intakeDate < startOfToday) {
        context.addIssue({
          code: 'custom',
          path: ['intake', 'year'],
          message: 'Intake must be within the next ten years.',
        });
      }
    }
  });
