export type ScreenName = 
  // Phase 0: Auth & Onboarding
  | 'splash'
  | 'login'
  | 'login_email'
  | 'verify'
  | 'verify_email'
  | 'welcome_back'
  | 'new_customer'
  | 'delivery_setup'
  
  // Phase 1: Main App Navigation
  | 'home'
  | 'menu'
  | 'category_detail'
  | 'item_detail'
  | 'orders'
  | 'account'

  // Phase 2: Ordering Flow
  | 'cart'
  | 'checkout'
  | 'success'

  // Phase 3: Reorder Flow
  | 'reorder'
  | 'modify_reorder'

  // Phase 4: My Orders Detail
  | 'order_detail'
  | 'invoices'

  // Phase 5: Account Detail
  | 'loyalty'
  | 'scheduled'
  | 'addresses'
  
  // Debug
  | 'debug';


// Legacy NavContextType - kept for reference, no longer used
// Navigation is now handled via React Router hooks (useNavigate, useParams, etc.)
// Shared state is managed via AppContext (src/context/AppContext.tsx)
export interface NavContextType {
  currentScreen: ScreenName;
  navigate: (screen: ScreenName) => void;
  goBack: () => void;
  data: NavData;
  setData: (data: NavData) => void;
}

// GHL Contact data structure
export interface GHLContact {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  companyName?: string;
  customFields?: Array<{
    id: string;
    key: string;
    value: string;
  }>;
}

// GHL Order data structure
export interface GHLOrder {
  id: string;
  invoiceNumber?: string;
  contactId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  deliveryAddress?: string;
  deliveryDate?: string;
  deliveryTime?: string;
}

// Delivery details collected during ordering flow
export interface DeliveryDetails {
  address: string;
  city: string;
  state: string;
  zip: string;
  date: string;
  time: string;
  specialInstructions?: string;
}

// Menu item for cart
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  specialInstructions?: string;
}

// Navigation data passed between screens (legacy - now in AppContext)
export interface NavData {
  // Auth flow
  phone?: string;
  email?: string;
  
  // GHL contact info
  contactId?: string;
  contact?: GHLContact;
  
  // Order flow
  guestCount?: number;
  deliveryDetails?: DeliveryDetails;
  
  // Menu navigation
  categoryId?: string;
  categoryName?: string;
  selectedItem?: {
    id: string;
    name: string;
    price: number;
    description?: string;
    image_url?: string;
    serves_min?: number;
    serves_max?: number;
  };
  
  // Cart
  cartItems?: CartItem[];
  
  // Order history
  orders?: GHLOrder[];
  selectedOrder?: GHLOrder;
  
  // Loyalty
  cashbackBalance?: number;
}
