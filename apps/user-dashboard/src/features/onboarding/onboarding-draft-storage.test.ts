import { describe, expect, it } from 'vitest';

import { onboardingDraftStorage } from '@/features/onboarding/onboarding-draft-storage';

describe('onboarding draft storage', () => {
  it('stores only a draft keyed by the verified server user id', () => {
    const draft = { view: 2, values: { currentDegree: 'bachelor' } };

    onboardingDraftStorage.save('verified-user-id', draft);
    expect(onboardingDraftStorage.get('verified-user-id')).toEqual(draft);
    expect(onboardingDraftStorage.get('someone-else')).toBeNull();

    onboardingDraftStorage.clear('verified-user-id');
    expect(onboardingDraftStorage.get('verified-user-id')).toBeNull();
  });
});
