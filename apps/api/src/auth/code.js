import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

export function generateAuthenticationCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function hashAuthenticationCode({
  pepper,
  transactionId,
  challengeId,
  purpose,
  userId,
  channel,
  destination,
  code,
}) {
  return createHmac('sha256', pepper)
    .update(
      `${transactionId}\0${challengeId}\0${purpose}\0${userId}\0${channel}\0${destination}\0${code}`,
    )
    .digest('hex');
}

export function verifyAuthenticationCode(input, expectedHash) {
  const actual = Buffer.from(hashAuthenticationCode(input), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function keyedDigest(value, pepper) {
  return createHmac('sha256', pepper).update(value).digest('hex');
}
