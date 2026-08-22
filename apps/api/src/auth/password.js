import argon2 from 'argon2';

const COMMON_PASSWORDS = new Set(
  [
    'password',
    'password123',
    '123456789',
    '1234567890',
    'qwerty',
    'qwerty123',
    'letmein',
    'welcome',
    'admin',
    'iloveyou',
    '123456',
    '1234567',
    '12345678',
    '111111',
    '000000',
    '123123',
    '654321',
    '666666',
    '7777777',
    '888888',
    '999999',
    'abc123',
    'monkey',
    'dragon',
    'master',
    'sunshine',
    'princess',
    'football',
    'baseball',
    'shadow',
    'superman',
    'michael',
    'charlie',
    'donald',
    'qazwsx',
    'trustno1',
    'passw0rd',
    'password1',
    'password12',
    'password1234',
    'password12345',
    'password123456',
    'p@ssword',
    'p@ssw0rd',
    'qwertyuiop',
    'qwerty12345',
    'qwerty123456',
    'asdfghjkl',
    'asdfgh123',
    'zxcvbnm',
    '1q2w3e4r',
    '1q2w3e4r5t',
    '1qaz2wsx',
    'zaq12wsx',
    'administrator',
    'welcome1',
    'welcome123',
    'letmein123',
    'login123',
    'changeme',
    'changeme123',
    'secret123',
    'computer',
    'internet',
    'whatever',
    'freedom',
    'flower',
    'lovely',
    'hottie',
    'cheese',
    'pepper',
    'summer',
    'winter',
    'spring',
    'autumn',
    'summer2024',
    'summer2025',
    'summer2026',
    'winter2024',
    'winter2025',
    'winter2026',
    'iran123456',
    'tehran123456',
    'waand123456',
    'شماره۱۲۳۴۵۶',
    'رمزعبور۱۲۳۴۵۶',
  ].map((password) => password.normalize('NFKC').toLocaleLowerCase('en-US')),
);

export function isCommonPassword(password) {
  return COMMON_PASSWORDS.has(password.normalize('NFKC').toLocaleLowerCase('en-US').trim());
}

export function argon2Options(settings) {
  return {
    type: argon2.argon2id,
    memoryCost: settings.authArgon2MemoryKib,
    timeCost: settings.authArgon2TimeCost,
    parallelism: settings.authArgon2Parallelism,
  };
}

export function hashPassword(password, settings) {
  return argon2.hash(password, argon2Options(settings));
}

export async function verifyPassword(passwordHash, password) {
  try {
    return await argon2.verify(passwordHash, password, { type: argon2.argon2id });
  } catch {
    return false;
  }
}
