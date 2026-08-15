import {
  annualBudgetValues,
  countryCodes,
  educationDegreeValues,
  gradeScaleValues,
  intakeSeasonValues,
  languageCertificateTypeValues,
  scholarshipImportanceValues,
  studyStatusValues,
  targetCountryCodes,
  targetDegreeValues,
  type AnnualBudget,
  type CountryCode,
  type EducationDegree,
  type GradeScale,
  type InitialProfileData,
  type IntakeValue,
  type LanguageCertificate,
  type LanguageCertificateType,
  type ScholarshipImportance,
  type StudyStatus,
  type TargetCountryCode,
  type TargetDegree,
} from '@/features/auth/types';
import {
  isIranianAcademicFieldId,
  isIranianUniversityId,
  resolveIranianAcademicFieldId,
  resolveIranianUniversityId,
} from '@/data/iran';

const STORAGE_KEY = 'waand:user-dashboard:auth:v1';

export interface StoredUserProfile {
  id: string;
  email: string;
  fullName: string;
  onboardingCompleted: boolean;
  initialProfile?: InitialProfileData;
}

export interface OnboardingDraft {
  view: number;
  values: unknown;
}

interface StoredAuthState {
  activeEmail: string | null;
  users: Record<string, StoredUserProfile>;
  onboardingDrafts: Record<string, OnboardingDraft>;
}

const emptyState = (): StoredAuthState => ({ activeEmail: null, users: {}, onboardingDrafts: {} });
let memoryState = emptyState();
let persistentStorageUnavailable = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isOneOf<const Values extends readonly string[]>(
  value: unknown,
  values: Values,
): value is Values[number] {
  return typeof value === 'string' && values.some((candidate) => candidate === value);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const digitMap: Record<string, string> = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

function normalizeNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;

  const normalized = value
    .trim()
    .replace(/[۰-۹٠-٩]/g, (digit) => digitMap[digit] ?? digit)
    .replace(/[٫,/]/g, '.')
    .replace(/[٬\s]/g, '');
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

const degreeAliases: Record<string, EducationDegree> = {
  دیپلم: 'diploma',
  کاردانی: 'associate',
  کارشناسی: 'bachelor',
  'کارشناسی ارشد': 'master',
  دکتری: 'phd',
  'دکتری حرفه‌ای': 'professional-doctorate',
  'دکتری تخصصی': 'phd',
};

function normalizeEducationDegree(value: unknown): EducationDegree | null {
  if (isOneOf(value, educationDegreeValues)) return value;
  return typeof value === 'string' ? (degreeAliases[value.trim()] ?? null) : null;
}

function normalizeTargetDegree(value: unknown): TargetDegree | null {
  if (isOneOf(value, targetDegreeValues)) return value;
  const normalized = normalizeEducationDegree(value);
  return normalized && isOneOf(normalized, targetDegreeValues) ? normalized : null;
}

const countryAliases: Record<string, CountryCode> = {
  ایران: 'IR',
  افغانستان: 'AF',
  ترکیه: 'TR',
  کانادا: 'CA',
  آلمان: 'DE',
  فرانسه: 'FR',
  هلند: 'NL',
  ایتالیا: 'IT',
  استرالیا: 'AU',
  آمریکا: 'US',
  'ایالات متحده': 'US',
  بریتانیا: 'GB',
  انگلستان: 'GB',
  سوئد: 'SE',
  نروژ: 'NO',
  فنلاند: 'FI',
  دانمارک: 'DK',
  اتریش: 'AT',
  سوئیس: 'CH',
  اسپانیا: 'ES',
  ایرلند: 'IE',
  بلژیک: 'BE',
};

function normalizeCountry(value: unknown): CountryCode | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  const upperCase = normalized.toUpperCase();
  if (isOneOf(upperCase, countryCodes)) return upperCase;
  return countryAliases[normalized] ?? null;
}

function normalizeStudyStatus(value: unknown): StudyStatus | null {
  if (isOneOf(value, studyStatusValues)) return value;
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (normalized === 'فارغ‌التحصیل شده‌ام') return 'graduated';
  if (normalized === 'در حال تحصیل هستم') return 'studying';
  return null;
}

function normalizeGradeScale(value: unknown): GradeScale | null {
  if (isOneOf(value, gradeScaleValues)) return value;
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (normalized === 'از ۲۰') return '20';
  if (normalized === 'از ۴') return '4';
  if (normalized === 'از ۱۰۰') return '100';
  return null;
}

function normalizeIntake(value: unknown): IntakeValue {
  if (isRecord(value)) {
    if (value.term === 'undecided') return { term: 'undecided', year: null };
    if (
      isOneOf(value.term, intakeSeasonValues) &&
      typeof value.year === 'number' &&
      Number.isInteger(value.year)
    ) {
      return { term: value.term, year: value.year };
    }
  }

  if (typeof value !== 'string') return { term: 'undecided', year: null };
  const normalized = value.trim().replace(/[۰-۹٠-٩]/g, (digit) => digitMap[digit] ?? digit);
  if (normalized === 'undecided' || normalized === 'هنوز مطمئن نیستم') {
    return { term: 'undecided', year: null };
  }

  const stableMatch = /^(spring|fall)-(\d{4})$/.exec(normalized);
  if (stableMatch) {
    return { term: stableMatch[1] === 'spring' ? 'spring' : 'fall', year: Number(stableMatch[2]) };
  }

  const localizedMatch = /^(بهار|پاییز)\s+(\d{4})$/.exec(normalized);
  if (localizedMatch) {
    return {
      term: localizedMatch[1] === 'بهار' ? 'spring' : 'fall',
      year: Number(localizedMatch[2]),
    };
  }

  return { term: 'undecided', year: null };
}

const certificateTypeAliases: Record<string, LanguageCertificateType> = {
  'IELTS Academic': 'ielts',
  IELTS: 'ielts',
  آیلتس: 'ielts',
  'TOEFL iBT': 'toefl',
  TOEFL: 'toefl',
  تافل: 'toefl',
  DELF: 'delf',
  DALF: 'dalf',
  TCF: 'tcf',
  TEF: 'tef',
  'Duolingo English Test': 'duolingo',
  Duolingo: 'duolingo',
  دولینگو: 'duolingo',
  'Cambridge English': 'cambridge',
  Cambridge: 'cambridge',
};

function normalizeCertificateType(value: unknown): LanguageCertificateType | null {
  if (isOneOf(value, languageCertificateTypeValues)) return value;
  return typeof value === 'string' ? (certificateTypeAliases[value.trim()] ?? null) : null;
}

function optionalTestDate(value: unknown): { testDate?: string } {
  return typeof value === 'string' && value.trim() ? { testDate: value.trim() } : {};
}

function isValidCertificateScore(
  type: 'ielts' | 'toefl' | 'tcf' | 'duolingo',
  score: number,
): boolean {
  switch (type) {
    case 'ielts':
      return score >= 0 && score <= 9 && Number.isInteger(score * 2);
    case 'toefl':
      return score >= 0 && score <= 120 && Number.isInteger(score);
    case 'tcf':
      return score >= 100 && score <= 699 && Number.isInteger(score);
    case 'duolingo':
      return score >= 10 && score <= 160 && Number.isInteger(score / 5);
  }
}

function normalizeLanguageCertificate(value: unknown): LanguageCertificate | null {
  if (!isRecord(value)) return null;
  const type = normalizeCertificateType(value.type);
  if (!type) return null;
  const testDate = optionalTestDate(value.testDate);

  if (
    type === 'ielts' ||
    type === 'toefl' ||
    type === 'tcf' ||
    type === 'duolingo'
  ) {
    const score = normalizeNumber(value.score);
    return score === null || !isValidCertificateScore(type, score)
      ? null
      : { type, score, ...testDate };
  }

  if (typeof value.level !== 'string') return null;
  const level = value.level.trim().toUpperCase();
  if (type === 'delf' && (level === 'A1' || level === 'A2' || level === 'B1' || level === 'B2')) {
    return { type, level, ...testDate };
  }
  if (type === 'dalf' && (level === 'C1' || level === 'C2')) {
    return { type, level, ...testDate };
  }
  if (type === 'cambridge' && (level === 'B2' || level === 'C1' || level === 'C2')) {
    return { type, level, ...testDate };
  }
  if (
    type === 'tef' &&
    (level === 'A1' ||
      level === 'A2' ||
      level === 'B1' ||
      level === 'B2' ||
      level === 'C1' ||
      level === 'C2')
  ) {
    return { type, level, ...testDate };
  }
  return null;
}

function normalizeLegacyCertificate(profile: Record<string, unknown>): LanguageCertificate | null {
  const type = normalizeCertificateType(profile.languageCertificate);
  if (!type) return null;
  const legacyValue = profile.languageScore;

  if (
    type === 'ielts' ||
    type === 'toefl' ||
    type === 'tcf' ||
    type === 'duolingo'
  ) {
    const score = normalizeNumber(legacyValue);
    return score === null || !isValidCertificateScore(type, score) ? null : { type, score };
  }

  return normalizeLanguageCertificate({ type, level: legacyValue });
}

function normalizeAnnualBudget(value: unknown): AnnualBudget {
  if (isOneOf(value, annualBudgetValues)) return value;
  return 'undecided';
}

function normalizeScholarshipImportance(value: unknown): ScholarshipImportance | null {
  return isOneOf(value, scholarshipImportanceValues) ? value : null;
}

function normalizeTargetCountry(value: unknown): TargetCountryCode | null {
  const country = normalizeCountry(value);
  return country && isOneOf(country, targetCountryCodes) ? country : null;
}

function normalizeInitialProfileData(value: unknown): InitialProfileData | null {
  if (!isRecord(value)) return null;

  const currentDegree = normalizeEducationDegree(value.currentDegree);
  const fieldValue =
    typeof value.fieldId === 'string'
      ? value.fieldId
      : typeof value.fieldOfStudy === 'string'
        ? value.fieldOfStudy
        : '';
  const universityValue =
    typeof value.universityId === 'string'
      ? value.universityId
      : typeof value.institution === 'string'
        ? value.institution
        : '';
  const targetFieldValue =
    typeof value.targetFieldId === 'string'
      ? value.targetFieldId
      : typeof value.targetField === 'string'
        ? value.targetField
        : fieldValue;
  const fieldId = resolveIranianAcademicFieldId(fieldValue);
  const universityId = resolveIranianUniversityId(universityValue);
  const targetFieldId = resolveIranianAcademicFieldId(targetFieldValue);
  const gradeAverage = normalizeNumber(value.gradeAverage);
  const gradeScale = normalizeGradeScale(value.gradeScale);
  const studyStatus = normalizeStudyStatus(value.studyStatus);
  const targetDegree = normalizeTargetDegree(value.targetDegree);
  const scholarshipImportance = normalizeScholarshipImportance(value.scholarshipImportance);
  const educationCountryCode =
    value.educationCountryCode === 'IR' || normalizeCountry(value.studyCountry) === 'IR'
      ? 'IR'
      : null;
  if (
    !currentDegree ||
    !fieldId ||
    !universityId ||
    !targetFieldId ||
    gradeAverage === null ||
    !gradeScale ||
    !studyStatus ||
    !targetDegree ||
    !scholarshipImportance ||
    !educationCountryCode
  ) {
    return null;
  }

  const languageCertificates = Array.isArray(value.languageCertificates)
    ? value.languageCertificates
        .map(normalizeLanguageCertificate)
        .filter((certificate): certificate is LanguageCertificate => certificate !== null)
    : [];
  const legacyCertificate = normalizeLegacyCertificate(value);
  if (languageCertificates.length === 0 && legacyCertificate)
    languageCertificates.push(legacyCertificate);

  const hasLanguageCertificate =
    typeof value.hasLanguageCertificate === 'boolean'
      ? value.hasLanguageCertificate
      : languageCertificates.length > 0;
  const targetCountries = Array.isArray(value.targetCountries)
    ? value.targetCountries
        .map(normalizeTargetCountry)
        .filter((country): country is TargetCountryCode => country !== null)
    : [];

  return {
    currentDegree,
    educationCountryCode,
    fieldId,
    universityId,
    studyStatus,
    gradeAverage,
    gradeScale,
    targetFieldId,
    targetDegree,
    targetCountries,
    intake: normalizeIntake(value.intake),
    hasLanguageCertificate,
    languageCertificates: hasLanguageCertificate ? languageCertificates : [],
    annualBudget: normalizeAnnualBudget(value.annualBudget),
    scholarshipImportance,
  };
}

function isInitialProfileComplete(profile: InitialProfileData): boolean {
  const currentYear = new Date().getFullYear();
  const maximum = { '4': 4, '20': 20, '100': 100 }[profile.gradeScale];
  const intakeIsCurrent =
    profile.intake.term === 'undecided' ||
    (profile.intake.year <= currentYear + 10 &&
      new Date(
        profile.intake.year,
        profile.intake.term === 'spring' ? 0 : 8,
        1,
      ) >= new Date(currentYear, new Date().getMonth(), new Date().getDate()));

  return Boolean(
    profile.educationCountryCode === 'IR' &&
      isIranianAcademicFieldId(profile.fieldId) &&
      isIranianUniversityId(profile.universityId) &&
      profile.gradeAverage >= 0 &&
      profile.gradeAverage <= maximum &&
      isIranianAcademicFieldId(profile.targetFieldId) &&
      profile.targetCountries.length > 0 &&
      intakeIsCurrent &&
      (!profile.hasLanguageCertificate || profile.languageCertificates.length > 0) &&
      profile.scholarshipImportance,
  );
}

function readUser(value: unknown): StoredUserProfile | null {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.email !== 'string' ||
    typeof value.fullName !== 'string' ||
    typeof value.onboardingCompleted !== 'boolean'
  ) {
    return null;
  }

  const initialProfile = normalizeInitialProfileData(value.initialProfile);
  return {
    id: value.id,
    email: normalizeEmail(value.email),
    fullName: value.fullName,
    onboardingCompleted:
      value.onboardingCompleted && Boolean(initialProfile && isInitialProfileComplete(initialProfile)),
    ...(initialProfile ? { initialProfile } : {}),
  };
}

function readDraft(value: unknown): OnboardingDraft | null {
  if (
    !isRecord(value) ||
    typeof value.view !== 'number' ||
    !Number.isInteger(value.view) ||
    value.view < -1 ||
    value.view > 4 ||
    !Object.hasOwn(value, 'values')
  ) {
    return null;
  }
  return { view: value.view, values: value.values };
}

function parseState(serialized: string | null): StoredAuthState {
  if (!serialized) return emptyState();

  try {
    const value: unknown = JSON.parse(serialized);
    if (!isRecord(value) || !isRecord(value.users)) return emptyState();

    const users: Record<string, StoredUserProfile> = {};
    for (const candidate of Object.values(value.users)) {
      const user = readUser(candidate);
      if (user) users[user.email] = user;
    }

    const onboardingDrafts: Record<string, OnboardingDraft> = {};
    if (isRecord(value.onboardingDrafts)) {
      for (const [emailValue, candidate] of Object.entries(value.onboardingDrafts)) {
        const email = normalizeEmail(emailValue);
        const draft = readDraft(candidate);
        if (users[email] && draft) onboardingDrafts[email] = draft;
      }
    }

    const activeEmail =
      typeof value.activeEmail === 'string' ? normalizeEmail(value.activeEmail) : null;
    return {
      activeEmail: activeEmail && users[activeEmail] ? activeEmail : null,
      users,
      onboardingDrafts,
    };
  } catch {
    return emptyState();
  }
}

function readState(): StoredAuthState {
  if (typeof window === 'undefined' || persistentStorageUnavailable) return memoryState;

  try {
    memoryState = parseState(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    // Private browsing and hardened environments can deny storage access.
    persistentStorageUnavailable = true;
  }

  return memoryState;
}

function writeState(state: StoredAuthState): void {
  memoryState = state;
  if (typeof window !== 'undefined' && !persistentStorageUnavailable) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Keep the current tab usable when persistence is unavailable.
      persistentStorageUnavailable = true;
    }
  }
}

function fallbackName(email: string): string {
  return (
    email
      .split('@')[0]
      ?.replace(/[._-]+/g, ' ')
      .trim() || 'کاربر وآند'
  );
}

function createUser(email: string, fullName?: string): StoredUserProfile {
  return {
    id: crypto.randomUUID(),
    email,
    fullName: fullName?.trim() || fallbackName(email),
    onboardingCompleted: false,
  };
}

export const authStorage = {
  getActiveUser(): StoredUserProfile | null {
    const state = readState();
    return state.activeEmail ? (state.users[state.activeEmail] ?? null) : null;
  },

  login(emailValue: string): StoredUserProfile {
    const email = normalizeEmail(emailValue);
    const state = readState();
    const user = state.users[email] ?? createUser(email);
    writeState({ ...state, activeEmail: email, users: { ...state.users, [email]: user } });
    return user;
  },

  signup(emailValue: string, fullName: string): StoredUserProfile {
    const email = normalizeEmail(emailValue);
    const state = readState();
    const existing = state.users[email];
    const user = existing
      ? { ...existing, fullName: fullName.trim() || existing.fullName }
      : createUser(email, fullName);
    writeState({ ...state, activeEmail: email, users: { ...state.users, [email]: user } });
    return user;
  },

  getOnboardingDraft(emailValue: string): OnboardingDraft | null {
    const email = normalizeEmail(emailValue);
    return readState().onboardingDrafts[email] ?? null;
  },

  saveOnboardingDraft(emailValue: string, draft: OnboardingDraft): void {
    const email = normalizeEmail(emailValue);
    const state = readState();
    if (!state.users[email]) throw new Error(`Cannot save onboarding for unknown user: ${email}`);
    writeState({
      ...state,
      onboardingDrafts: { ...state.onboardingDrafts, [email]: draft },
    });
  },

  clearOnboardingDraft(emailValue: string): void {
    const email = normalizeEmail(emailValue);
    const state = readState();
    if (!state.onboardingDrafts[email]) return;
    const onboardingDrafts = { ...state.onboardingDrafts };
    delete onboardingDrafts[email];
    writeState({ ...state, onboardingDrafts });
  },

  completeOnboarding(emailValue: string, initialProfile: InitialProfileData): StoredUserProfile {
    const email = normalizeEmail(emailValue);
    const state = readState();
    const current = state.users[email];
    if (!current) throw new Error(`Cannot complete onboarding for unknown user: ${email}`);

    const user = { ...current, initialProfile, onboardingCompleted: true };
    const onboardingDrafts = { ...state.onboardingDrafts };
    delete onboardingDrafts[email];
    writeState({
      ...state,
      activeEmail: email,
      users: { ...state.users, [email]: user },
      onboardingDrafts,
    });
    return user;
  },

  logout(): void {
    const state = readState();
    writeState({ ...state, activeEmail: null });
  },
};
