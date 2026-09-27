const LEGACY_TOKEN_KEYS = ['@soul:token', '@soul:refresh-token'];
const SESSION_EVENT_KEY = '@soul:session-event';
const SESSION_CHANNEL_NAME = 'soul:session';
export const SESSION_CLEARED_EVENT = 'soul:session-cleared';

let accessToken: string | null = null;
let sessionRevision = 0;
let lastSessionEventId: string | null = null;

function clearLegacyTokens(): void {
  if (typeof window === 'undefined') return;
  try {
    LEGACY_TOKEN_KEYS.forEach(key => localStorage.removeItem(key));
  } catch { }
}

clearLegacyTokens();

function clearLocalSession(): void {
  sessionRevision += 1;
  accessToken = null;
  clearLegacyTokens();
}

function receiveSessionClear(eventId: string): void {
  if (!eventId || eventId === lastSessionEventId) return;
  lastSessionEventId = eventId;
  clearLocalSession();
  window.dispatchEvent(new Event(SESSION_CLEARED_EVENT));
}

const sessionChannel = typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel(SESSION_CHANNEL_NAME)
  : null;

sessionChannel?.addEventListener('message', (event: MessageEvent<string>) => {
  receiveSessionClear(event.data);
});

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === SESSION_EVENT_KEY && event.newValue) {
      receiveSessionClear(event.newValue);
    }
  });
}

export const tokenStore = {
  getAccessToken(): string | null {
    return accessToken;
  },

  getRevision(): number {
    return sessionRevision;
  },

  setAccessToken(token: string, expectedRevision = sessionRevision): boolean {
    if (expectedRevision !== sessionRevision) return false;
    accessToken = token;
    return true;
  },

  clearSession(): void {
    clearLocalSession();
  },

  clearEverywhere(): void {
    const eventId = typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

    lastSessionEventId = eventId;
    clearLocalSession();
    sessionChannel?.postMessage(eventId);

    try {
      localStorage.setItem(SESSION_EVENT_KEY, eventId);
    } catch { }
  },
};
