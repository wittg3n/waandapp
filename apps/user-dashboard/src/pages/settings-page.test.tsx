// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TooltipProvider } from '@/components/ui/tooltip';
import { SettingsPage } from '@/pages/settings-page';

const mocks = vi.hoisted(() => ({
  applySnapshot: vi.fn(),
  reauthenticate: vi.fn(),
  refreshSession: vi.fn(),
  requestContactChange: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('@/features/auth/auth-api', async () => {
  const actual = await vi.importActual<
    Record<string, unknown> & { authApi: Record<string, unknown> }
  >('@/features/auth/auth-api');
  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      reauthenticate: mocks.reauthenticate,
      requestContactChange: mocks.requestContactChange,
    },
  };
});

vi.mock('@/features/auth/auth-context', () => ({
  useAuth: () => ({
    applySnapshot: mocks.applySnapshot,
    preauth: null,
    refreshSession: mocks.refreshSession,
  }),
}));

vi.mock('sonner', () => ({ toast: { success: mocks.toastSuccess } }));

const activeUser = {
  id: 'user-1',
  firstName: 'سارا',
  lastName: 'احمدی',
  username: 'sara',
  email: 'sara@example.com',
  phone: '+989121234567',
  emailVerified: true,
  phoneVerified: true,
  role: 'applicant',
  status: 'active',
  onboardingStatus: 'completed',
};

function renderSettings() {
  render(
    <TooltipProvider>
      <SettingsPage />
    </TooltipProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('SettingsPage no-step transitions', () => {
  it('reveals the contact form after terminal reauthentication and completes in one request', async () => {
    mocks.reauthenticate.mockResolvedValue({
      status: 'REAUTHENTICATED',
      purpose: 'change_email',
      snapshot: { preauth: null, user: activeUser },
    });
    mocks.requestContactChange.mockResolvedValue({
      status: 'EMAIL_CHANGED',
      snapshot: {
        preauth: null,
        user: { ...activeUser, email: 'new@example.com' },
      },
    });
    renderSettings();

    fireEvent.click(screen.getByRole('button', { name: 'تغییر ایمیل' }));
    fireEvent.change(screen.getByLabelText('رمز عبور فعلی'), {
      target: { value: 'correct password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ادامه' }));

    const email = await screen.findByLabelText('ایمیل جدید');
    fireEvent.change(email, { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'ادامه' }));

    await waitFor(() =>
      expect(mocks.requestContactChange).toHaveBeenCalledWith(
        'email',
        'new@example.com',
        expect.any(AbortSignal),
      ),
    );
    expect(mocks.toastSuccess).toHaveBeenCalledWith('ایمیل تغییر کرد.');
    expect(screen.queryByLabelText('کد تأیید شش‌رقمی')).toBeNull();
  });

  it('does not reveal a sensitive-change form for a nonterminal reauthentication response', async () => {
    mocks.reauthenticate.mockResolvedValue({
      status: 'SECOND_STEP_REQUIRED',
      snapshot: {
        user: null,
        preauth: {
          type: 'step_up',
          stage: 'second_step',
          allowedChannels: ['email', 'sms'],
          completedChannels: [],
          destinations: { email: 's***@example.com', sms: '+98*****67' },
          expiresAt: '2026-08-22T13:00:00.000Z',
          purpose: 'change_email',
        },
      },
    });
    renderSettings();

    fireEvent.click(screen.getByRole('button', { name: 'تغییر ایمیل' }));
    fireEvent.change(screen.getByLabelText('رمز عبور فعلی'), {
      target: { value: 'correct password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ادامه' }));

    await waitFor(() => expect(mocks.reauthenticate).toHaveBeenCalledOnce());
    expect(screen.queryByLabelText('ایمیل جدید')).toBeNull();
  });
});
