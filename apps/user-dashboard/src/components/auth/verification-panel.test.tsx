// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { VerificationPanel } from '@/components/auth/verification-panel';
import { AppError } from '@/errors/app-error';
import { ERROR_CODES } from '@/errors/error-codes';
import type { CodeSentResult } from '@/features/auth/types';

vi.mock('framer-motion', async () => ({
  ...(await vi.importActual<Record<string, unknown>>('framer-motion')),
  useReducedMotion: () => true,
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

function renderPanel(onRequest: () => Promise<CodeSentResult>) {
  render(
    <VerificationPanel
      channels={['email']}
      destinations={{ email: 's***@example.com' }}
      lockedChannel="email"
      onRequest={onRequest}
      onVerify={vi.fn()}
    />,
  );
}

afterEach(cleanup);

describe('VerificationPanel', () => {
  it('shows the sent state and code input only after delivery resolves', async () => {
    const delivery = deferred<CodeSentResult>();
    renderPanel(() => delivery.promise);

    fireEvent.click(screen.getByRole('button', { name: 'ارسال کد به ایمیل' }));

    expect(screen.queryByLabelText('کد تأیید شش‌رقمی')).toBeNull();
    expect(screen.queryByText(/ارسال شد/)).toBeNull();

    await act(async () => {
      delivery.resolve({
        status: 'CODE_SENT',
        channel: 'email',
        destinationMasked: 's***@example.com',
        expiresInSeconds: 300,
        retryAfterSeconds: 60,
      });
      await delivery.promise;
    });

    expect(screen.getByLabelText('کد تأیید شش‌رقمی')).toBeTruthy();
    expect(screen.getAllByText(/ارسال شد/)).toHaveLength(2);
  });

  it('keeps the pre-send state and shows safe Persian copy when delivery fails', async () => {
    renderPanel(() =>
      Promise.reject(
        new AppError(ERROR_CODES.AUTH_DELIVERY_UNAVAILABLE, {
          message: 'provider detail must stay hidden',
        }),
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'ارسال کد به ایمیل' }));

    expect(
      await screen.findByText('ارسال کد فعلاً ممکن نیست؛ کمی بعد دوباره تلاش کنید.'),
    ).toBeTruthy();
    expect(screen.queryByLabelText('کد تأیید شش‌رقمی')).toBeNull();
    expect(screen.queryByText(/ارسال شد/)).toBeNull();
    expect(screen.getByRole('button', { name: 'ارسال کد به ایمیل' })).toBeTruthy();
    expect(screen.queryByText('provider detail must stay hidden')).toBeNull();
  });
});
