Here is the technical mapping of our Togos Cater App Features to the specific GoHighLevel (GHL) API 2.0 endpoints.

Since we are using Supabase for the "missing pieces," those sections are marked as Hybrid (Supabase + GHL).

## 1. Authentication & Onboarding

**Goal**: Log the user in and link them to a GHL Contact.

| App Feature | GHL API Endpoint | Implementation Note |
| :--- | :--- | :--- |
| **Check if User Exists** | `GET /contacts/search?query=+15551234567` | Search by phone number formatted as E.164. |
| **Create New User** | `POST /contacts/` | If search returns null, create new contact. Send: `firstName`, `lastName`, `phone`, `email`. |
| **Get Profile** | `GET /contacts/{contactId}` | Returns name, company, and **Custom Fields** (Loyalty Balance). |
| **OTP Verification** | *None (Use Supabase Auth)* | GHL does not have a "Send OTP" API for end-users. Use Supabase Auth for login, then match the phone number to the GHL Contact ID. |

## 2. Menu Browsing (Products)
**Goal**: Display categories and items.

| App Feature | GHL API Endpoint | Implementation Note |
| :--- | :--- | :--- |
| **Get All Items** | `GET /products/?locationId={id}` | Fetches all products. **Note:** GHL does not have a "Categories" endpoint. You must use `tags` on the product (e.g., tag="Sandwiches") to filter them on the frontend. |
| **Get Item Prices** | `GET /products/{productId}/price` | You must fetch the price ID separately to get the actual dollar amount (`amount`, `currency`). |
| **Item Image** | *In Product Response* | The `image` URL is returned in the `GET /products` response. |

## 3. Ordering & Checkout
**Goal**: Create an order and process payment.

| App Feature | GHL API Endpoint | Implementation Note |
| :--- | :--- | :--- |
| **Create Order** | `POST /invoices/` | **Recommended:** Create an Invoice in "Draft" or "Sent" mode. This creates the record of items, prices, and taxes linked to the Contact. |
| **Process Payment** | `POST /payments/orders` | Use the specific payment integration provider ID. Alternatively, use `POST /invoices/{id}/send` to email/SMS a payment link if you don't want to handle CC processing directly in-app. |
| **Track Order Stage** | `POST /opportunities/` | Create an Opportunity in a specific Pipeline (e.g., "Catering Pipeline") stage (e.g., "New Order"). This helps the kitchen track status. |

## 4. Order History
**Goal:** Show past orders and reorder.

| App Feature | GHL API Endpoint | Implementation Note |
| :--- | :--- | :--- |
| **List Orders** | `GET /payments/orders?contactId={id}` | Returns a list of past transactions. |
| **Order Details** | `GET /payments/orders/{orderId}` | Returns specific line items (Sandwich type, quantity) needed for the "Reorder" button. |

## 5. Invoices & Receipts
**Goal:** Download PDFs.

| App Feature | GHL API Endpoint | Implementation Note |
| :--- | :--- | :--- |
| **List Invoices** | `GET /invoices/?contactId={id}` | Returns list of invoices with status (Paid/Due). |
| **Get PDF Link** | `GET /invoices/{invoiceId}` | The response includes a `pdfUrl` field you can hotlink to the "Download" button. |


## 6. Hybrid Features (Supabase + GHL)

## A. Loyalty System (Cashback)

**Frontend Action:** User sees balance / Redeems cashback at checkout.  
**Supabase:** Stores the complete transaction ledger in `cashback_transactions` table.

### Implementation Details

**Database Schema:**
- `cashback_transactions` table stores all earnings and redemptions
- Balance is calculated from transaction ledger (source of truth)
- Each transaction links to `order_id` and `invoice_id` for audit trail

**Cashback Rules:**
- Users earn 5% cashback on every completed order
- Cashback is earned on order total (subtotal + tax + delivery fee) before any discounts
- Cashback can be redeemed at checkout to reduce order total
- Balance never expires

**Service Layer:**
- `src/lib/cashbackService.ts` - Handles all cashback operations
  - `getCashbackBalance()` - Calculates balance from ledger
  - `earnCashback()` - Records earnings transaction
  - `redeemCashback()` - Records redemption transaction
  - `getCashbackHistory()` - Fetches transaction history
  - `syncCashbackToGHL()` - Syncs balance to GHL custom field

**GHL Integration:**
| GHL Connection | Details |
| :--- | :--- |
| **Endpoint** | `POST /contacts/update?contactId={id}` |
| **Method** | `ghlService.updateContactCustomField()` |
| **Payload** | `{ "customFields": [ { "id": "VITE_GHL_LOYALTY_FIELD_ID", "value": 450 } ] }` |
| **Logic** | After every transaction (earn/redeem), balance is synced to GHL custom field so marketing emails show correct balance. |
| **Environment Variable** | `VITE_GHL_LOYALTY_FIELD_ID` - Must be configured with GHL custom field ID |

**UI Integration:**
- Balance loads automatically on session initialization (`AppContext`)
- Checkout screen allows applying cashback balance
- Loyalty screen displays transaction history from ledger
- Order success screen shows earned cashback

---

## B. Multiple Addresses

**Frontend Action:** User selects "Warehouse" address.  
**Supabase:** Stores `id`, `street`, `label` ("Warehouse").

| GHL Connection | Details |
| :--- | :--- |
| **Endpoint** | `PUT /contacts/{contactId}` |
| **Logic** | When the user selects an address in the App Checkout, update the **Primary Address** fields in GHL immediately before creating the Invoice. This ensures the Invoice generated by GHL has the correct shipping address for that specific order. |

---

## C. Scheduled Orders

**Frontend Action:** User books for "Next Thursday".  
**Supabase:** Stores the recurring rule (CRON).

| GHL Connection | Details |
| :--- | :--- |
| **Endpoint** | `POST /calendars/events/appointments` |
| **Logic** | Create a calendar appointment for the delivery time. This puts it on the internal GHL Calendar for the dispatch team to see. |

# Summary Checklist for Launch

[] Supabase Auth is configured.
[] GHL Contact Custom Field created for Loyalty Balance.
[] GHL Products are tagged (e.g., "Sandwich", "Drink") for filtering.
[] GHL Pipeline created (e.g., "Catering Orders") for Opportunity tracking.
[] GHL Calendar created (e.g., "Catering Deliveries") for scheduling.
lightbulb_tips
