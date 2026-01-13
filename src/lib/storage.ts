/**
 * localStorage utility for managing contact ID and session persistence
 * Links GoHighLevel contact ID with Supabase session ID for user identification
 */

const STORAGE_KEYS = {
  CONTACT_ID: 'ghl_contact_id',
  SESSION_ID: 'supabase_session_id',
  DELIVERY_ADDRESS: 'delivery_address',
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
 * Save delivery address details to localStorage
 */
export function saveDeliveryAddress(address: {
  address: string;
  city: string;
  state: string;
  zip: string;
}): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DELIVERY_ADDRESS, JSON.stringify(address));
  } catch (error) {
    console.error('Failed to save delivery address to localStorage:', error);
  }
}

/**
 * Retrieve stored delivery address from localStorage
 */
export function getDeliveryAddress(): {
  address: string;
  city: string;
  state: string;
  zip: string;
} | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DELIVERY_ADDRESS);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get delivery address from localStorage:', error);
    return null;
  }
}

/**
 * Clear stored delivery address from localStorage
 */
export function clearDeliveryAddress(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DELIVERY_ADDRESS);
  } catch (error) {
    console.error('Failed to clear delivery address from localStorage:', error);
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
