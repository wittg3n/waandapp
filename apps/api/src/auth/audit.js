import { logger } from '../logger.js';
import { keyedDigest } from './code.js';
import { AuthEvent } from './models/auth-event.js';
import { maskDestination } from './normalization.js';

export async function recordAuthEvent({
  settings,
  request,
  type,
  userId,
  channel,
  destination,
  reason,
}) {
  try {
    await AuthEvent.create({
      type,
      userId: userId ?? null,
      channel: channel ?? null,
      destinationMasked: destination ? maskDestination(channel, destination) : null,
      ipHash: request.ip ? keyedDigest(request.ip, settings.authCodePepper) : null,
      requestId: request.id ?? null,
      reason: reason ?? null,
    });
  } catch (error) {
    logger.warn({ err: error, requestId: request.id, eventType: type }, 'Auth audit write failed');
  }
}
