export class DeliveryUnavailableError extends Error {
  constructor(cause) {
    super('Authentication code delivery failed.', { cause });
    this.name = 'DeliveryUnavailableError';
  }
}

function disabledSender() {
  return {
    async sendAuthenticationCode() {
      throw new DeliveryUnavailableError();
    },
    async sendSecurityNotification() {
      throw new DeliveryUnavailableError();
    },
  };
}

export function createWebhookSender({ url, token, fetchImpl = fetch }) {
  async function deliver(body) {
    try {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
        redirect: 'error',
        signal: AbortSignal.timeout(5_000),
      });

      if (!response.ok) throw new Error(`Delivery provider returned HTTP ${response.status}.`);
    } catch (error) {
      throw new DeliveryUnavailableError(error);
    }
  }

  return {
    async sendAuthenticationCode({ destination, code, expiresInSeconds }) {
      await deliver({ type: 'authentication_code', destination, code, expiresInSeconds });
    },
    async sendSecurityNotification({ destination, event }) {
      await deliver({ type: 'security_notification', destination, event });
    },
  };
}

export function createDeliverySenders(settings, fetchImpl = fetch) {
  if (settings.authDeliveryMode === 'disabled') {
    return { emailSender: disabledSender(), smsSender: disabledSender() };
  }

  return {
    emailSender: createWebhookSender({
      url: settings.authEmailWebhookUrl,
      token: settings.authEmailWebhookToken,
      fetchImpl,
    }),
    smsSender: createWebhookSender({
      url: settings.authSmsWebhookUrl,
      token: settings.authSmsWebhookToken,
      fetchImpl,
    }),
  };
}
