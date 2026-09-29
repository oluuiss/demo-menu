/** Error thrown for non-2xx responses; carries the backend's { code, message, fields } payload. */
export class ApiError extends Error {
  constructor(status, message, { code, fields = {} } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

// The selected UI language, sent as Accept-Language so the backend localizes data and messages.
let apiLanguage = 'pt-BR';

export function setApiLanguage(locale) {
  apiLanguage = locale;
}

/**
 * Small fetch wrapper for the Java backend. Always sends the session cookie.
 * Network/server failures use `errorKey` (an i18n key) so the UI can translate them.
 */
export async function apiRequest(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'include',
      headers: {
        'Accept-Language': apiLanguage,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw withKey(new ApiError(0, ''), 'errors.network');
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null; // e.g. an HTML error page from the dev proxy when the backend is down
  }

  if (!response.ok) {
    const error = new ApiError(response.status, data?.message ?? '', { code: data?.code, fields: data?.fields });
    if (!data?.message) withKey(error, response.status >= 500 ? 'errors.server' : 'errors.generic');
    throw error;
  }
  return data;
}

function withKey(error, key) {
  error.messageKey = key;
  return error;
}

/** Localized message for any error thrown by apiRequest. */
export function errorMessage(error, t) {
  if (!error) return '';
  if (error.messageKey) return t(error.messageKey);
  return error.message || t('errors.generic');
}
