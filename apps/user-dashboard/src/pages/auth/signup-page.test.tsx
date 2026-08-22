// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { TooltipProvider } from '@/components/ui/tooltip';
import { AppError } from '@/errors/app-error';
import { ERROR_CODES } from '@/errors/error-codes';
import { SignupPage } from '@/pages/auth/signup-page';

const mocks = vi.hoisted(() => ({
  applySnapshot: vi.fn(() => ({ status: 'loading' as const })),
  register: vi.fn(),
}));

vi.mock('framer-motion', async () => ({
  ...(await vi.importActual<Record<string, unknown>>('framer-motion')),
  useReducedMotion: () => true,
}));

vi.mock('@/features/auth/auth-api', async () => {
  const actual = await vi.importActual<
    Record<string, unknown> & { authApi: Record<string, unknown> }
  >('@/features/auth/auth-api');
  return { ...actual, authApi: { ...actual.authApi, register: mocks.register } };
});

vi.mock('@/features/auth/auth-context', () => ({
  useAuth: () => ({
    applySnapshot: mocks.applySnapshot,
    state: { status: 'anonymous' as const },
    termsVersion: 'v1',
  }),
}));

vi.mock('@/hooks/use-app-error', () => ({
  useAppError: () => ({
    clearError: vi.fn(),
    handleError: (cause: unknown) => cause as AppError,
  }),
}));

function fillAccountForm() {
  fireEvent.change(screen.getByLabelText('نام'), { target: { value: ' سارا ' } });
  fireEvent.change(screen.getByLabelText('نام خانوادگی'), { target: { value: 'احمدی' } });
  fireEvent.change(screen.getByLabelText('نام کاربری'), { target: { value: 'Sara.Student' } });
  fireEvent.change(screen.getByLabelText('ایمیل'), {
    target: { value: ' SARA@example.com ' },
  });
  fireEvent.change(screen.getByLabelText('رمز عبور'), { target: { value: 'abcdefgh' } });
  fireEvent.change(screen.getByLabelText('تکرار رمز عبور'), {
    target: { value: 'abcdefgh' },
  });
  fireEvent.click(screen.getByLabelText('با قوانین و شرایط فعلی وآند موافقم'));
}

async function openPhoneStep() {
  fireEvent.click(screen.getByRole('button', { name: 'ثبت‌نام' }));
  const phone = await screen.findByLabelText('شماره موبایل');
  await waitFor(() => expect(document.activeElement).toBe(phone));
  return phone as HTMLInputElement;
}

function renderSignup() {
  render(
    <MemoryRouter>
      <TooltipProvider>
        <SignupPage />
      </TooltipProvider>
    </MemoryRouter>,
  );
}

describe('SignupPage', () => {
  beforeEach(() => {
    mocks.applySnapshot.mockClear();
    mocks.register.mockReset();
    mocks.register.mockResolvedValue({ snapshot: {}, status: 'VERIFICATION_REQUIRED' });
  });

  afterEach(cleanup);

  it('preserves account values across the phone step and submits one normalized payload', async () => {
    renderSignup();
    fillAccountForm();

    await openPhoneStep();
    expect(mocks.register).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'بازگشت و ویرایش اطلاعات' }));
    const firstName = (await screen.findByLabelText('نام')) as HTMLInputElement;
    await waitFor(() => expect(document.activeElement).toBe(firstName));
    expect(firstName.value).toBe(' سارا ');

    const phone = await openPhoneStep();
    fireEvent.change(phone, { target: { value: '۰۹۱۲۱۲۳۴۵۶۷' } });
    fireEvent.click(screen.getByRole('button', { name: 'تکمیل ثبت‌نام' }));

    await waitFor(() => expect(mocks.register).toHaveBeenCalledTimes(1));
    expect(mocks.register).toHaveBeenCalledWith({
      firstName: 'سارا',
      lastName: 'احمدی',
      username: 'sara.student',
      email: 'sara@example.com',
      phone: '+989121234567',
      password: 'abcdefgh',
      passwordConfirmation: 'abcdefgh',
      termsAccepted: true,
      termsVersion: 'v1',
    });
  });

  it('returns focus to a server-invalid account field', async () => {
    mocks.register.mockRejectedValue(
      new AppError(ERROR_CODES.VALIDATION_ERROR, {
        fieldErrors: { email: ['ایمیل واردشده معتبر نیست.'] },
      }),
    );
    renderSignup();
    fillAccountForm();
    const phone = await openPhoneStep();
    fireEvent.change(phone, { target: { value: '09121234567' } });
    fireEvent.click(screen.getByRole('button', { name: 'تکمیل ثبت‌نام' }));

    const email = (await screen.findByLabelText('ایمیل')) as HTMLInputElement;
    await waitFor(() => expect(document.activeElement).toBe(email));
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('ایمیل واردشده معتبر نیست.')).toBeTruthy();
  });
});
