// One namespace per deployment; tests supply a unique prefix.
export function authRedisKeys(settings) {
  const prefix = settings.authRedisPrefix ?? 'waandapp:identity:';
  return {
    sessionPrefix: (scope) => `${prefix}sessions:${scope}:`,
    userSessions: (userId) => `${prefix}user-sessions:${userId}`,
    permissions: (userId, version, revision) =>
      `${prefix}permissions:${userId}:${version}:${revision}`,
  };
}
