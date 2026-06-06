export function formatApiError(error: unknown, fallback = 'Request failed'): string {
  const response = (error as { response?: { data?: { message?: unknown } } })?.response?.data;
  const message = response?.message;

  if (Array.isArray(message)) {
    return message.map(String).join(', ');
  }
  if (typeof message === 'string') {
    return message;
  }
  if (message && typeof message === 'object') {
    return JSON.stringify(message);
  }

  return fallback;
}
