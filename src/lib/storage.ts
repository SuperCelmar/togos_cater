/**
 * localStorage utility for managing contact ID and session persistence
 * Links GoHighLevel contact ID with Supabase session ID for user identification
 */

const STORAGE_KEYS = {
  CONTACT_ID: 'ghl_contact_id',
  SESSION_ID: 'supabase_session_id',
} as const;

/**
 * Save contact ID and optional session ID to localStorage
 */
export function saveContactSession(contactId: string, sessionId?: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTACT_ID, contactId);
    if (sessionId) {
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    }
  } catch (error) {
    console.error('Failed to save contact session to localStorage:', error);
  }
}

/**
 * Retrieve stored contact ID from localStorage
 */
export function getContactId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.CONTACT_ID);
  } catch (error) {
    console.error('Failed to get contact ID from localStorage:', error);
    return null;
  }
}

/**
 * Retrieve stored session ID from localStorage
 */
export function getSessionId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  } catch (error) {
    console.error('Failed to get session ID from localStorage:', error);
    return null;
  }
}

/**
 * Clear all stored contact/session data from localStorage
 * Use this on logout or when session expires
 */
export function clearContactSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONTACT_ID);
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
  } catch (error) {
    console.error('Failed to clear contact session from localStorage:', error);
  }
}

/**
 * Check if stored contact session is valid
 * Returns true if contact ID exists, false otherwise
 */
export function isContactSessionValid(): boolean {
  const contactId = getContactId();
  return contactId !== null && contactId.trim() !== '';
}
