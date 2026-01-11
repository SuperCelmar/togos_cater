import React, { useState } from 'react';
import { ScreenName, NavContextType } from './types';
import { 
    SplashScreen, 
    LoginScreen, 
    VerificationScreen,
    WelcomeBackScreen,
    NewCustomerScreen,
    DeliverySetupScreen
} from './screens/AuthScreens';
import { 
    HomeScreen, 
    MenuScreen, 
    CategoryDetailScreen,
    AccountScreen 
} from './screens/HomeScreens';
import { 
    ItemDetailScreen, 
    CartScreen, 
    CheckoutScreen, 
    OrderSuccessScreen 
} from './screens/OrderScreens';
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

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('splash');
  const [history, setHistory] = useState<ScreenName[]>(['splash']);

  const navigate = (screen: ScreenName) => {
    setHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
      setCurrentScreen(newHistory[newHistory.length - 1]);
    }
  };

  const nav: NavContextType = {
    currentScreen,
    navigate,
    goBack,
  };

  const renderScreen = () => {
    switch (currentScreen) {
      // Phase 0
      case 'splash': return <SplashScreen nav={nav} />;
      case 'login': return <LoginScreen nav={nav} />;
      case 'verify': return <VerificationScreen nav={nav} />;
      case 'welcome_back': return <WelcomeBackScreen nav={nav} />;
      case 'new_customer': return <NewCustomerScreen nav={nav} />;
      case 'delivery_setup': return <DeliverySetupScreen nav={nav} />;
      
      // Phase 1
      case 'home': return <HomeScreen nav={nav} />;
      case 'menu': return <MenuScreen nav={nav} />;
      case 'category_detail': return <CategoryDetailScreen nav={nav} />;
      case 'account': return <AccountScreen nav={nav} />;
      
      // Phase 2
      case 'item_detail': return <ItemDetailScreen nav={nav} />;
      case 'cart': return <CartScreen nav={nav} />;
      case 'checkout': return <CheckoutScreen nav={nav} />;
      case 'success': return <OrderSuccessScreen nav={nav} />;
      
      // Phase 3 & 4 & 5
      case 'orders': return <OrdersScreen nav={nav} />;
      case 'reorder': return <ReorderScreen nav={nav} />;
      case 'modify_reorder': return <ModifyReorderScreen nav={nav} />;
      case 'order_detail': return <OrderDetailScreen nav={nav} />;
      case 'invoices': return <InvoicesScreen nav={nav} />;
      case 'loyalty': return <LoyaltyScreen nav={nav} />;
      case 'scheduled': return <ScheduledOrdersScreen nav={nav} />;
      case 'addresses': return <AddressManagementScreen nav={nav} />;
      
      default: return <HomeScreen nav={nav} />;
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-gray-100 dark:bg-black flex justify-center">
        {/* Render the current screen */}
        {renderScreen()}
    </div>
  );
};

export default App;