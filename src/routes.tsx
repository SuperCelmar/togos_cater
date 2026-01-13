import React from 'react';
import { Routes, Route, Navigate } from 'react-router';

// Auth Screens
import { 
  SplashScreen, 
  LoginScreen, 
  LoginEmailScreen,
  VerificationScreen,
  VerificationEmailScreen,
  WelcomeBackScreen,
  NewCustomerScreen,
  DeliverySetupScreen
} from './screens/AuthScreens';

// Home Screens
import { 
  HomeScreen, 
  MenuScreen, 
  CategoryDetailScreen,
  AccountScreen 
} from './screens/HomeScreens';

// Order Screens
import { 
  ItemDetailScreen, 
  CartScreen, 
  CheckoutScreen, 
  OrderSuccessScreen 
} from './screens/OrderScreens';

// Management Screens
import { 
  OrdersScreen, 
  ReorderScreen, 
  ModifyReorderScreen,
  OrderDetailScreen,
  InvoicesScreen, 
  ScheduledOrdersScreen,
  LoyaltyScreen,
  AddressManagementScreen
} from './screens/ManagementScreens';

// Debug Screen
import { DebugScreen } from './screens/DebugScreens';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth & Onboarding Routes */}
      <Route path="/" element={<SplashScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/login/email" element={<LoginEmailScreen />} />
      <Route path="/verify" element={<VerificationScreen />} />
      <Route path="/verify/email" element={<VerificationEmailScreen />} />
      <Route path="/welcome" element={<WelcomeBackScreen />} />
      <Route path="/new-customer" element={<NewCustomerScreen />} />
      <Route path="/delivery-setup" element={<DeliverySetupScreen />} />
      
      {/* Main App Routes */}
      <Route path="/home" element={<HomeScreen />} />
      <Route path="/menu" element={<MenuScreen />} />
      <Route path="/menu/category/:categorySlug" element={<CategoryDetailScreen />} />
      <Route path="/menu/item/:itemId" element={<ItemDetailScreen />} />
      <Route path="/cart" element={<CartScreen />} />
      <Route path="/checkout" element={<CheckoutScreen />} />
      <Route path="/success" element={<OrderSuccessScreen />} />
      
      {/* Orders & Reorder Routes */}
      <Route path="/orders" element={<OrdersScreen />} />
      <Route path="/orders/:orderId" element={<OrderDetailScreen />} />
      <Route path="/orders/:orderId/reorder" element={<ReorderScreen />} />
      <Route path="/orders/:orderId/reorder/modify" element={<ModifyReorderScreen />} />
      <Route path="/reorder" element={<ReorderScreen />} />
      <Route path="/reorder/modify" element={<ModifyReorderScreen />} />
      
      {/* Account Routes */}
      <Route path="/account" element={<AccountScreen />} />
      <Route path="/account/addresses" element={<AddressManagementScreen />} />
      <Route path="/account/loyalty" element={<LoyaltyScreen />} />
      <Route path="/account/scheduled" element={<ScheduledOrdersScreen />} />
      <Route path="/invoices" element={<InvoicesScreen />} />
      
      {/* Debug Route */}
      <Route path="/debug" element={<DebugScreen />} />
      
      {/* Fallback - redirect unknown routes to splash */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
