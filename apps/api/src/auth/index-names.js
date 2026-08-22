export const AUTH_INDEX_NAMES = Object.freeze({
  userUsernameIdentity: 'unique_username_identity',
  userEmailIdentity: 'unique_email_identity',
  userPhoneIdentity: 'unique_phone_identity',
  transactionLookup: 'auth_transaction_lookup',
  transactionTtl: 'auth_transaction_ttl',
  challengeIdentity: 'unique_challenge_identity',
  challengeLookup: 'challenge_lookup_v3',
  challengeTtl: 'challenge_ttl',
  profileOwner: 'unique_applicant_profile_owner',
  legalAcceptance: 'unique_legal_acceptance',
  eventUser: 'user_auth_events',
  eventType: 'auth_event_type',
  sessionTtl: 'expires_1',
});

const stringIdentity = (field) => ({ [field]: { $type: 'string' } });

export const AUTH_INDEX_DEFINITIONS = Object.freeze({
  user: Object.freeze([
    {
      key: { usernameNormalized: 1 },
      options: {
        name: AUTH_INDEX_NAMES.userUsernameIdentity,
        unique: true,
        partialFilterExpression: stringIdentity('usernameNormalized'),
      },
    },
    {
      key: { emailNormalized: 1 },
      options: {
        name: AUTH_INDEX_NAMES.userEmailIdentity,
        unique: true,
        partialFilterExpression: stringIdentity('emailNormalized'),
      },
    },
    {
      key: { phoneNormalized: 1 },
      options: {
        name: AUTH_INDEX_NAMES.userPhoneIdentity,
        unique: true,
        partialFilterExpression: stringIdentity('phoneNormalized'),
      },
    },
  ]),
  transaction: Object.freeze([
    {
      key: { userId: 1, type: 1, consumedAt: 1, expiresAt: -1 },
      options: { name: AUTH_INDEX_NAMES.transactionLookup },
    },
    {
      key: { expiresAt: 1 },
      options: { expireAfterSeconds: 0, name: AUTH_INDEX_NAMES.transactionTtl },
    },
  ]),
  challenge: Object.freeze([
    {
      key: { challengeId: 1 },
      options: {
        name: AUTH_INDEX_NAMES.challengeIdentity,
        unique: true,
        partialFilterExpression: stringIdentity('challengeId'),
      },
    },
    {
      key: { transactionId: 1, purpose: 1, channel: 1, createdAt: -1 },
      options: { name: AUTH_INDEX_NAMES.challengeLookup },
    },
    {
      key: { expiresAt: 1 },
      options: { expireAfterSeconds: 0, name: AUTH_INDEX_NAMES.challengeTtl },
    },
  ]),
  profile: Object.freeze([
    {
      key: { userId: 1 },
      options: { name: AUTH_INDEX_NAMES.profileOwner, unique: true },
    },
  ]),
  legal: Object.freeze([
    {
      key: { userId: 1, document: 1, version: 1 },
      options: { name: AUTH_INDEX_NAMES.legalAcceptance, unique: true },
    },
  ]),
  event: Object.freeze([
    {
      key: { userId: 1, createdAt: -1 },
      options: { name: AUTH_INDEX_NAMES.eventUser },
    },
    {
      key: { type: 1, createdAt: -1 },
      options: { name: AUTH_INDEX_NAMES.eventType },
    },
  ]),
  session: Object.freeze([
    {
      key: { expires: 1 },
      options: { expireAfterSeconds: 0, name: AUTH_INDEX_NAMES.sessionTtl },
    },
  ]),
});
