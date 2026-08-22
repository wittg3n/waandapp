import { describe, expect, it } from 'vitest';

import {
  loginSchema,
  passwordResetSchema,
  passwordSchema,
  reauthSchema,
  signupPhoneSchema,
  signupSchema,
  usernameSchema,
} from '@/schemas/auth.schema';

describe('auth form schemas', () => {
  it('accepts long Unicode passwords and spaces without composition rules', () => {
    expect(Array.from('abcdefgh')).toHaveLength(8);
    expect(passwordSchema.parse('abcdefgh')).toBe('abcdefgh');
    expect(passwordSchema.parse('یک رمز عبور طولانی و امن')).toBe('یک رمز عبور طولانی و امن');
    expect(passwordSchema.parse('correct horse battery staple')).toBe(
      'correct horse battery staple',
    );
    expect(passwordSchema.safeParse('😀'.repeat(100)).success).toBe(true);
    expect(loginSchema.safeParse({ identifier: 'sara', password: '😀'.repeat(100) }).success).toBe(
      true,
    );
    expect(reauthSchema.safeParse({ currentPassword: '😀'.repeat(100) }).success).toBe(true);
    expect(
      passwordResetSchema.safeParse({
        password: '😀'.repeat(100),
        passwordConfirmation: '😀'.repeat(100),
      }).success,
    ).toBe(true);
  });

  it('rejects short, obvious, and overlong passwords', () => {
    expect(passwordSchema.safeParse('x'.repeat(7)).success).toBe(false);
    expect(passwordSchema.safeParse('password1234').success).toBe(false);
    expect(passwordSchema.safeParse('x'.repeat(129)).success).toBe(false);
    expect(loginSchema.safeParse({ identifier: 'sara', password: '😀'.repeat(129) }).success).toBe(
      false,
    );
  });

  it('normalizes usernames and rejects reserved or unsupported values', () => {
    expect(usernameSchema.parse(' Sara.Student ')).toBe('sara.student');
    expect(usernameSchema.parse('Ｓａｒａ')).toBe('sara');
    expect(usernameSchema.safeParse('admin').success).toBe(false);
    expect(usernameSchema.safeParse('نام‌کاربری').success).toBe(false);
  });

  it('accepts Iranian local signup mobiles and normalizes localized digits to E.164', () => {
    expect(signupPhoneSchema.parse('۰۹۱۲۱۲۳۴۵۶۷')).toBe('+989121234567');
    expect(signupPhoneSchema.parse('٠٩٩٩٩٩٩٩٩٩٩')).toBe('+989999999999');
    expect(signupPhoneSchema.safeParse('+989121234567').success).toBe(false);
    expect(signupPhoneSchema.safeParse('0912123456').success).toBe(false);
    expect(signupPhoneSchema.safeParse('08121234567').success).toBe(false);
  });

  it('requires explicit legal acceptance and matching passwords', () => {
    const base = {
      firstName: 'سارا',
      lastName: 'احمدی',
      username: 'sara',
      email: 'sara@example.com',
      phone: '09121234567',
      password: 'correct horse battery staple',
      passwordConfirmation: 'correct horse battery staple',
      termsAccepted: false,
    };
    expect(signupSchema.safeParse(base).success).toBe(false);
    expect(
      signupSchema.safeParse({ ...base, termsAccepted: true, passwordConfirmation: 'different' })
        .success,
    ).toBe(false);
    expect(signupSchema.parse({ ...base, termsAccepted: true }).phone).toBe('+989121234567');
    expect(
      signupSchema.safeParse({
        ...base,
        firstName: 'ن'.repeat(81),
        lastName: 'خ'.repeat(120),
        termsAccepted: true,
      }).success,
    ).toBe(false);
    expect(
      signupSchema.safeParse({
        ...base,
        lastName: 'خ'.repeat(121),
        termsAccepted: true,
      }).success,
    ).toBe(false);
  });
});
