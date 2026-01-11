export type ScreenName = 
  // Phase 0: Auth & Onboarding
  | 'splash'
  | 'login'
  | 'verify'
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
  | 'addresses';

export interface NavContextType {
  currentScreen: ScreenName;
  navigate: (screen: ScreenName) => void;
  goBack: () => void;
}
