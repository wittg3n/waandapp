import { z } from 'zod';

import { normalizeLocalizedDigits } from '@/features/auth/auth-flow';

const reservedUsernames = new Set([
  'admin',
  'administrator',
  'api',
  'root',
  'support',
  'system',
  'waand',
]);
const obviousPasswords = new Set([
  '123456789012',
  'password1234',
  'qwerty123456',
  'password password',
]);

const personNameSchema = (label: string, maximum: number) =>
  z.string().trim().min(1, `${label} را وارد کنید.`).max(maximum, `${label} بیش از حد طولانی است.`);

const hasCodePointLength = (value: string, minimum: number, maximum: number) => {
  const length = Array.from(value).length;
  return length >= minimum && length <= maximum;
};

const currentPasswordSchema = z
  .string()
  .refine((value) => hasCodePointLength(value, 1, 128), 'رمز عبور را وارد کنید.');
const passwordConfirmationSchema = z
  .string()
  .refine((value) => hasCodePointLength(value, 1, 128), 'تکرار رمز عبور را وارد کنید.');

export const authEmailSchema = z
  .string()
  .trim()
  .min(3, 'ایمیل را وارد کنید.')
  .max(254, 'ایمیل واردشده بیش از حد طولانی است.')
  .transform((email) => email.normalize('NFKC').toLocaleLowerCase('en-US'))
  .pipe(z.string().email('ایمیل معتبر نیست.'));

export const authPhoneSchema = z
  .string()
  .trim()
  .min(8, 'شماره موبایل را وارد کنید.')
  .max(16, 'شماره موبایل واردشده بیش از حد طولانی است.')
  .transform((phone) => normalizeLocalizedDigits(phone).replace(/[\s()-]/g, ''))
  .pipe(
    z.string().regex(/^\+[1-9]\d{6,14}$/, 'شماره را با کد کشور، مانند ‎+989121234567‎، وارد کنید.'),
  );

const usernameLookupSchema = z
  .string()
  .trim()
  .min(3, 'نام کاربری باید حداقل ۳ نویسه باشد.')
  .max(30, 'نام کاربری باید حداکثر ۳۰ نویسه باشد.')
  .transform((username) => username.normalize('NFKC').toLocaleLowerCase('en-US'))
  .pipe(
    z
      .string()
      .regex(
        /^[a-z0-9._-]+$/,
        'نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد، نقطه، خط تیره و زیرخط باشد.',
      ),
  );

export const usernameSchema = usernameLookupSchema.refine(
  (username) => !reservedUsernames.has(username),
  'این نام کاربری قابل انتخاب نیست.',
);

const authIdentifierSchema = z
  .string()
  .trim()
  .min(3, 'نام کاربری یا ایمیل را وارد کنید.')
  .max(254, 'نام کاربری یا ایمیل بیش از حد طولانی است.')
  .transform((identifier) => identifier.normalize('NFKC').toLocaleLowerCase('en-US'))
  .refine(
    (identifier) =>
      identifier.includes('@')
        ? authEmailSchema.safeParse(identifier).success
        : usernameLookupSchema.safeParse(identifier).success,
    'نام کاربری یا ایمیل معتبر نیست.',
  );

export const passwordSchema = z
  .string()
  .refine((password) => Array.from(password).length >= 12, 'رمز عبور باید حداقل ۱۲ نویسه باشد.')
  .refine((password) => Array.from(password).length <= 128, 'رمز عبور باید حداکثر ۱۲۸ نویسه باشد.')
  .refine((password) => /\S/u.test(password), 'رمز عبور نمی‌تواند فقط فاصله باشد.')
  .refine(
    (password) => !obviousPasswords.has(password.toLowerCase()),
    'این رمز عبور بسیار رایج است؛ رمز دیگری انتخاب کنید.',
  );

export const authCodeSchema = z
  .string()
  .transform((code) => normalizeLocalizedDigits(code).replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^\d{6}$/, 'کد تأیید باید ۶ رقم باشد.'));

export const loginSchema = z.object({
  identifier: authIdentifierSchema,
  password: currentPasswordSchema,
});

export const signupSchema = z
  .object({
    firstName: personNameSchema('نام', 80),
    lastName: personNameSchema('نام خانوادگی', 120),
    username: usernameSchema,
    email: authEmailSchema,
    phone: authPhoneSchema,
    password: passwordSchema,
    passwordConfirmation: passwordConfirmationSchema,
    termsAccepted: z.boolean().refine(Boolean, 'پذیرش قوانین و شرایط الزامی است.'),
  })
  .refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
    message: 'تکرار رمز عبور با رمز عبور مطابقت ندارد.',
    path: ['passwordConfirmation'],
  });

export const recoveryRequestSchema = z.object({
  identifier: authIdentifierSchema,
});

export const passwordResetSchema = z
  .object({
    password: passwordSchema,
    passwordConfirmation: passwordConfirmationSchema,
  })
  .refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
    message: 'تکرار رمز عبور با رمز عبور مطابقت ندارد.',
    path: ['passwordConfirmation'],
  });

export const reauthSchema = z.object({
  currentPassword: currentPasswordSchema,
});

export const emailChangeSchema = z.object({ email: authEmailSchema });
export const phoneChangeSchema = z.object({ phone: authPhoneSchema });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.input<typeof signupSchema>;
export type SignupPayload = z.output<typeof signupSchema>;
export type RecoveryRequestValues = z.infer<typeof recoveryRequestSchema>;
export type PasswordResetValues = z.infer<typeof passwordResetSchema>;
export type ReauthValues = z.infer<typeof reauthSchema>;
