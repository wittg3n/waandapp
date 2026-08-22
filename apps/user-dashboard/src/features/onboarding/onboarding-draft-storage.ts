export interface OnboardingDraft {
  view: number;
  values: unknown;
}

const STORAGE_KEY = 'waand:user-dashboard:onboarding-drafts:v1';
const LEGACY_AUTH_STORAGE_KEY = 'waand:user-dashboard:auth:v1';

let memoryDrafts: Record<string, OnboardingDraft> = {};
let persistentStorageUnavailable = false;
let legacyStorageCleared = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function browserStorage(): Storage | null {
  if (persistentStorageUnavailable || typeof window === 'undefined') return null;
  try {
    if (!legacyStorageCleared) {
      window.localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
      legacyStorageCleared = true;
    }
    return window.localStorage;
  } catch {
    persistentStorageUnavailable = true;
    return null;
  }
}

function parseDraft(value: unknown): OnboardingDraft | null {
  if (!isRecord(value) || !Number.isInteger(value.view) || !('values' in value)) return null;
  return { view: value.view as number, values: value.values };
}

function readDrafts(): Record<string, OnboardingDraft> {
  const storage = browserStorage();
  if (!storage) return memoryDrafts;

  try {
    const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}');
    if (!isRecord(parsed)) return {};

    const drafts: Record<string, OnboardingDraft> = {};
    for (const [userId, value] of Object.entries(parsed)) {
      const draft = parseDraft(value);
      if (userId && draft) drafts[userId] = draft;
    }
    memoryDrafts = drafts;
    return drafts;
  } catch {
    return {};
  }
}

function writeDrafts(drafts: Record<string, OnboardingDraft>): void {
  memoryDrafts = drafts;
  const storage = browserStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    persistentStorageUnavailable = true;
  }
}

export function removeLegacyAuthStorage(): void {
  browserStorage();
}

export const onboardingDraftStorage = {
  get(userId: string): OnboardingDraft | null {
    return readDrafts()[userId] ?? null;
  },

  save(userId: string, draft: OnboardingDraft): void {
    writeDrafts({ ...readDrafts(), [userId]: draft });
  },

  clear(userId: string): void {
    const drafts = readDrafts();
    if (!Object.hasOwn(drafts, userId)) return;
    const nextDrafts = { ...drafts };
    delete nextDrafts[userId];
    writeDrafts(nextDrafts);
  },
};
