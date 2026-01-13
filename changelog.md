# Changelog

## 2026-01-12 (Order & Invoice Integration - Sequential Flow)

### Enhanced - Sequential Invoice & Opportunity Creation
- Refactored order creation flow to perform two sequential calls to n8n: `POST /invoices` followed by `POST /opportunities`.
- Renamed `ghlService.createOrder()` to `ghlService.createInvoice()` and added `ghlService.createOpportunity()`.
- Updated `CheckoutScreen` to implement the sequential creation logic, ensuring opportunities are linked to invoices.
- Added a dedicated "Test Sequential Order ($900.41)" button to the `ConnectionTester` debug panel.
- Configured the test order with specific items, tax, and delivery fees to reach the exact total of $900.41 as requested.
- Updated debug logs to show step-by-step progress of the sequential creation flow.

---

## 2026-01-12 (Order & Invoice Integration)

### Added - Order Creation & GHL Invoice/Opportunity Flow
- Implemented `ghlService.createOrder()` to trigger n8n workflows for creating GoHighLevel Invoices and Opportunities.
- Added state management for `paymentMethod` and `invoiceCompanyName` to `CheckoutScreen`.
- Updated `CheckoutScreen` to send complete order payload (items, totals, payment info, delivery details) to n8n on order completion.
- Added "Test Create Order" button to `ConnectionTester` debug panel to verify n8n connection with sample order data.
- Improved address sync logic during checkout to ensure contact address is updated before order creation.

### Files Modified
- `src/services/ghl.ts` - Added `createOrder` method.
- `src/screens/OrderScreens.tsx` - Enhanced `CheckoutScreen` with payment state and order creation logic.
- `src/components/Debug/ConnectionTester.tsx` - Added order creation test functionality.

---

## 2026-01-12 (Cart UI Enhancements)

### Enhanced - Item Images in Cart and Order Success
- Updated `CartScreen` in `src/screens/OrderScreens.tsx` to display item thumbnails (16x16) on the left side of each cart item.
- Updated `OrderSuccessScreen` in `src/screens/OrderScreens.tsx` to display item thumbnails (10x10) in the order summary list.
- Implemented `PLACEHOLDER_IMAGE` fallback for items without images or when image loading fails.
- Adjusted layout spacing and typography to accommodate thumbnails while maintaining a clean, modern look.

### Files Modified
- `src/screens/OrderScreens.tsx` - Added thumbnails to `CartScreen` and `OrderSuccessScreen`.

---

## 2026-01-12 (Delivery Address UX Improvements)

### Fixed - Auto-Fill Message Hides on User Edit
- Added `userHasEdited` state to `DeliverySetupScreen` to track when user modifies address fields
- Updated `wasAutoFilled` condition to only show "Address auto-filled from your profile" message when address was actually auto-filled AND user hasn't started editing
- Message now disappears as soon as user types in any address field (street, city, state, or ZIP)

### Enhanced - Save Address to GHL on "Build My Order"
- Added `contactId` to `DeliverySetupScreen` context destructuring
- Integrated `ghlService.updateContactAddress()` call in `handleContinue` to sync delivery address to Go High Level when user clicks "Build My Order"
- Address save is non-blocking - flow continues even if GHL save fails (error is logged)
- Structured address data (street, city, state, postalCode) sent to GHL for proper field mapping

### Files Modified
- `src/screens/AuthScreens.tsx` - Updated `DeliverySetupScreen` with user edit tracking and GHL address save

---

## 2026-01-12 (Enhanced Catering Recommendations)

### Enhanced - Smart Cart Auto-Population from Recommendations
- Created `getRecommendationWithItems()` in `src/lib/cateringRecommendations.ts` that fetches real menu items from Supabase
- Added `EnhancedRecommendationItem` and `EnhancedCateringRecommendation` interfaces for typed recommendations with actual `MenuItem` objects
- Implemented intelligent name matching with fallback patterns to match recommendation names to Supabase items
- Added `getAllCateringItems()` function to `src/lib/menuService.ts` for fetching all catering items at once

### Enhanced - Automatic Cart Population on Delivery Setup
- Added `populateCartFromRecommendation()` method to `AppContext` for bulk cart population from recommendations
- Modified `DeliverySetupScreen` to auto-populate cart when:
  - Cart is empty AND guest count is set
  - Fetches enhanced recommendations with real menu items
  - Automatically navigates to `/cart` instead of `/menu` after populating
- Added loading state with "Building Your Order..." spinner during recommendation fetch
- Dynamic button text: "Build My Order" when cart is empty, "Continue to Menu" when cart has items

### Enhanced - Cart Indicators on Category Pages
- Updated `CategoryDetailScreen` to show cart quantity badges on menu items
- Items in cart now display:
  - Orange ring/border highlight
  - Quantity badge on the item image (top-right corner)
  - "X in cart" text label below the serves info
- Added cart badge to header shopping bag icon showing total items in cart

### Files Modified
- `src/lib/cateringRecommendations.ts` - Added enhanced recommendation engine with Supabase integration
- `src/lib/menuService.ts` - Added `getAllCateringItems()` function
- `src/context/AppContext.tsx` - Added `populateCartFromRecommendation()` method
- `src/screens/AuthScreens.tsx` - Updated `DeliverySetupScreen` with auto-population logic
- `src/screens/HomeScreens.tsx` - Added cart indicators to `CategoryDetailScreen`

---

## 2026-01-12 (Late Night Update - Part 3)

### Enhanced - Address Persistence to Local Storage
- Implemented persistent storage for delivery address details in `src/lib/storage.ts`.
- Added `saveDeliveryAddress`, `getDeliveryAddress`, and `clearDeliveryAddress` utility functions.
- Updated `AppContextProvider` in `src/context/AppContext.tsx` to:
  - Automatically save contact address to local storage when a session is established.
  - Persist manually entered delivery details to local storage.
  - Initialize `deliveryDetails` state from local storage on app startup.
  - Clear stored address on session logout.
- Enhanced `DeliverySetupScreen` in `src/screens/AuthScreens.tsx` to pre-fill fields using the cached address from local storage.
- Improved "Address auto-filled" notification logic to show when fields are populated from either GHL profile or local storage.

## 2026-01-12 (Late Night Update - Part 2)

### Fixed - Category Item Cards UI Refactor
- Refactored `CategoryDetailScreen` in `src/screens/HomeScreens.tsx` to use a horizontal "row card" layout instead of vertical cards.
- Fixed the issue where menu items appeared as "thin black lines" by ensuring fixed dimensions for images (`w-24 h-24`) and flexible text containers.
- Enhanced item metadata display with smaller, better-spaced typography (Name, Price, Serves, Description).
- Added a chevron icon to each row to indicate interactivity.
- Maintained existing `onError` fallbacks for images and null-safety for item data.

## 2026-01-12 (Late Night Update)

### SEO-Friendly Category URLs
- Modified category routing to use lowercased category names (slugs) instead of UUIDs in the URL path.
- Example: `/menu/category/1154ccdf-4d76-4333-b389-5d37b223c920` -> `/menu/category/sandwiches`
- Updated `src/lib/menuService.ts` with `getCategoryBySlug(slug: string)` to resolve slugs to category objects.
- Updated `src/routes.tsx` to use `:categorySlug` parameter.
- Updated `MenuScreen` in `src/screens/HomeScreens.tsx` to generate slugs for navigation.
- Updated `CategoryDetailScreen` in `src/screens/HomeScreens.tsx` to fetch category data using the slug from URL parameters.

### Major Refactor - React Router Implementation

Refactored the entire app from a single-page switch-based navigation system to use React Router v7 with proper URL paths for each screen. This enables browser history navigation, shareable URLs, and a more standard React architecture.

#### New Dependencies
- Added `react-router` v7 for declarative routing

#### New Files Created
- `src/context/AppContext.tsx` - Centralized state management via React Context
  - Manages user session (contactId, contact)
  - Manages cart state (cartItems, guestCount, deliveryDetails)
  - Manages orders and loyalty (orders, selectedOrder, cashbackBalance)
  - Provides typed actions: setContactSession, clearSession, addToCart, updateCartItemQuantity, removeFromCart, clearCart, etc.
  - Handles session initialization from localStorage on mount

- `src/routes.tsx` - Route configuration with all app routes
  - Auth routes: `/`, `/login`, `/login/email`, `/verify`, `/verify/email`, `/welcome`, `/new-customer`, `/delivery-setup`
  - Main routes: `/home`, `/menu`, `/menu/category/:categorySlug`, `/menu/item/:itemId`
  - Order routes: `/cart`, `/checkout`, `/success`
  - Management routes: `/orders`, `/orders/:orderId`, `/reorder`, `/reorder/modify`
  - Account routes: `/account`, `/account/addresses`, `/account/loyalty`, `/account/scheduled`, `/invoices`
  - Debug route: `/debug`

#### Modified Files
- `App.tsx` - Simplified to wrap app with `AppContextProvider` and render `AppRoutes`
- `index.tsx` - Added `BrowserRouter` wrapper
- `types.ts` - Kept legacy types for reference, added notes about new architecture
- `src/screens/AuthScreens.tsx` - All screens converted to use `useNavigate()` and `useAppContext()`
- `src/screens/HomeScreens.tsx` - Converted screens, `BottomNav` now uses `NavLink` with `useLocation()` for active state
- `src/screens/OrderScreens.tsx` - Converted screens, item data passed via route state
- `src/screens/ManagementScreens.tsx` - Converted screens, order ID from URL params via `useParams()`
- `src/screens/DebugScreens.tsx` - Converted to use router hooks

#### Navigation Changes
| Old Pattern | New Pattern |
|-------------|-------------|
| `nav.navigate('home')` | `navigate('/home')` |
| `nav.goBack()` | `navigate(-1)` |
| `nav.data.contactId` | `useAppContext().contactId` |
| `nav.setData({...})` | `setContactSession()`, `addToCart()`, etc. |
| Switch statement in App.tsx | `<Routes>` with `<Route>` components |

#### URL Structure
- `/` - Splash screen
- `/home` - Home dashboard
- `/menu` - Menu categories
- `/menu/category/sandwiches` - Category items (dynamic categorySlug)
- `/menu/item/xyz789` - Item detail (dynamic itemId)
- `/cart` - Shopping cart
- `/checkout` - Payment
- `/success` - Order confirmation
- `/orders` - Order history
- `/orders/abc123` - Order detail (dynamic orderId)
- `/account` - Account settings
- `/account/loyalty` - Cashback rewards
- `/debug` - Developer diagnostics

---

## 2026-01-12 (Night Update)

### Fixed - Menu Items Rendering as Black Bars
- Fixed `CategoryDetailScreen` in `HomeScreens.tsx` where menu items were appearing as black horizontal bars instead of proper item cards
- Replaced CSS `background-image` approach with `<img>` tag for more reliable image rendering
- Added `onError` handler to images to gracefully fall back to placeholder when image URLs fail to load
- Added null/undefined fallback handling for item properties (`name`, `price`, `id`)
- Added null check for individual items in the map function to prevent rendering issues from malformed data
- Added debug console logging to help diagnose menu data fetch issues (logs item count and sample data)

### Enhanced - Auto-Fill Delivery Address from GHL Contact Profile
- Updated `DeliverySetupScreen` in `AuthScreens.tsx` to auto-fill address fields (street, city, state, ZIP) from GHL contact profile
- If the user's GHL contact has saved address data, the Delivery Details form now pre-populates with that information
- Added visual indicator ("Address auto-filled from your profile") when address is auto-filled from GHL
- Updated phone verification flow (`VerificationScreen`) to fetch full contact profile after search to ensure address data is available
- Updated email verification flow (`VerificationEmailScreen`) to fetch full contact profile after search
- Priority order for address initialization: (1) previously entered delivery details, (2) GHL contact address, (3) empty fields

### Enhanced - Session Persistence / Auto-Login
- Updated `SplashScreen` to check for existing valid session on app startup
- If user has a valid Supabase session AND stored GHL contact ID, the app now:
  - Verifies the session is still valid (session ID matches stored session ID)
  - Fetches the full contact profile from GHL (including address data)
  - Navigates directly to Home screen, skipping the login flow
- If session is expired/invalid, clears stored data and shows login screen
- Added support for legacy sessions (contact ID exists but no session ID was stored)
- Console logging added for debugging session restoration flow

---

## 2026-01-12 (Evening Update)

### Dynamic UI Integration - Replace Hardcoded Data with Database & GHL Data

#### New Files
- Created `src/lib/menuService.ts` - Supabase service layer for menu data
  - `getCateringCategories()` - Fetches catering categories with item counts
  - `getCateringItemsByCategory()` - Fetches items filtered by category and catering flag
  - `getCategoryById()` and `getMenuItemById()` - Individual lookups
  - `calculateRecommendedQuantity()` - Calculates optimal quantity based on guest count and serves_min/max
  - `formatPrice()` and `getServesText()` - Display helpers

#### Type System Updates (`types.ts`)
- Added `NavData` interface with full typing for navigation data
- Added `GHLContact` interface for contact profile data from GHL
- Added `GHLOrder` interface for order history data
- Added `DeliveryDetails` interface for delivery flow data
- Added `CartItem` interface for cart functionality

#### MenuScreen Updates (`HomeScreens.tsx`)
- Now fetches categories from Supabase `menu_categories` table (filtered by `is_catering_category`)
- Displays dynamic item counts per category
- Shows loading spinner during fetch
- Passes `categoryId` and `categoryName` to CategoryDetailScreen

#### CategoryDetailScreen Updates (`HomeScreens.tsx`)
- Fetches items from Supabase `menu_items` table by category
- Displays real prices, images, and serves info from database
- Passes selected item data to ItemDetailScreen

#### ItemDetailScreen Updates (`OrderScreens.tsx`)
- Displays dynamic item data from `nav.data.selectedItem`
- Calculates recommended quantity based on `guestCount` and item's `serves_min`/`serves_max`
- Functional quantity controls with +/- buttons
- Special instructions textarea connected to state
- Add to Cart creates proper `CartItem` objects in `nav.data.cartItems`

#### CartScreen Updates (`OrderScreens.tsx`)
- Renders items from `nav.data.cartItems` dynamically
- Real-time subtotal, tax, and total calculations
- Functional quantity adjustment and item removal
- Cashback balance integration with toggle checkbox
- Empty cart state with "Browse Menu" CTA

#### HomeScreen Updates (`HomeScreens.tsx`)
- Displays user/company name from `nav.data.contact`
- Fetches last order from GHL via `ghlService.getOrdersByContactId()`
- Shows real cashback balance from `nav.data.cashbackBalance`
- Dynamic avatar with first letter of display name

#### AccountScreen Updates (`HomeScreens.tsx`)
- Displays contact name, phone/email from `nav.data.contact`
- Shows real cashback balance
- Dynamic avatar initial

#### WelcomeBackScreen Updates (`AuthScreens.tsx`)
- Displays real contact name from GHL contact data
- Fetches and displays last order summary and total
- Conditional reorder button (only shown if order exists)

#### OrdersScreen Updates (`ManagementScreens.tsx`)
- Fetches order history from GHL via `ghlService.getOrdersByContactId()`
- Displays real order dates, items, amounts
- Status badges with appropriate colors
- Empty state when no orders exist

#### OrderDetailScreen Updates (`ManagementScreens.tsx`)
- Displays selected order details from `nav.data.selectedOrder`
- Shows order items, totals, and delivery info

#### LoyaltyScreen Updates (`ManagementScreens.tsx`)
- Shows real cashback balance from `nav.data.cashbackBalance`
- Fetches order history for cashback transaction display
- Calculates 5% cashback per order

---

## 2026-01-12 (Afternoon Update)

### Split Delivery Address Fields
- Refactored `DeliverySetupScreen` in `AuthScreens.tsx` to use individual fields for Street Address, City, State, and ZIP Code instead of a single text field
- Improved validation to require all address components (Street, City, State, ZIP) before proceeding
- Updated `ghlService.updateContactAddress` to support structured address data, while maintaining backward compatibility for unparsed address strings
- Enhanced address display in `CartScreen` and `OrderSuccessScreen` to show the fully formatted delivery address from structured data
- Updated `CheckoutScreen` to pass structured address components to GHL when saving a delivery address for a contact

## 2026-01-12 (Morning Update)

### Fixed - GHL Contact Profile Fetch Method
- Updated `ghlService.getContactProfile` to use `GET /contacts?id={contactId}` instead of `POST /contacts` with a body, ensuring compatibility with the latest n8n workflow configuration

### Fixed - GHL Contact Search Endpoint
- Updated `ghlService.searchContact` to use the correct `/contacts/search?q={query}` endpoint
- Added robust base URL handling to strip trailing slashes from `VITE_N8N_WEBHOOK_URL` globally within the GHL service
- Added console logging to track exact request URLs for easier debugging of API connection issues

## 2026-01-11 (Latest Update)

### Order History Check for Welcome Back Flow
- Added `getOrdersByContactId()` method to `ghlService` to fetch past orders for a contact
- Updated `VerificationScreen.handleVerify` (phone verification) to check for past orders before navigating
- Updated `VerificationEmailScreen.handleVerify` (email verification) to check for past orders before navigating
- Contact found with past orders → Navigate to `welcome_back` screen (second flow)
- Contact found without past orders → Navigate to `new_customer` screen (first flow)
- Newly created contacts skip order check and go directly to `new_customer` flow
- Order check errors are handled gracefully, defaulting to `new_customer` flow to ensure user experience continues
- Added "Get Contact Orders" button to Connection Tester debug panel for testing order history functionality
- Added `getOrdersByContactId()` method to `ghlService` to fetch past orders for a contact
- Updated `VerificationScreen.handleVerify` (phone verification) to check for past orders before navigating
- Updated `VerificationEmailScreen.handleVerify` (email verification) to check for past orders before navigating
- Contact found with past orders → Navigate to `welcome_back` screen (second flow)
- Contact found without past orders → Navigate to `new_customer` screen (first flow)
- Newly created contacts skip order check and go directly to `new_customer` flow
- Order check errors are handled gracefully, defaulting to `new_customer` flow to ensure user experience continues

---

## 2026-01-11 (Latest Update)

### Email Verification Contact Creation & localStorage Persistence
- Created `src/lib/storage.ts` utility service for managing contact ID and session persistence
- Modified `ghlService.createContact()` to handle empty phone strings gracefully for email-only contacts
- Updated `VerificationEmailScreen.handleVerify` to automatically create GHL contact when none found during email verification
- Added `extractNameFromEmail()` helper function to parse firstName/lastName from email addresses (e.g., "john.doe@example.com")
- Updated `VerificationScreen.handleVerify` (phone verification) to save contact ID to localStorage
- Modified `App.tsx` to initialize contact ID from localStorage on mount and verify session matches
- Contact ID and Supabase session ID are now linked and persisted across page refreshes
- Contact ID is available throughout entire app flow (menu, cart, checkout, etc.)
- Session validation ensures contact ID is only restored when session matches stored session ID

---

## 2026-01-11 (Latest Update)

### GHL Contact Update Endpoint Migration
- Migrated `updateContactAddress` method from `/contacts/{contactId}/address` (PUT) to `/contacts/update?contactId={contactId}` (POST)
- Added `ContactUpdateData` interface with full contact update schema matching GHL API requirements
- Implemented address parsing helper function to split address strings into `address1`, `city`, `state`, and `postalCode` components
- Updated `updateContactAddress` to fetch existing contact profile first to preserve all fields when updating address
- Contact update now sends complete contact object with all fields (firstName, lastName, email, phone, address fields, dndSettings, tags, customFields, etc.)
- Address parsing handles common formats: "Street, City, State ZIP" with fallback to single address1 field if parsing fails
- Improved error handling with detailed error messages for contact fetch and update failures

---

## 2026-01-11 (Night Update)

### Delivery Details Flow
- Updated `DeliverySetupScreen` with controlled form state for address, date, time, and special instructions
- Form data now validates address and date before proceeding
- Delivery details persist to `nav.data.deliveryDetails` for use throughout the ordering flow
- Added `updateContactAddress` method to GHL service for saving delivery addresses
- Added `AddressData` interface to `src/services/ghl.ts`
- Updated `CheckoutScreen` to save delivery address to GHL contact on order completion (for "Saved Addresses" feature)
- Contact ID now persisted in `nav.data.contactId` during authentication for use in address saving
- Added loading state and error handling to checkout button

### Debug Screen Enhancements
- Added address testing section to `ConnectionTester` with inputs for address and label
- Added "Update GHL Address" button to test custom field saving
- Logs show full request/response for address update API calls

---

## 2026-01-11 (Evening Update)

### Added - People Counter & Catering Recommendations
- Made +/- buttons functional on `NewCustomerScreen` with state management for guest count (min: 10, max: 500)
- Added direct input option - users can tap the number to type large guest counts directly
- Created `src/lib/cateringRecommendations.ts` - dynamic recommendation engine that calculates optimal tray/drink quantities
- Added `RecommendationBox` component showing itemized recommendations with prices
- Guest count now persists through the ordering flow via `nav.data.guestCount`
- Updated `DeliverySetupScreen`, `MenuScreen`, and `CartScreen` headers to display guest count
- Added guest count to Cart Order Summary section

### Database (Supabase)
- Added `serves_min` and `serves_max` columns to `menu_items` table for catering portion calculations
- Seeded 18 catering products matching GHL structure:
  - Signature Sandwich Trays (Regular & Large)
  - Create Your Own Trays (Regular & Large)
  - Boxed Lunches (Regular, Large, Wrap, Full Salad variants)
  - Catering Salads (Santa Fe, Mediterranean, Asian, Caesar, Farmers Market)
  - Chips Pack (8), Drinks Pack (8)
  - Dessert Trays (Cookie, Brownie, Combo)

---

## 2026-01-11

### Fixed
- Improved Supabase connection testing logic to correctly interpret "table not found" errors as successful connection pings.
- Fixed import path error in `screens/DebugScreens.tsx`.
- Added missing entry point script tag (`/index.tsx`) to `index.html` to enable Vite bundling.
- Added missing `@types/react` and `@types/react-dom` to `package.json` for proper TypeScript support.

### Added
- Created `src/lib/supabase.ts` for Supabase client initialization.
- Created `src/services/ghl.ts` for n8n/GHL webhook interaction.
- Created `src/components/Debug/ConnectionTester.tsx` for manual API testing.
- Created `screens/DebugScreens.tsx` to host the connection tester.
- Added "Dev: Connection Tester" button to `LoginScreen` for easy access during development.
- Installed `@supabase/supabase-js` dependency.
- Created `vercel.json` with build and rewrite configurations for Vercel deployment.
- Created `.env.example` to document required environment variables (`GEMINI_API_KEY`).
- Updated `.gitignore` to include `.vercel` and ensure standard ignores are present.
- Added deployment instructions to `README.md`.
- Enhanced `ConnectionTester.tsx` with GHL Profile testing and automated Contact ID capture.
- Implemented Supabase OTP Login flow on `LoginScreen`.
- Added `data` and `setData` to `NavContextType` for cross-screen data sharing.
- Added automatic phone number formatting to `LoginScreen` input.

### Improved
- Standardized phone number formatting to E.164 (`+1xxxxxxxxxx`) in `ghlService` to ensure compatibility with GHL API.
- Added URL encoding to GHL search queries to handle special characters in phone numbers safely.
- Updated `VerificationScreen` to display the actual phone number receiving the OTP.
- Implemented auto-advancing OTP inputs with paste support in `VerificationScreen` and `VerificationEmailScreen`.
- Consolidated verification logic into a single "Verify" button with automatic routing to "New Customer" or "Welcome Back" based on GHL contact existence.
- Fixed missing `useRef` import in `AuthScreens.tsx`.
- Updated `ghlService.searchContact` to support searching by both phone and email.

### Build
- Verified successful production build using `npm run build`.
