const N8N_BASE_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
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
    
    const response = await fetch(`${N8N_BASE_URL}/contacts/search?q=${encodeURIComponent(searchTerm)}`, {
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

    // Ensure phone is E.164 for creation too
    let e164Phone = data.phone.replace(/\D/g, '');
    if (e164Phone.length === 10) {
      e164Phone = `+1${e164Phone}`;
    } else if (e164Phone.length === 11 && e164Phone.startsWith('1')) {
      e164Phone = `+${e164Phone}`;
    } else if (!e164Phone.startsWith('+') && e164Phone.length > 0) {
      e164Phone = `+${e164Phone}`;
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

    const response = await fetch(`${N8N_BASE_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: contactId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get contact profile: ${response.statusText}`);
    }

    return response.json();
  }
};
