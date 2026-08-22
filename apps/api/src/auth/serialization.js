function profilePayload(profile) {
  if (!profile) return null;
  const value = profile.toObject ? profile.toObject({ versionKey: false }) : { ...profile };
  delete value._id;
  delete value.userId;
  delete value.createdAt;
  delete value.updatedAt;
  return value;
}

export function serializeAuthUser(user, profile) {
  const initialProfile = profilePayload(profile);
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phone: user.phone,
    emailVerified: Boolean(user.emailVerifiedAt),
    phoneVerified: Boolean(user.phoneVerifiedAt),
    role: user.role,
    status: user.status,
    onboardingStatus: initialProfile ? 'completed' : 'not_started',
    ...(initialProfile ? { initialProfile } : {}),
  };
}

export function serializePreauth(transaction) {
  if (!transaction) return null;
  const destinations = {};
  if (transaction.context?.destinationMasks?.email) {
    destinations.email = transaction.context.destinationMasks.email;
  }
  if (transaction.context?.destinationMasks?.sms) {
    destinations.sms = transaction.context.destinationMasks.sms;
  }
  return {
    type: ['change_password', 'change_email', 'change_phone'].includes(transaction.type)
      ? 'step_up'
      : transaction.type,
    stage: transaction.stage,
    allowedChannels: [...transaction.allowedChannels],
    completedChannels: [...transaction.completedChannels],
    destinations,
    expiresAt: transaction.expiresAt.toISOString(),
    ...(transaction.context?.purpose ? { purpose: transaction.context.purpose } : {}),
  };
}
