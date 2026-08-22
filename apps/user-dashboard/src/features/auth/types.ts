import type { AppError } from '@/errors/app-error';

export type AuthChannel = 'email' | 'sms';
export type UserRole = 'applicant' | 'staff' | 'admin';
export type UserStatus = 'pending_verification' | 'active' | 'suspended' | 'deleted';
export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed';

export const educationDegreeValues = [
  'diploma',
  'associate',
  'bachelor',
  'master',
  'professional-doctorate',
  'phd',
] as const;
export type EducationDegree = (typeof educationDegreeValues)[number];

export const targetDegreeValues = ['bachelor', 'master', 'professional-doctorate', 'phd'] as const;
export type TargetDegree = (typeof targetDegreeValues)[number];

export const studyStatusValues = ['graduated', 'studying'] as const;
export type StudyStatus = (typeof studyStatusValues)[number];

export const gradeScaleValues = ['20', '4', '100'] as const;
export type GradeScale = (typeof gradeScaleValues)[number];

export const countryCodes = [
  'AD',
  'AE',
  'AF',
  'AG',
  'AI',
  'AL',
  'AM',
  'AO',
  'AQ',
  'AR',
  'AS',
  'AT',
  'AU',
  'AW',
  'AX',
  'AZ',
  'BA',
  'BB',
  'BD',
  'BE',
  'BF',
  'BG',
  'BH',
  'BI',
  'BJ',
  'BL',
  'BM',
  'BN',
  'BO',
  'BQ',
  'BR',
  'BS',
  'BT',
  'BV',
  'BW',
  'BY',
  'BZ',
  'CA',
  'CC',
  'CD',
  'CF',
  'CG',
  'CH',
  'CI',
  'CK',
  'CL',
  'CM',
  'CN',
  'CO',
  'CR',
  'CU',
  'CV',
  'CW',
  'CX',
  'CY',
  'CZ',
  'DE',
  'DJ',
  'DK',
  'DM',
  'DO',
  'DZ',
  'EC',
  'EE',
  'EG',
  'EH',
  'ER',
  'ES',
  'ET',
  'FI',
  'FJ',
  'FK',
  'FM',
  'FO',
  'FR',
  'GA',
  'GB',
  'GD',
  'GE',
  'GF',
  'GG',
  'GH',
  'GI',
  'GL',
  'GM',
  'GN',
  'GP',
  'GQ',
  'GR',
  'GS',
  'GT',
  'GU',
  'GW',
  'GY',
  'HK',
  'HM',
  'HN',
  'HR',
  'HT',
  'HU',
  'ID',
  'IE',
  'IL',
  'IM',
  'IN',
  'IO',
  'IQ',
  'IR',
  'IS',
  'IT',
  'JE',
  'JM',
  'JO',
  'JP',
  'KE',
  'KG',
  'KH',
  'KI',
  'KM',
  'KN',
  'KP',
  'KR',
  'KW',
  'KY',
  'KZ',
  'LA',
  'LB',
  'LC',
  'LI',
  'LK',
  'LR',
  'LS',
  'LT',
  'LU',
  'LV',
  'LY',
  'MA',
  'MC',
  'MD',
  'ME',
  'MF',
  'MG',
  'MH',
  'MK',
  'ML',
  'MM',
  'MN',
  'MO',
  'MP',
  'MQ',
  'MR',
  'MS',
  'MT',
  'MU',
  'MV',
  'MW',
  'MX',
  'MY',
  'MZ',
  'NA',
  'NC',
  'NE',
  'NF',
  'NG',
  'NI',
  'NL',
  'NO',
  'NP',
  'NR',
  'NU',
  'NZ',
  'OM',
  'PA',
  'PE',
  'PF',
  'PG',
  'PH',
  'PK',
  'PL',
  'PM',
  'PN',
  'PR',
  'PS',
  'PT',
  'PW',
  'PY',
  'QA',
  'RE',
  'RO',
  'RS',
  'RU',
  'RW',
  'SA',
  'SB',
  'SC',
  'SD',
  'SE',
  'SG',
  'SH',
  'SI',
  'SJ',
  'SK',
  'SL',
  'SM',
  'SN',
  'SO',
  'SR',
  'SS',
  'ST',
  'SV',
  'SX',
  'SY',
  'SZ',
  'TC',
  'TD',
  'TF',
  'TG',
  'TH',
  'TJ',
  'TK',
  'TL',
  'TM',
  'TN',
  'TO',
  'TR',
  'TT',
  'TV',
  'TW',
  'TZ',
  'UA',
  'UG',
  'UM',
  'US',
  'UY',
  'UZ',
  'VA',
  'VC',
  'VE',
  'VG',
  'VI',
  'VN',
  'VU',
  'WF',
  'WS',
  'YE',
  'YT',
  'ZA',
  'ZM',
  'ZW',
] as const;
export type CountryCode = (typeof countryCodes)[number];

export const targetCountryCodes = ['DE', 'FR', 'US', 'CA', 'IT'] as const;
export type TargetCountryCode = (typeof targetCountryCodes)[number];

export const intakeSeasonValues = ['spring', 'fall'] as const;
export type IntakeSeason = (typeof intakeSeasonValues)[number];

export type IntakeValue = { term: IntakeSeason; year: number } | { term: 'undecided'; year: null };

export const annualBudgetValues = [
  'under-10000',
  '10000-20000',
  '20000-30000',
  'over-30000',
  'undecided',
] as const;
export type AnnualBudget = (typeof annualBudgetValues)[number];

export const scholarshipImportanceValues = ['essential', 'preferred', 'not-required'] as const;
export type ScholarshipImportance = (typeof scholarshipImportanceValues)[number];

export const languageCertificateTypeValues = [
  'ielts',
  'toefl',
  'delf',
  'dalf',
  'tcf',
  'tef',
  'duolingo',
  'cambridge',
] as const;
export type LanguageCertificateType = (typeof languageCertificateTypeValues)[number];

export type LanguageCertificate =
  | {
      type: 'ielts' | 'toefl' | 'tcf' | 'duolingo';
      score: number;
      testDate?: string;
    }
  | { type: 'tef'; level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'; testDate?: string }
  | { type: 'delf'; level: 'A1' | 'A2' | 'B1' | 'B2'; testDate?: string }
  | { type: 'dalf'; level: 'C1' | 'C2'; testDate?: string }
  | { type: 'cambridge'; level: 'B2' | 'C1' | 'C2'; testDate?: string };

export interface InitialProfileData {
  currentDegree: EducationDegree;
  educationCountryCode: 'IR';
  fieldId: string;
  universityId: string;
  studyStatus: StudyStatus;
  gradeAverage: number;
  gradeScale: GradeScale;
  targetFieldId: string;
  targetDegree: TargetDegree;
  targetCountries: TargetCountryCode[];
  intake: IntakeValue;
  hasLanguageCertificate: boolean;
  languageCertificates: LanguageCertificate[];
  annualBudget: AnnualBudget;
  scholarshipImportance: ScholarshipImportance;
}

export type ProfileCompletionSectionId = 'base' | 'goals' | 'language' | 'documents' | 'resume';

export interface ProfileCompletionSection {
  id: ProfileCompletionSectionId;
  label: string;
  completedWeight: number;
  totalWeight: number;
}

export interface ProfileCompletion {
  percentage: number;
  completedWeight: number;
  totalWeight: number;
  sections: readonly ProfileCompletionSection[];
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  role: UserRole;
  status: UserStatus;
  onboardingStatus: OnboardingStatus;
  initialProfile?: InitialProfileData;
}

export interface UserProfile extends AuthUser {
  fullName: string;
  onboardingCompleted: boolean;
  profileCompletion: ProfileCompletion;
}

export type AuthState =
  | { status: 'loading' }
  | { status: 'anonymous'; error?: AppError; requiresSessionReset?: boolean }
  | { status: 'preauth'; preauth: PreauthContext }
  | { status: 'authenticated'; user: UserProfile };

export type SecurityPurpose = 'change_password' | 'change_email' | 'change_phone';
export type PreauthType = 'signup' | 'login' | 'password_reset' | 'step_up';
export type PreauthStage =
  | 'verify_contacts'
  | 'second_step'
  | 'reauthenticated'
  | 'new_contact_verification'
  | 'recovery_verification'
  | 'ready_for_password_reset';

export interface PreauthContext {
  type: PreauthType;
  stage: PreauthStage;
  allowedChannels: AuthChannel[];
  completedChannels: AuthChannel[];
  destinations: Partial<Record<AuthChannel, string>>;
  expiresAt: string;
  purpose?: SecurityPurpose;
}

export interface AuthSnapshot {
  user: AuthUser | null;
  preauth: PreauthContext | null;
}

export interface CodeSentResult {
  status: 'CODE_SENT';
  channel: AuthChannel;
  destinationMasked: string;
  expiresInSeconds: number;
  retryAfterSeconds: number;
}

export interface AuthContextValue {
  state: AuthState;
  isAuthenticated: boolean;
  user: UserProfile | null;
  preauth: PreauthContext | null;
  termsVersion: string | null;
  profileCompletion: ProfileCompletion;
  applySnapshot: (snapshot: AuthSnapshot) => AuthState;
  refreshSession: () => Promise<void>;
  completeOnboarding: (data: InitialProfileData) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}
