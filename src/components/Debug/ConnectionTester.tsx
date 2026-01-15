import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ghlService, ContactData, AddressData } from '../../services/ghl';

export const ConnectionTester: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [contactId, setContactId] = useState('');
  const [formData, setFormData] = useState<ContactData>({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '5551234567'
  });
  const [addressData, setAddressData] = useState<AddressData>({
    address: '123 Test Street, Suite 100, City, ST 12345',
    label: 'Office'
  });
  const [testInvoiceId, setTestInvoiceId] = useState('');

  const addLog = (msg: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = data 
      ? `[${timestamp}] ${msg}\n${JSON.stringify(data, null, 2)}`
      : `[${timestamp}] ${msg}`;
    setLogs(prev => [logEntry, ...prev]);
  };

  const handleTestSupabase = async () => {
    setLoading(true);
    addLog('Testing Supabase Connection...');
    try {
      const { data, error } = await supabase.from('test_connection').select('*').limit(1);
      
      // Error code '42P01' means the table doesn't exist, but we successfully talked to the DB!
      if (error) {
        if (error.code === '42P01') {
          addLog('✅ Supabase Connection Successful! (Reached the database, but "test_connection" table is missing as expected)');
        } else {
          addLog('Supabase Response (Error):', error);
        }
      } else {
        addLog('✅ Supabase Connection Successful!', data);
      }
    } catch (err) {
      addLog('❌ Supabase Connection Failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAuth = async () => {
    setLoading(true);
    addLog('Testing Supabase Auth...');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        addLog('Auth Check Failed:', error);
      } else {
        addLog('✅ Supabase Auth Initialized', data.session ? 'Session Active' : 'No active session (Expected)');
      }
    } catch (err: any) {
      addLog('Auth Check Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchContact = async () => {
    setLoading(true);
    addLog(`Searching Contact: ${formData.phone}...`);
    try {
      const result = await ghlService.searchContact(formData.phone);
      addLog('Search Result:', result);
      
      // Auto-fill contactId if found
      if (result && result.contacts && result.contacts.length > 0) {
        const id = result.contacts[0].id;
        setContactId(id);
        addLog(`💡 Found contact! ID ${id} copied to Profile test field.`);
      }
    } catch (err: any) {
      addLog('Search Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async () => {
    setLoading(true);
    addLog('Creating Contact...', formData);
    try {
      const result = await ghlService.createContact(formData);
      addLog('Create Result:', result);
      
      // Auto-fill contactId if created
      if (result && result.contact && result.contact.id) {
        setContactId(result.contact.id);
        addLog(`💡 Contact created! ID ${result.contact.id} copied to Profile test field.`);
      }
    } catch (err: any) {
      addLog('Create Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetProfile = async () => {
    if (!contactId) {
      addLog('❌ Error: Please enter a Contact ID first');
      return;
    }
    setLoading(true);
    addLog(`Fetching Profile: ${contactId}...`);
    try {
      const result = await ghlService.getContactProfile(contactId);
      addLog('Profile Result:', result);
    } catch (err: any) {
      addLog('Fetch Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    if (!contactId) {
      addLog('❌ Error: Please enter a Contact ID first');
      return;
    }
    if (!addressData.address.trim()) {
      addLog('❌ Error: Please enter an address');
      return;
    }
    setLoading(true);
    addLog(`Updating Address for Contact ${contactId}...`, addressData);
    try {
      const result = await ghlService.updateContactAddress(contactId, addressData);
      addLog('✅ Address Update Result:', result);
    } catch (err: any) {
      addLog('❌ Address Update Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetOrders = async () => {
    if (!contactId) {
      addLog('❌ Error: Please enter a Contact ID first');
      return;
    }
    setLoading(true);
    addLog(`Fetching Orders for Contact ${contactId}...`);
    try {
      const orders = await ghlService.getOrdersByContactId(contactId);
      if (orders && orders.length > 0) {
        addLog(`✅ Found ${orders.length} order(s) for this contact:`, orders);
        addLog(`💡 This contact would navigate to "welcome_back" screen`);
      } else {
        addLog(`ℹ️ No orders found for this contact (empty array)`);
        addLog(`💡 This contact would navigate to "new_customer" screen`);
      }
    } catch (err: any) {
      addLog('❌ Get Orders Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestCreateOrder = async () => {
    if (!contactId) {
      addLog('❌ Error: Please enter a Contact ID first');
      return;
    }
    setLoading(true);
    addLog(`🚀 Starting Sequential Order Test for $900.41 (Contact ${contactId})...`);
    try {
      // 1. Create Invoice
      const testPayload = {
        contactId,
        contact: {
            id: contactId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address1: addressData.address
        },
        items: [
          { id: 'mega-bundle-1', name: 'Catering Mega Bundle (Test)', price: 819.82, quantity: 1 }
        ],
        subtotal: 819.82,
        tax: 65.59,
        deliveryFee: 15.00,
        total: 900.41,
        paymentMethod: 'invoice',
        companyName: 'Acme Company',
        deliveryDetails: {
          address: '123 Acme Way',
          city: 'Roadrunner City',
          state: 'AZ',
          zip: '85001',
          date: '2026-01-20',
          time: '11:30 AM',
          specialInstructions: 'Sequential test order ($900.41)'
        }
      };
      
      addLog('Step 1: Creating Invoice...', testPayload);
      const invoiceResult = await ghlService.createInvoice(testPayload);
      addLog('✅ Invoice Created:', invoiceResult);
      
      // 2. Create Opportunity
      const oppPayload = {
        contactId,
        invoiceId: invoiceResult?.invoiceId || invoiceResult?.id,
        total: 900.41,
        companyName: 'Acme Company',
        deliveryDetails: testPayload.deliveryDetails
      };
      
      addLog('Step 2: Creating Opportunity...', oppPayload);
      const oppResult = await ghlService.createOpportunity(oppPayload);
      addLog('✅ Opportunity Created:', oppResult);
      
      addLog('✨ Sequential Test Complete!');
    } catch (err: any) {
      addLog('❌ Sequential Test Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSendInvoice = async () => {
    if (!testInvoiceId) {
      addLog('❌ Error: Please enter an Invoice ID');
      return;
    }
    setLoading(true);
    addLog(`Sending Invoice ${testInvoiceId}...`);
    try {
      const success = await ghlService.sendInvoice(testInvoiceId);
      if (success) {
        addLog('✅ Invoice send triggered successfully');
      } else {
        addLog('❌ Failed to trigger invoice send');
      }
    } catch (err: any) {
      addLog('❌ Error sending invoice', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Connection Tester</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Test Data</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                placeholder="First Name"
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
              />
              <input
                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
            <input
              className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
              placeholder="Email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <input
              className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
              placeholder="Phone (e.g. 5551234567)"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
            
            <div className="pt-2 border-t dark:border-zinc-700">
              <label className="text-xs font-bold text-slate-400 uppercase">Contact ID (for Profile/Address tests)</label>
              <input
                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 mt-1"
                placeholder="GHL Contact ID"
                value={contactId}
                onChange={e => setContactId(e.target.value)}
              />
            </div>
            
            <div className="pt-2 border-t dark:border-zinc-700">
              <label className="text-xs font-bold text-slate-400 uppercase">Address Test Data</label>
              <input
                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 mt-1"
                placeholder="Full Address"
                value={addressData.address}
                onChange={e => setAddressData({...addressData, address: e.target.value})}
              />
              <input
                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 mt-2"
                placeholder="Label (e.g., Office, Home)"
                value={addressData.label || ''}
                onChange={e => setAddressData({...addressData, label: e.target.value})}
              />
            </div>
            
            <div className="pt-2 border-t dark:border-zinc-700">
              <label className="text-xs font-bold text-slate-400 uppercase">Invoice Test Data</label>
              <input
                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700 mt-1"
                placeholder="Invoice ID"
                value={testInvoiceId}
                onChange={e => setTestInvoiceId(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleTestSupabase}
                disabled={loading}
                className="py-2 px-4 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium"
              >
                Ping Supabase
              </button>
              <button
                onClick={handleTestAuth}
                disabled={loading}
                className="py-2 px-4 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50 text-sm font-medium"
              >
                Ping Auth
              </button>
            </div>
            <button
              onClick={handleSearchContact}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              Search GHL Contact
            </button>
            <button
              onClick={handleCreateContact}
              disabled={loading}
              className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              Create GHL Contact
            </button>
            <button
              onClick={handleGetProfile}
              disabled={loading || !contactId}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              Get GHL Profile
            </button>
            <button
              onClick={handleGetOrders}
              disabled={loading || !contactId}
              className="w-full py-2 px-4 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50 font-medium"
            >
              Get Contact Orders
            </button>
            <button
              onClick={handleUpdateAddress}
              disabled={loading || !contactId}
              className="w-full py-2 px-4 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 font-medium"
            >
              Update GHL Address
            </button>
            <button
              onClick={handleTestCreateOrder}
              disabled={loading || !contactId}
              className="w-full py-2 px-4 bg-rose-600 text-white rounded hover:bg-rose-700 disabled:opacity-50 font-medium"
            >
              Test Sequential Order ($900.41)
            </button>
            <button
              onClick={handleTestSendInvoice}
              disabled={loading || !testInvoiceId}
              className="w-full py-2 px-4 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50 font-medium"
            >
              Send Invoice (Webhook)
            </button>
            <button
              onClick={() => setLogs([])}
              className="w-full py-2 px-4 bg-slate-500 text-white rounded hover:bg-slate-600 font-medium"
            >
              Clear Logs
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">Live Logs</h3>
          <div className="bg-slate-950 text-emerald-400 font-mono text-sm p-4 rounded-lg h-96 overflow-y-auto whitespace-pre-wrap">
            {logs.length === 0 ? '// Ready to test...' : logs.join('\n\n')}
          </div>
        </div>
      </div>
    </div>
  );
};
