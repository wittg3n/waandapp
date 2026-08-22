import { parsePhoneNumberFromString } from 'libphonenumber-js';

const localizedDigits = {
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

export function normalizeDigits(value) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => localizedDigits[digit] ?? digit);
}

export function normalizeEmail(value) {
  return value.trim().normalize('NFKC').toLocaleLowerCase('en-US');
}

export function normalizePhone(value) {
  const candidate = normalizeDigits(value.trim());
  if (!/^\+[1-9]\d{7,14}$/.test(candidate)) {
    throw new Error('Phone number must use E.164 format.');
  }
  const phone = parsePhoneNumberFromString(candidate, { extract: false });

  if (!phone?.isValid() || phone.number !== candidate) throw new Error('Invalid phone number.');
  return phone.number;
}

export function normalizeUsername(value) {
  return value.trim().normalize('NFKC').toLocaleLowerCase('en-US');
}

export function normalizeCode(value) {
  return normalizeDigits(value.trim());
}

export function maskDestination(channel, destination) {
  if (channel === 'email') {
    const [local, domain] = destination.split('@');
    return `${local?.slice(0, 1) ?? ''}***@${domain ?? '***'}`;
  }

  return `${destination.slice(0, 3)} ****** ${destination.slice(-2)}`;
}
