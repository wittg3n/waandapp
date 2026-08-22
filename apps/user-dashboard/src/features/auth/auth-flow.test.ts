import { describe, expect, it } from 'vitest';

import {
  cooldownDeadline,
  cooldownRemaining,
  createAuthOperationGate,
  normalizeLocalizedDigits,
} from '@/features/auth/auth-flow';
import { authCodeSchema, authPhoneSchema } from '@/schemas/auth.schema';

describe('verification helpers', () => {
  it('uses an authoritative cooldown deadline and rounds partial seconds up', () => {
    const deadline = cooldownDeadline(10_000, 30);
    expect(cooldownRemaining(deadline, 10_001)).toBe(30);
    expect(cooldownRemaining(deadline, 39_001)).toBe(1);
    expect(cooldownRemaining(deadline, 40_000)).toBe(0);
  });

  it('normalizes localized OTP digits and requires explicit E.164 phone input', () => {
    expect(normalizeLocalizedDigits('۱۲٣')).toBe('123');
    expect(authCodeSchema.parse('۱۲۳-۴۵۶')).toBe('123456');
    expect(authPhoneSchema.parse('+۹۸ ۹۱۲ ۱۲۳ ۴۵۶۷')).toBe('+989121234567');
    expect(authPhoneSchema.safeParse('09121234567').success).toBe(false);
  });

  it('invalidates aborted or superseded async completions', () => {
    const gate = createAuthOperationGate();
    const first = gate.start();
    const second = gate.start();

    expect(first.signal.aborted).toBe(true);
    expect(gate.isCurrent(first)).toBe(false);
    expect(gate.isCurrent(second)).toBe(true);
    gate.cancel();
    expect(second.signal.aborted).toBe(true);
    expect(gate.isBusy()).toBe(false);
  });
});
