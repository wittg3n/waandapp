import type { AdminSessionRepository, UsersRepository } from '../services/users-repository.ts';
import { PERMISSION_KEYS } from '@/features/administration/types/administration.types';
import {
  type AdminSession,
  type ApplicantProfile,
  type UserAuditEntry,
  type UserDetail,
  type UserSortField,
  type UserStatus,
} from '../types/users.types.ts';

const MOCK_DELAY_MS = 350;
const people = [
  ['آرمان', 'رضایی', 'arman.rezaei'],
  ['سارا', 'محمدی', 'sara.mohammadi'],
  ['کیان', 'احمدی', 'kian.ahmadi'],
  ['نگار', 'کریمی', 'negar.karimi'],
  ['پارسا', 'حسینی', 'parsa.hosseini'],
  ['رها', 'کاظمی', 'raha.kazemi'],
  ['امیرعلی', 'مرادی', 'amirali.moradi'],
  ['یسنا', 'قاسمی', 'yasna.ghasemi'],
  ['سام', 'اکبری', 'sam.akbari'],
  ['نازنین', 'جعفری', 'nazanin.jafari'],
  ['ماهان', 'صادقی', 'mahan.sadeghi'],
  ['هلیا', 'رحیمی', 'helia.rahimi'],
  ['بردیا', 'عباسی', 'bardia.abbasi'],
  ['آوا', 'موسوی', 'ava.mousavi'],
  ['مانی', 'نوری', 'mani.nouri'],
  ['ترانه', 'امینی', 'taraneh.amini'],
  ['نیما', 'یوسفی', 'nima.yousefi'],
  ['پرنیان', 'شریفی', 'parnian.sharifi'],
  ['شایان', 'مهدوی', 'shayan.mahdavi'],
  ['مهسا', 'رستمی', 'mahsa.rostami'],
  ['آریا', 'بهرامی', 'aria.bahrami'],
  ['غزل', 'سلطانی', 'ghazal.soltani'],
  ['پویا', 'زارعی', 'pouya.zarei'],
  ['یلدا', 'فراهانی', 'yalda.farahani'],
  ['دانیال', 'ملکی', 'danial.maleki'],
  ['کیمیا', 'حیدری', 'kimia.heydari'],
  ['سهند', 'خلیلی', 'sahand.khalili'],
  ['الناز', 'طاهری', 'elnaz.taheri'],
  ['سینا', 'نادری', 'sina.naderi'],
  ['مبینا', 'فرهادی', 'mobina.farhadi'],
] as const;
const statuses: UserStatus[] = ['active', 'active', 'pending_verification', 'suspended', 'banned'];
const completionValues = [100, 80, 55, 25, 0];

const allPermissions = [...PERMISSION_KEYS];

function profileFor(index: number): ApplicantProfile {
  const timestamp = new Date(Date.UTC(2025, index % 12, (index % 24) + 1)).toISOString();
  return {
    id: (1000 + index).toString(16).padStart(24, '0'),
    currentDegree: ['diploma', 'bachelor', 'master'][index % 3],
    educationCountryCode: 'IR',
    fieldId: `field-${String((index % 8) + 1).padStart(2, '0')}`,
    universityId: `university-${String((index % 10) + 1).padStart(2, '0')}`,
    studyStatus: index % 3 === 0 ? 'graduated' : 'studying',
    gradeAverage: 14.5 + (index % 6) * 0.7,
    gradeScale: '20',
    targetFieldId: `field-${String(((index + 3) % 8) + 1).padStart(2, '0')}`,
    targetDegree: ['bachelor', 'master', 'phd'][index % 3],
    targetCountries: index % 2 ? ['DE', 'NL'] : ['CA', 'US'],
    intake: { term: index % 2 ? 'fall' : 'spring', year: 2027 },
    hasLanguageCertificate: index % 3 !== 0,
    languageCertificates:
      index % 3 !== 0 ? [{ type: 'IELTS', score: 6.5 + (index % 3) * 0.5 }] : [],
    annualBudget: index % 2 ? 'MEDIUM' : 'HIGH',
    scholarshipImportance: index % 3 ? 'IMPORTANT' : 'REQUIRED',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

const initialUsers: UserDetail[] = people.map(([firstName, lastName, username], index) => {
  const status = statuses[index % statuses.length];
  const profileCompletion = completionValues[index % completionValues.length];
  const createdAt = new Date(
    Date.UTC(2024 + Math.floor(index / 18), index % 12, (index % 24) + 1),
  ).toISOString();
  const emailVerified = status !== 'pending_verification' && index % 4 !== 0;
  const phoneVerified = status !== 'pending_verification' && index % 3 !== 0;
  return {
    id: (index + 1).toString(16).padStart(24, '0'),
    firstName,
    lastName,
    username,
    email: `${username}@example.ir`,
    phone: `+98912000${String(index).padStart(4, '0')}`,
    emailVerified,
    phoneVerified,
    role: 'applicant',
    adminRoles: [],
    permissions: [],
    status,
    profileCompletion,
    lastLoginAt:
      status === 'pending_verification'
        ? null
        : new Date(Date.UTC(2026, 7, (index % 28) + 1, 8 + (index % 10), 15)).toISOString(),
    createdAt,
    updatedAt: createdAt,
    profile: profileCompletion > 0 ? profileFor(index) : null,
  };
});

const users = structuredClone(initialUsers);
const auditEntries: UserAuditEntry[] = users.slice(0, 12).map((user, index) => ({
  id: `mock-audit-${index + 1}`,
  actorUserId: 'mock-super-admin',
  actorType: 'USER',
  actor: { firstName: 'مدیر', lastName: 'آزمایشی', username: 'mock.superadmin' },
  action:
    user.status === 'suspended'
      ? 'USER_SUSPENDED'
      : user.status === 'banned'
        ? 'USER_BANNED'
        : 'USER_UPDATED',
  resourceType: 'USER',
  resourceId: user.id,
  before: null,
  after: { status: user.status },
  reason: 'داده آزمایشی برای بازبینی رابط مدیریت',
  createdAt: new Date(Date.UTC(2026, 7, index + 1, 10)).toISOString(),
}));

function clone<T>(value: T): T {
  return structuredClone(value);
}

function delay(signal?: AbortSignal, duration = MOCK_DELAY_MS) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timeout = globalThis.setTimeout(resolve, duration);
    signal?.addEventListener(
      'abort',
      () => {
        globalThis.clearTimeout(timeout);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

function findUser(userId: string) {
  const user = users.find((item) => item.id === userId);
  if (!user) throw new Error('کاربر موردنظر پیدا نشد.');
  return user;
}

function addAudit(userId: string, action: string, reason: string, after: Record<string, unknown>) {
  auditEntries.unshift({
    id: `mock-audit-${Date.now()}`,
    actorUserId: 'mock-super-admin',
    actorType: 'USER',
    actor: { firstName: 'مدیر', lastName: 'آزمایشی', username: 'mock.superadmin' },
    action,
    resourceType: 'USER',
    resourceId: userId,
    before: null,
    after,
    reason,
    createdAt: new Date().toISOString(),
  });
}

export const mockUsersRepository: UsersRepository = {
  async list(params, signal) {
    await delay(signal);
    let result = [...users];
    const search = params.get('search')?.trim().toLocaleLowerCase('fa-IR');
    if (search) {
      result = result.filter((user) =>
        [user.firstName, user.lastName, user.username, user.email, user.phone]
          .join(' ')
          .toLocaleLowerCase('fa-IR')
          .includes(search),
      );
    }
    const status = params.get('status');
    if (status) result = result.filter((user) => user.status === status);
    for (const [key, field] of [
      ['emailVerified', 'emailVerified'],
      ['phoneVerified', 'phoneVerified'],
    ] as const) {
      const value = params.get(key);
      if (value) result = result.filter((user) => user[field] === (value === 'true'));
    }
    const profileCompleted = params.get('profileCompleted');
    if (profileCompleted) {
      result = result.filter(
        (user) => (user.profileCompletion === 100) === (profileCompleted === 'true'),
      );
    }
    const registeredFrom = params.get('registeredFrom');
    const registeredTo = params.get('registeredTo');
    if (registeredFrom)
      result = result.filter((user) => user.createdAt >= `${registeredFrom}T00:00:00.000Z`);
    if (registeredTo)
      result = result.filter((user) => user.createdAt <= `${registeredTo}T23:59:59.999Z`);

    const sortBy = (params.get('sortBy') ?? 'createdAt') as UserSortField;
    const direction = params.get('sortOrder') === 'asc' ? 1 : -1;
    result.sort(
      (left, right) =>
        String(left[sortBy] ?? '').localeCompare(String(right[sortBy] ?? ''), 'fa') * direction,
    );

    const page = Math.max(1, Number(params.get('page')) || 1);
    const pageSize = Math.max(1, Number(params.get('pageSize')) || 25);
    const total = result.length;
    return {
      items: clone(result.slice((page - 1) * pageSize, page * pageSize)),
      pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) },
    };
  },

  async get(userId, signal) {
    await delay(signal);
    return clone(findUser(userId));
  },

  async update(userId, input) {
    await delay();
    const user = findUser(userId);
    if (input.firstName !== undefined) user.firstName = input.firstName;
    if (input.lastName !== undefined) user.lastName = input.lastName;
    user.updatedAt = new Date().toISOString();
    addAudit(userId, 'USER_UPDATED', input.reason, {
      firstName: user.firstName,
      lastName: user.lastName,
    });
    return clone(user);
  },

  async changeStatus(userId, status, reason) {
    await delay();
    const user = findUser(userId);
    user.status = status;
    user.updatedAt = new Date().toISOString();
    addAudit(
      userId,
      status === 'suspended'
        ? 'USER_SUSPENDED'
        : status === 'banned'
          ? 'USER_BANNED'
          : 'USER_ACTIVATED',
      reason,
      { status },
    );
    return clone(user);
  },

  async resetVerification(userId, channel, reason) {
    await delay();
    const user = findUser(userId);
    if (channel === 'email') user.emailVerified = false;
    else user.phoneVerified = false;
    user.status = 'pending_verification';
    user.updatedAt = new Date().toISOString();
    addAudit(
      userId,
      channel === 'email' ? 'USER_EMAIL_VERIFICATION_RESET' : 'USER_PHONE_VERIFICATION_RESET',
      reason,
      { status: user.status },
    );
    return clone(user);
  },

  async revokeAllSessions(userId, reason) {
    await delay();
    findUser(userId);
    addAudit(userId, 'USER_SESSIONS_REVOKED', reason, { revokedAt: new Date().toISOString() });
  },

  async audit(userId, signal) {
    await delay(signal);
    const items = auditEntries.filter((entry) => entry.resourceId === userId);
    return {
      items: clone(items),
      pagination: { page: 1, pageSize: 50, total: items.length, pageCount: items.length ? 1 : 0 },
    };
  },
};

export const localAdminSessionRepository: AdminSessionRepository = {
  async get(signal?: AbortSignal): Promise<AdminSession> {
    await delay(signal, 180);
    return {
      user: {
        id: 'adm_001',
        firstName: 'خشایار',
        lastName: 'مافی',
        username: 'owner',
        email: 'owner@waand.com',
        role: 'admin',
        adminRoles: ['SUPER_ADMIN'],
        permissions: allPermissions,
        status: 'active',
      },
    };
  },
};
