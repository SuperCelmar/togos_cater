-- Cashback System Migration
-- Creates tables for cashback ledger and balance tracking

-- Cashback Transactions Table
-- Stores all cashback earnings and redemptions
CREATE TABLE IF NOT EXISTS cashback_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  order_id TEXT,
  invoice_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT valid_type CHECK (type IN ('earned', 'redeemed'))
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_cashback_transactions_contact_id ON cashback_transactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_cashback_transactions_created_at ON cashback_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cashback_transactions_order_id ON cashback_transactions(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cashback_transactions_invoice_id ON cashback_transactions(invoice_id) WHERE invoice_id IS NOT NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE cashback_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own transactions
CREATE POLICY "Users can view their own cashback transactions"
  ON cashback_transactions
  FOR SELECT
  USING (
    contact_id IN (
      SELECT contact_id 
      FROM user_sessions 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: System can insert transactions (via service role)
-- Note: In production, you may want to restrict this further
CREATE POLICY "Service can insert cashback transactions"
  ON cashback_transactions
  FOR INSERT
  WITH CHECK (true);

-- Optional: Create a view for current balances (computed from transactions)
CREATE OR REPLACE VIEW cashback_balances AS
SELECT 
  contact_id,
  COALESCE(SUM(
    CASE 
      WHEN type = 'earned' THEN amount
      WHEN type = 'redeemed' THEN -amount
      ELSE 0
    END
  ), 0) AS balance,
  MAX(created_at) AS last_updated_at
FROM cashback_transactions
GROUP BY contact_id;

-- Grant access to authenticated users
GRANT SELECT ON cashback_transactions TO authenticated;
GRANT SELECT ON cashback_balances TO authenticated;
