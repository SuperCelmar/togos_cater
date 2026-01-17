/**
 * Cashback Service
 * Manages cashback balance and transaction ledger in Supabase
 * Syncs balance to GHL custom field for marketing consistency
 */

import { supabase } from './supabase';

export interface CashbackTransaction {
  id?: string;
  contactId: string;
  type: 'earned' | 'redeemed';
  amount: number;
  orderId?: string;
  invoiceId?: string;
  description?: string;
  createdAt?: string;
}

export interface CashbackBalance {
  contactId: string;
  balance: number;
  updatedAt?: string;
}

/**
 * Get current cashback balance for a contact
 * Calculates from ledger transactions (source of truth)
 */
export async function getCashbackBalance(contactId: string): Promise<number> {
  try {
    // Get all transactions for this contact
    const { data: transactions, error } = await supabase
      .from('cashback_transactions')
      .select('type, amount')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Cashback] Error fetching transactions:', error);
      return 0;
    }

    if (!transactions || transactions.length === 0) {
      return 0;
    }

    // Calculate balance from transactions
    const balance = transactions.reduce((sum, tx) => {
      if (tx.type === 'earned') {
        return sum + tx.amount;
      } else if (tx.type === 'redeemed') {
        return sum - tx.amount;
      }
      return sum;
    }, 0);

    return Math.max(0, balance); // Ensure balance never goes negative
  } catch (error) {
    console.error('[Cashback] Error calculating balance:', error);
    return 0;
  }
}

/**
 * Record a cashback transaction and update balance
 */
export async function recordCashbackTransaction(
  transaction: CashbackTransaction
): Promise<CashbackTransaction | null> {
  try {
    const { data, error } = await supabase
      .from('cashback_transactions')
      .insert({
        contact_id: transaction.contactId,
        type: transaction.type,
        amount: transaction.amount,
        order_id: transaction.orderId || null,
        invoice_id: transaction.invoiceId || null,
        description: transaction.description || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[Cashback] Error recording transaction:', error);
      return null;
    }

    // Calculate new balance
    const newBalance = await getCashbackBalance(transaction.contactId);

    // Sync to GHL custom field
    await syncCashbackToGHL(transaction.contactId, newBalance);

    return {
      id: data.id,
      contactId: transaction.contactId,
      type: transaction.type,
      amount: transaction.amount,
      orderId: transaction.orderId,
      invoiceId: transaction.invoiceId,
      description: transaction.description,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('[Cashback] Error in recordCashbackTransaction:', error);
    return null;
  }
}

/**
 * Get cashback transaction history for a contact
 */
export async function getCashbackHistory(
  contactId: string,
  limit: number = 50
): Promise<CashbackTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('cashback_transactions')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Cashback] Error fetching history:', error);
      return [];
    }

    return (data || []).map((tx) => ({
      id: tx.id,
      contactId: tx.contact_id,
      type: tx.type,
      amount: tx.amount,
      orderId: tx.order_id,
      invoiceId: tx.invoice_id,
      description: tx.description,
      createdAt: tx.created_at,
    }));
  } catch (error) {
    console.error('[Cashback] Error in getCashbackHistory:', error);
    return [];
  }
}

/**
 * Sync cashback balance via n8n middleware
 * n8n is responsible for updating the GHL custom field
 */
export async function syncCashbackToGHL(
  contactId: string,
  balance: number
): Promise<boolean> {
  try {
    const viteN8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;
    const n8nBaseUrl = viteN8nWebhookUrl?.endsWith('/')
      ? viteN8nWebhookUrl.slice(0, -1)
      : viteN8nWebhookUrl;

    if (!n8nBaseUrl) {
      console.warn('[Cashback] N8N_WEBHOOK_URL is not configured, skipping sync');
      return false;
    }

    const payload = { contactId, balance };
    const response = await fetch(`${n8nBaseUrl}/cashback/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error(`[Cashback] n8n sync failed: ${response.status} ${errorText}`);
      return false;
    }

    console.log(`[Cashback] Synced balance ${balance} via n8n for contact ${contactId}`);

    return true;
  } catch (error) {
    console.error('[Cashback] Error syncing to GHL:', error);
    return false;
  }
}

/**
 * Earn cashback from an order
 */
export async function earnCashback(
  contactId: string,
  orderTotal: number,
  orderId?: string,
  invoiceId?: string
): Promise<number> {
  const cashbackAmount = orderTotal * 0.05; // 5% cashback
  
  const transaction = await recordCashbackTransaction({
    contactId,
    type: 'earned',
    amount: cashbackAmount,
    orderId,
    invoiceId,
    description: `Earned 5% cashback on order`,
  });

  if (!transaction) {
    return 0;
  }

  return cashbackAmount;
}

/**
 * Redeem cashback (apply to order)
 */
export async function redeemCashback(
  contactId: string,
  amount: number,
  orderId?: string,
  invoiceId?: string
): Promise<boolean> {
  // Verify sufficient balance
  const currentBalance = await getCashbackBalance(contactId);
  
  if (currentBalance < amount) {
    console.error(`[Cashback] Insufficient balance: ${currentBalance} < ${amount}`);
    return false;
  }

  const transaction = await recordCashbackTransaction({
    contactId,
    type: 'redeemed',
    amount,
    orderId,
    invoiceId,
    description: `Redeemed cashback on order`,
  });

  return transaction !== null;
}
