# Cashback System Documentation

## Overview

The cashback system provides users with 5% cashback on every order, which can be redeemed on future orders. The system maintains a complete audit trail of all transactions and syncs balances to GoHighLevel (GHL) for marketing consistency.

## Goals

1. **Reward Loyalty**: Provide 5% cashback on every completed order
2. **Persistent Balance**: Store balance in Supabase ledger (source of truth)
3. **GHL Sync**: Keep GHL custom field updated for marketing emails
4. **Complete Audit Trail**: Track all earnings and redemptions with order/invoice links
5. **User Experience**: Seamless redemption at checkout, clear history display

## Current State

### ✅ Implemented Features

1. **Database Layer**
   - `cashback_transactions` table in Supabase
   - Transaction ledger with type (earned/redeemed), amount, order/invoice links
   - Balance calculated from ledger (never stored directly)

2. **Service Layer** (`src/lib/cashbackService.ts`)
   - `getCashbackBalance()` - Calculates balance from transactions
   - `earnCashback()` - Records 5% earnings on order completion
   - `redeemCashback()` - Records redemption when applied at checkout
   - `getCashbackHistory()` - Fetches transaction history
   - `syncCashbackToGHL()` - Syncs balance to GHL custom field

3. **UI Integration**
   - Balance loads automatically on session initialization
   - Checkout screen shows cashback application option
   - Loyalty screen displays transaction history
   - Order success screen shows earned cashback

4. **GHL Integration**
   - `ghlService.updateContactCustomField()` method added
   - Balance synced after every transaction
   - Requires `VITE_GHL_LOYALTY_FIELD_ID` environment variable

### ⚠️ Missing/Incomplete Parts

1. **Database Migration**
   - SQL migration file created but not yet applied to Supabase
   - Location: `docs/supabase_migrations/cashback_system.sql`
   - **Action Required**: Run migration in Supabase dashboard

2. **GHL Custom Field Setup**
   - Custom field must be created in GHL
   - Field ID must be added to `.env` as `VITE_GHL_LOYALTY_FIELD_ID`
   - **Action Required**: Create field and configure environment variable

3. **Error Handling**
   - Cashback operations continue even if GHL sync fails (graceful degradation)
   - Consider adding retry logic for failed GHL syncs

4. **Testing**
   - Unit tests for cashback calculations
   - Integration tests for ledger operations
   - E2E tests for checkout flow with cashback

## Architecture

### Data Flow

```
User completes order
  ↓
Checkout records redemption (if applied)
  ↓
Invoice created in GHL
  ↓
Cashback earned (5% of order total)
  ↓
Transaction recorded in Supabase ledger
  ↓
Balance calculated from ledger
  ↓
Balance synced to GHL custom field
  ↓
UI updated with new balance
```

### Database Schema

```sql
cashback_transactions
  - id (UUID, primary key)
  - contact_id (TEXT, indexed)
  - type (TEXT: 'earned' | 'redeemed')
  - amount (DECIMAL)
  - order_id (TEXT, nullable)
  - invoice_id (TEXT, nullable)
  - description (TEXT, nullable)
  - created_at (TIMESTAMPTZ)
```

### Key Files

- `src/lib/cashbackService.ts` - Core cashback logic
- `src/context/AppContext.tsx` - Balance loading on session init
- `src/screens/OrderScreens.tsx` - Checkout and redemption logic
- `src/screens/ManagementScreens.tsx` - Loyalty history display
- `src/services/ghl.ts` - GHL custom field sync
- `docs/supabase_migrations/cashback_system.sql` - Database schema

## Usage Examples

### Earning Cashback

```typescript
import { earnCashback } from '../lib/cashbackService';

// After order completion
const cashbackEarned = await earnCashback(
  contactId,
  orderTotal, // e.g., 100.00
  orderId,    // optional
  invoiceId   // optional
);
// Returns: 5.00 (5% of 100.00)
```

### Redeeming Cashback

```typescript
import { redeemCashback } from '../lib/cashbackService';

// At checkout
const redeemed = await redeemCashback(
  contactId,
  amountToRedeem, // e.g., 10.00
  orderId,        // optional
  invoiceId       // optional
);
// Returns: true if successful, false if insufficient balance
```

### Getting Balance

```typescript
import { getCashbackBalance } from '../lib/cashbackService';

const balance = await getCashbackBalance(contactId);
// Returns: current balance calculated from ledger
```

## Configuration

### Environment Variables

- `VITE_GHL_LOYALTY_FIELD_ID` - GHL custom field ID for loyalty balance (required for GHL sync)

### Supabase Setup

1. Run migration: `docs/supabase_migrations/cashback_system.sql`
2. Verify RLS policies are active
3. Test insert/select operations

### GHL Setup

1. Create custom field in GHL for "Loyalty Balance" (number type)
2. Copy field ID
3. Add to `.env.local`: `VITE_GHL_LOYALTY_FIELD_ID=your_field_id`

## Future Enhancements

1. **Cashback Expiration**: Add expiration dates for earned cashback
2. **Tiered Rewards**: Different percentages based on order frequency/amount
3. **Bonus Promotions**: Special earning multipliers for campaigns
4. **Referral Rewards**: Earn cashback for referring new customers
5. **Analytics Dashboard**: Track cashback trends and redemption rates
