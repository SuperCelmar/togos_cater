const VITE_N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
const N8N_BASE_URL = VITE_N8N_WEBHOOK_URL?.endsWith('/') 
  ? VITE_N8N_WEBHOOK_URL.slice(0, -1) 
  : VITE_N8N_WEBHOOK_URL;

export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface AddressData {
  address: string; // Street address
  city?: string;
  state?: string;
  postalCode?: string;
  label?: string; // e.g., "Office", "Home", etc.
}

export interface ContactUpdateData {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  website?: string | null;
  timezone?: string | null;
  dnd?: boolean;
  dndSettings?: {
    Call?: { status: string; message?: string; code?: string };
    Email?: { status: string; message?: string; code?: string };
    SMS?: { status: string; message?: string; code?: string };
    WhatsApp?: { status: string; message?: string; code?: string };
    GMB?: { status: string; message?: string; code?: string };
    FB?: { status: string; message?: string; code?: string };
  };
  inboundDndSettings?: {
    all?: { status: string; message?: string };
  };
  tags?: string[];
  customFields?: any[];
  source?: string | null;
  dateOfBirth?: string | null;
  country?: string;
  assignedTo?: string | null;
}

/**
 * Parse an address string into components
 * Format: "Street Address, City, State ZIP" or variations
 * Returns parsed components or falls back to putting full address in address1
 */
function parseAddress(addressString: string): {
  address1: string;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
} {
  if (!addressString || !addressString.trim()) {
    return { address1: '' };
  }

  const trimmed = addressString.trim();
  
  // Try to parse common formats: "Street, City, State ZIP" or "Street, City, State ZIP Code"
  const parts = trimmed.split(',').map(p => p.trim()).filter(p => p.length > 0);
  
  if (parts.length >= 3) {
    // Format: "Street, City, State ZIP"
    const address1 = parts[0];
    const city = parts[1];
    const lastPart = parts[parts.length - 1];
    
    // Try to extract state and ZIP from last part
    // Pattern: "ST 12345" or "ST 12345-6789" or just "ST"
    const stateZipMatch = lastPart.match(/^([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?$/i);
    
    if (stateZipMatch) {
      return {
        address1,
        city,
        state: stateZipMatch[1].toUpperCase(),
        postalCode: stateZipMatch[2] || null
      };
    } else {
      // If no ZIP pattern found, treat entire last part as state
      return {
        address1,
        city,
        state: lastPart.length <= 2 ? lastPart.toUpperCase() : null,
        postalCode: null
      };
    }
  } else if (parts.length === 2) {
    // Format: "Street, City State ZIP" or "Street, City"
    const address1 = parts[0];
    const secondPart = parts[1];
    
    // Try to extract state and ZIP from second part
    const stateZipMatch = secondPart.match(/^(.+?)\s+([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?$/i);
    
    if (stateZipMatch) {
      return {
        address1,
        city: stateZipMatch[1].trim(),
        state: stateZipMatch[2].toUpperCase(),
        postalCode: stateZipMatch[3] || null
      };
    } else {
      // No state/ZIP pattern, treat as city only
      return {
        address1,
        city: secondPart,
        state: null,
        postalCode: null
      };
    }
  } else {
    // Single part - put everything in address1
    return {
      address1: trimmed,
      city: null,
      state: null,
      postalCode: null
    };
  }
}

export const ghlService = {
  /**
   * Search for a contact by phone number or email
   */
  async searchContact(query: string) {
    if (!N8N_BASE_URL) throw new Error('N8N_WEBHOOK_URL is not configured');
    
    // Check if query looks like a phone number (mostly digits)
    const isPhone = /^\+?[\d\s-().]{7,}$/.test(query) && !query.includes('@');
    
    let searchTerm = query;
    
    if (isPhone) {
      // Format to E.164: Remove non-digits and ensure +1 prefix
      let cleanPhone = query.replace(/\D/g, '');
      if (cleanPhone.length === 10) {
        cleanPhone = `+1${cleanPhone}`;
      } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
        cleanPhone = `+${cleanPhone}`;
      } else if (!cleanPhone.startsWith('+') && cleanPhone.length > 0) {
        // Fallback: if it's already 11+ digits but doesn't start with +, add it
        cleanPhone = `+${cleanPhone}`;
      }
      searchTerm = cleanPhone;
    }
    
    const url = `${N8N_BASE_URL}/contacts/search?q=${encodeURIComponent(searchTerm)}`;
    
    console.log(`[GHL] Searching contact: ${searchTerm} at ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to search contact: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Create a new contact
   */
  async createContact(data: ContactData) {
    if (!N8N_BASE_URL) throw new Error('N8N_WEBHOOK_URL is not configured');

    // Handle phone formatting - skip if empty or falsy
    let e164Phone = '';
    if (data.phone && data.phone.trim()) {
      e164Phone = data.phone.replace(/\D/g, '');
      if (e164Phone.length === 10) {
        e164Phone = `+1${e164Phone}`;
      } else if (e164Phone.length === 11 && e164Phone.startsWith('1')) {
        e164Phone = `+${e164Phone}`;
      } else if (!e164Phone.startsWith('+') && e164Phone.length > 0) {
        e164Phone = `+${e164Phone}`;
      }
    }

    const payload = { ...data, phone: e164Phone };

    const response = await fetch(`${N8N_BASE_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to create contact: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get contact profile details
   */
  async getContactProfile(contactId: string) {
    if (!N8N_BASE_URL) throw new Error('N8N_WEBHOOK_URL is not configured');

    const url = `${N8N_BASE_URL}/contacts?id=${encodeURIComponent(contactId)}`;
    
    console.log(`[GHL] Fetching contact profile: ${contactId} at ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get contact profile: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Update contact with a delivery address
   * Uses the /contacts/update endpoint with full contact update body format
   * Fetches existing contact data first to preserve all fields, then merges address update
   */
  async updateContactAddress(contactId: string, address: AddressData) {
    if (!N8N_BASE_URL) throw new Error('N8N_WEBHOOK_URL is not configured');
    
    if (!address.address || !address.address.trim()) {
      throw new Error('Address is required');
    }

    // Fetch existing contact to preserve all fields
    let existingContact: any = {};
    try {
      const profileResponse = await this.getContactProfile(contactId);
      // Handle different response structures - could be { contact: {...} } or direct object
      existingContact = profileResponse.contact || profileResponse || {};
    } catch (error) {
      throw new Error(`Failed to fetch existing contact: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Use provided structured fields or fall back to parsing the address string
    let finalAddress1 = address.address;
    let finalCity = address.city;
    let finalState = address.state;
    let finalPostalCode = address.postalCode;

    if (!finalCity || !finalState) {
      const parsedAddress = parseAddress(address.address);
      finalAddress1 = parsedAddress.address1;
      finalCity = finalCity || parsedAddress.city || null;
      finalState = finalState || parsedAddress.state || null;
      finalPostalCode = finalPostalCode || parsedAddress.postalCode || null;
    }

    // Build update payload by merging existing contact data with new address fields
    const updatePayload: ContactUpdateData = {
      // Preserve existing contact fields
      firstName: existingContact.firstName || null,
      lastName: existingContact.lastName || null,
      name: existingContact.name || existingContact.firstName && existingContact.lastName 
        ? `${existingContact.firstName} ${existingContact.lastName}`.trim() 
        : null,
      email: existingContact.email || null,
      phone: existingContact.phone || null,
      website: existingContact.website || null,
      timezone: existingContact.timezone || null,
      dnd: existingContact.dnd,
      dndSettings: existingContact.dndSettings,
      inboundDndSettings: existingContact.inboundDndSettings,
      tags: existingContact.tags || [],
      customFields: existingContact.customFields || [],
      source: existingContact.source || null,
      dateOfBirth: existingContact.dateOfBirth || null,
      country: existingContact.country || 'US',
      assignedTo: existingContact.assignedTo || null,
      
      // Update address fields
      address1: finalAddress1,
      city: finalCity,
      state: finalState,
      postalCode: finalPostalCode,
    };

    // Send update request to /contacts/update endpoint
    const response = await fetch(`${N8N_BASE_URL}/contacts/update?contactId=${encodeURIComponent(contactId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to update contact address: ${response.status} ${errorText}`);
    }

    return response.json();
  },

  /**
   * Get orders by contact ID
   * Returns list of past orders/transactions for a contact
   */
  async getOrdersByContactId(contactId: string) {
    if (!N8N_BASE_URL) throw new Error('N8N_WEBHOOK_URL is not configured');

    try {
      const response = await fetch(`${N8N_BASE_URL}/orders?contactId=${encodeURIComponent(contactId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If API returns error, return empty array to allow flow to continue
        console.error(`Failed to get orders for contact ${contactId}: ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      
      // Handle different response structures
      // Could be { orders: [...] } or direct array [...]
      if (Array.isArray(data)) {
        return data;
      } else if (data.orders && Array.isArray(data.orders)) {
        return data.orders;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
      
      // If structure doesn't match expected format, return empty array
      return [];
    } catch (error) {
      // On error, return empty array to allow flow to continue
      console.error(`Error fetching orders for contact ${contactId}:`, error);
      return [];
    }
  }
};
