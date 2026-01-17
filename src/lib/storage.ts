/**
 * localStorage utility for managing contact ID and session persistence
 * Links GoHighLevel contact ID with Supabase session ID for user identification
 */

const STORAGE_KEYS = {
  CONTACT_ID: 'ghl_contact_id',
  SESSION_ID: 'supabase_session_id',
  DELIVERY_ADDRESS: 'delivery_address',
  ORDERS_CACHE_PREFIX: 'orders_cache_',
  ORDERS_REFRESH_PENDING_PREFIX: 'orders_refresh_pending_',
  SCHEDULED_ORDERS_PREFIX: 'scheduled_orders_',
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
 * Save orders cache for a contact
 */
export function saveOrdersCache(contactId: string, orders: unknown[]): void {
  try {
    const key = `${STORAGE_KEYS.ORDERS_CACHE_PREFIX}${contactId}`;
    localStorage.setItem(key, JSON.stringify(orders));
  } catch (error) {
    console.error('Failed to save orders cache to localStorage:', error);
  }
}

/**
 * Retrieve orders cache for a contact
 */
export function getOrdersCache<T = unknown>(contactId: string): T[] | null {
  try {
    const key = `${STORAGE_KEYS.ORDERS_CACHE_PREFIX}${contactId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get orders cache from localStorage:', error);
    return null;
  }
}

/**
 * Clear orders cache for a contact
 */
export function clearOrdersCache(contactId: string): void {
  try {
    const key = `${STORAGE_KEYS.ORDERS_CACHE_PREFIX}${contactId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear orders cache from localStorage:', error);
  }
}

/**
 * Set refresh pending flag for Home order fetch
 */
export function setOrdersRefreshPending(contactId: string, pending: boolean): void {
  try {
    const key = `${STORAGE_KEYS.ORDERS_REFRESH_PENDING_PREFIX}${contactId}`;
    localStorage.setItem(key, pending ? 'true' : 'false');
  } catch (error) {
    console.error('Failed to save orders refresh flag to localStorage:', error);
  }
}

/**
 * Get refresh pending flag for Home order fetch
 */
export function getOrdersRefreshPending(contactId: string): boolean {
  try {
    const key = `${STORAGE_KEYS.ORDERS_REFRESH_PENDING_PREFIX}${contactId}`;
    return localStorage.getItem(key) === 'true';
  } catch (error) {
    console.error('Failed to read orders refresh flag from localStorage:', error);
    return false;
  }
}

/**
 * Clear refresh pending flag for Home order fetch
 */
export function clearOrdersRefreshPending(contactId: string): void {
  try {
    const key = `${STORAGE_KEYS.ORDERS_REFRESH_PENDING_PREFIX}${contactId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear orders refresh flag from localStorage:', error);
  }
}

/**
 * Save scheduled orders for a contact
 */
export function saveScheduledOrders<T = unknown>(contactId: string, orders: T[]): void {
  try {
    const key = `${STORAGE_KEYS.SCHEDULED_ORDERS_PREFIX}${contactId}`;
    localStorage.setItem(key, JSON.stringify(orders));
  } catch (error) {
    console.error('Failed to save scheduled orders to localStorage:', error);
  }
}

/**
 * Get scheduled orders for a contact
 */
export function getScheduledOrders<T = unknown>(contactId: string): T[] {
  try {
    const key = `${STORAGE_KEYS.SCHEDULED_ORDERS_PREFIX}${contactId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get scheduled orders from localStorage:', error);
    return [];
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
