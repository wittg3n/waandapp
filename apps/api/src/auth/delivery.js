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

function developmentSender(channel, write) {
  const label = channel.toUpperCase();

  return {
    async sendAuthenticationCode({ destination, code, expiresInSeconds }) {
      write(
        `[DEV AUTH ${label}] destination=${destination} code=${code} expires=${expiresInSeconds}s`,
      );
    },
    async sendSecurityNotification({ destination, event }) {
      write(`[DEV AUTH ${label}] destination=${destination} event=${event}`);
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

export function createDeliverySenders(settings, fetchImpl = fetch, write = console.info) {
  if (settings.authDeliveryMode === 'disabled') {
    return { emailSender: disabledSender(), smsSender: disabledSender() };
  }

  if (settings.authDeliveryMode === 'development') {
    if (settings.nodeEnvironment !== 'development') {
      throw new Error('Development authentication delivery is only available in development.');
    }
    return {
      emailSender: developmentSender('email', write),
      smsSender: developmentSender('sms', write),
    };
  }

  if (settings.authDeliveryMode === 'dev-no2step') {
    if (!isDevNoTwoStep(settings)) {
      throw new Error('Two-step bypass is only available in development.');
    }
    return { emailSender: disabledSender(), smsSender: disabledSender() };
  }

  if (settings.authDeliveryMode !== 'webhook') {
    throw new Error('Unsupported authentication delivery mode.');
  }

  return {
    emailSender: settings.authEmailWebhookUrl
      ? createWebhookSender({
          url: settings.authEmailWebhookUrl,
          token: settings.authEmailWebhookToken,
          fetchImpl,
        })
      : disabledSender(),
    smsSender: settings.authSmsWebhookUrl
      ? createWebhookSender({
          url: settings.authSmsWebhookUrl,
          token: settings.authSmsWebhookToken,
          fetchImpl,
        })
      : disabledSender(),
  };
}

export function isDevNoTwoStep(settings) {
  return settings.nodeEnvironment === 'development' && settings.authDeliveryMode === 'dev-no2step';
}
