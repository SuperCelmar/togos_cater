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

/**
 * Format a phone number to E.164 format (+1XXXXXXXXXX)
 */
function formatPhoneE164(phone: string): string {
  if (!phone) return '';
  
  // Remove non-digits
  let cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 0) return '';
  
  // Handle different lengths
  if (cleanPhone.length === 10) {
    return `+1${cleanPhone}`;
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return `+${cleanPhone}`;
  } else if (!cleanPhone.startsWith('+')) {
    return `+${cleanPhone}`;
  }
  
  return cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
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
      searchTerm = formatPhoneE164(query);
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

    const e164Phone = formatPhoneE164(data.phone);
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
   * Update contact profile details (name, email, phone, address, etc.)
   * Preserves existing fields and only updates provided values.
   */
  async updateContactProfile(contactId: string, updates: ContactUpdateData) {
    if (!N8N_BASE_URL) throw new Error('N8N_WEBHOOK_URL is not configured');

    // Fetch existing contact to preserve all fields
    let existingContact: any = {};
    try {
      const profileResponse = await this.getContactProfile(contactId);
      existingContact = profileResponse.contact || profileResponse || {};
    } catch (error) {
      throw new Error(`Failed to fetch existing contact: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const basePayload: ContactUpdateData = {
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
      address1: existingContact.address1 || null,
      city: existingContact.city || null,
      state: existingContact.state || null,
      postalCode: existingContact.postalCode || null,
    };

    const mergedPayload: ContactUpdateData = {
      ...basePayload,
      ...updates,
    };

    if (updates.phone !== undefined) {
      mergedPayload.phone = updates.phone ? formatPhoneE164(updates.phone) : null;
    }

    if ((updates.firstName !== undefined || updates.lastName !== undefined) && updates.name === undefined) {
      const nextFirst = updates.firstName !== undefined ? updates.firstName || '' : basePayload.firstName || '';
      const nextLast = updates.lastName !== undefined ? updates.lastName || '' : basePayload.lastName || '';
      const nextName = `${nextFirst} ${nextLast}`.trim();
      mergedPayload.name = nextName || null;
    }

    const response = await fetch(`${N8N_BASE_URL}/contacts/update?contactId=${encodeURIComponent(contactId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mergedPayload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to update contact profile: ${response.status} ${errorText}`);
    }

    return response.json();
  },

  /**
   * Update contact custom field (e.g., loyalty balance)
   */
  async updateContactCustomField(contactId: string, fieldId: string, value: any) {
    if (!N8N_BASE_URL) throw new Error('N8N_WEBHOOK_URL is not configured');

    // Fetch existing contact to preserve all fields
    let existingContact: any = {};
    try {
      const profileResponse = await this.getContactProfile(contactId);
      existingContact = profileResponse.contact || profileResponse || {};
    } catch (error) {
      throw new Error(`Failed to fetch existing contact: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Get existing custom fields
    const existingCustomFields = existingContact.customFields || [];
    
    // Find if field already exists and update it, otherwise add it
    const fieldIndex = existingCustomFields.findIndex((cf: any) => 
      cf.id === fieldId || cf.fieldId === fieldId || cf.key === fieldId
    );

    let updatedCustomFields;
    if (fieldIndex >= 0) {
      // Update existing field
      updatedCustomFields = [...existingCustomFields];
      updatedCustomFields[fieldIndex] = {
        ...updatedCustomFields[fieldIndex],
        value: value,
      };
    } else {
      // Add new field
      updatedCustomFields = [
        ...existingCustomFields,
        { id: fieldId, value: value }
      ];
    }

    // Build update payload
    const updatePayload: ContactUpdateData = {
      firstName: existingContact.firstName || null,
      lastName: existingContact.lastName || null,
      name: existingContact.name || (existingContact.firstName && existingContact.lastName 
        ? `${existingContact.firstName} ${existingContact.lastName}`.trim() 
        : null),
      email: existingContact.email || null,
      phone: existingContact.phone || null,
      website: existingContact.website || null,
      timezone: existingContact.timezone || null,
      dnd: existingContact.dnd,
      dndSettings: existingContact.dndSettings,
      inboundDndSettings: existingContact.inboundDndSettings,
      tags: existingContact.tags || [],
      customFields: updatedCustomFields,
      source: existingContact.source || null,
      dateOfBirth: existingContact.dateOfBirth || null,
      country: existingContact.country || 'US',
      assignedTo: existingContact.assignedTo || null,
      address1: existingContact.address1 || null,
      city: existingContact.city || null,
      state: existingContact.state || null,
      postalCode: existingContact.postalCode || null,
    };

    // Send update request
    const response = await fetch(`${N8N_BASE_URL}/contacts/update?contactId=${encodeURIComponent(contactId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to update custom field: ${response.status} ${errorText}`);
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
      
      let rawOrders: any[] = [];
      // Handle different response structures
      if (Array.isArray(data)) {
        rawOrders = data;
      } else if (data.orders && Array.isArray(data.orders)) {
        rawOrders = data.orders;
      } else if (data.invoices && Array.isArray(data.invoices)) {
        rawOrders = data.invoices;
      } else if (data.data && Array.isArray(data.data)) {
        rawOrders = data.data;
      }
      
      // Map to GHLOrder interface
      return rawOrders.map((o: any) => ({
        id: o._id || o.id,
        invoiceNumber: o.invoiceNumber,
        contactId: o.contactDetails?.id || o.contactId,
        status: o.status,
        totalAmount: o.total !== undefined ? o.total : o.totalAmount,
        createdAt: o.createdAt,
        items: (o.invoiceItems || o.items || []).map((i: any) => ({
          name: i.name,
          quantity: i.qty || i.quantity,
          price: i.amount || i.price
        })),
        deliveryAddress: o.contactDetails?.address 
          ? [
              o.contactDetails.address.addressLine1, 
              o.contactDetails.address.city, 
              o.contactDetails.address.state
            ].filter(Boolean).join(', ') 
          : o.deliveryAddress,
        deliveryDate: o.dueDate, // approximation
      }));
    } catch (error) {
      // On error, return empty array to allow flow to continue
      console.error(`Error fetching orders for contact ${contactId}:`, error);
      return [];
    }
  },

  /**
   * Send invoice to customer
   */
  async sendInvoice(invoiceId: string) {
    if (!N8N_BASE_URL) throw new Error('N8N_WEBHOOK_URL is not configured');
    
    console.log(`[GHL] Sending invoice: ${invoiceId}`);
    
    const response = await fetch(`${N8N_BASE_URL}/invoices/send?invoice_id=${encodeURIComponent(invoiceId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to send invoice: ${response.statusText}`);
      return false;
    }

    return true;
  },

  /**
   * Create a new invoice (triggers n8n workflow for Invoice creation)
   */
  async createInvoice(payload: {
    contactId: string;
    contact?: any; // Added to support full invoice details
    items: any[];
    subtotal: number;
    tax: number;
    deliveryFee: number;
    total: number;
    paymentMethod: string;
    companyName: string;
    deliveryDetails: any;
  }) {
    if (!N8N_BASE_URL) throw new Error('N8N_WEBHOOK_URL is not configured');

    console.log(`[GHL] Creating invoice for contact: ${payload.contactId}`);

    // Construct the detailed JSON body based on the guideline
    const invoiceBody = {
      altId: "",
      altType: "location",
      name: `Catering Order - ${new Date().toLocaleDateString()}`,
      businessDetails: {
        logoUrl: "https://storage.googleapis.com/msgsndr/6ZTST3Tqvk92LsqppK5t/media/689f48fa1962bbc059fa4053.png",
        name: "Togo's Sandwiches",
        phoneNo: "+1 310-214-8222",
        address: {
          addressLine1: "20022 hawthorne blvd",
          addressLine2: "",
          city: "Torrance",
          state: "CA",
          countryCode: "US",
          postalCode: "90503"
        },
        website: "https://www.togos.com",
        customValues: []
      },
      currency: "USD",
      items: payload.items.map(item => ({
        name: item.name,
        description: item.specialInstructions || item.name,
        productId: item.id || "6578278e879ad2646715ba9c",
        priceId: item.id || "6578278e879ad2646715ba9c",
        currency: "USD",
        amount: item.price,
        qty: item.quantity,
        taxes: [],
        automaticTaxCategoryId: "6578278e879ad2646715ba9c",
        isSetupFeeItem: false,
        type: "one_time",
        taxInclusive: false
      })),
      discount: {
        value: 0,
        type: "percentage",
        validOnProductIds: []
      },
      termsNotes: "<p>Thank you for your business!</p>",
      title: "INVOICE",
      contactDetails: {
        id: payload.contactId,
        name: payload.contact?.name || (payload.contact?.firstName && payload.contact?.lastName ? `${payload.contact.firstName} ${payload.contact.lastName}` : "Valued Customer"),
        phoneNo: formatPhoneE164(payload.contact?.phone) || "",
        email: payload.contact?.email || "",
        additionalEmails: [],
        companyName: payload.companyName || payload.contact?.companyName || "N/A",
        address: {
            addressLine1: payload.deliveryDetails?.address || payload.contact?.address1 || "",
            addressLine2: "",
            city: payload.deliveryDetails?.city || payload.contact?.city || "",
            state: payload.deliveryDetails?.state || payload.contact?.state || "",
            countryCode: "US",
            postalCode: payload.deliveryDetails?.zip || payload.contact?.postalCode || ""
        },
        customFields: []
      },
      invoiceNumber: Math.floor(Date.now() / 1000).toString(),
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: payload.deliveryDetails?.date ? new Date(payload.deliveryDetails.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      sentTo: {
        email: payload.contact?.email ? [payload.contact.email] : [],
        emailCc: [],
        emailBcc: [],
        phoneNo: payload.contact?.phone ? [formatPhoneE164(payload.contact.phone)] : []
      },
      liveMode: true,
      automaticTaxesEnabled: true,
      lateFeesConfiguration: {
        enable: true,
        value: 10,
        type: "fixed",
        frequency: {
          intervalCount: 10,
          interval: "day"
        },
        grace: {
          intervalCount: 10,
          interval: "day"
        },
        maxLateFees: {
          type: "fixed",
          value: 10
        }
      },
      tipsConfiguration: {
        tipsPercentage: [5, 10, 15],
        tipsEnabled: true
      },
      invoiceNumberPrefix: "INV-",
      paymentMethods: {
        stripe: {
          enableBankDebitOnly: false
        }
      },
      attachments: [],
      miscellaneousCharges: {
        charges: [],
        collectedMiscellaneousCharges: 0,
        paidCharges: []
      }
    };
    
    // Add Delivery Fee as an item if exists
    if (payload.deliveryFee > 0) {
        invoiceBody.items.push({
            name: "Delivery Fee",
            description: "Delivery Service",
            productId: "delivery-fee-id",
            priceId: "delivery-fee-id",
            currency: "USD",
            amount: payload.deliveryFee,
            qty: 1,
            taxes: [],
            automaticTaxCategoryId: "6578278e879ad2646715ba9c",
            isSetupFeeItem: false,
            type: "one_time",
            taxInclusive: false
        });
    }

    const response = await fetch(`${N8N_BASE_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceBody),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to create invoice: ${response.status} ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return { success: true, text: await response.text() };
  },

  /**
   * Create a new opportunity (triggers n8n workflow for Opportunity tracking)
   */
  async createOpportunity(payload: {
    contactId: string;
    invoiceId?: string;
    total: number;
    companyName: string;
    deliveryDetails: any;
  }) {
    if (!N8N_BASE_URL) throw new Error('N8N_WEBHOOK_URL is not configured');

    console.log(`[GHL] Creating opportunity for contact: ${payload.contactId}`);

    const response = await fetch(`${N8N_BASE_URL}/opportunities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Failed to create opportunity: ${response.status} ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return { success: true, text: await response.text() };
  }
};
