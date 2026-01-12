import React, { useState, useEffect } from 'react';
import { ScreenName, NavContextType } from './types';
import { getContactId, getSessionId, clearContactSession } from './src/lib/storage';
import { supabase } from './src/lib/supabase';
import { 
    SplashScreen, 
    LoginScreen, 
    LoginEmailScreen,
    VerificationScreen,
    VerificationEmailScreen,
    WelcomeBackScreen,
    NewCustomerScreen,
    DeliverySetupScreen
} from './src/screens/AuthScreens';
import { 
    HomeScreen, 
    MenuScreen, 
    CategoryDetailScreen,
    AccountScreen 
} from './src/screens/HomeScreens';
import { 
    ItemDetailScreen, 
    CartScreen, 
    CheckoutScreen, 
    OrderSuccessScreen 
} from './src/screens/OrderScreens';
import { 
    OrdersScreen, 
    ReorderScreen, 
    ModifyReorderScreen,
    OrderDetailScreen,
    InvoicesScreen, 
    ScheduledOrdersScreen,
    LoyaltyScreen,
    AddressManagementScreen
} from './src/screens/ManagementScreens';
import { DebugScreen } from './src/screens/DebugScreens';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('splash');
  const [history, setHistory] = useState<ScreenName[]>(['splash']);
  const [data, setData] = useState<any>({});

  // Initialize contact ID from localStorage on mount
  useEffect(() => {
    const initializeContactSession = async () => {
      try {
        const storedContactId = getContactId();
        const storedSessionId = getSessionId();

        if (storedContactId && storedSessionId) {
          // Verify current Supabase session matches stored session ID
          const { data: { session } } = await supabase.auth.getSession();
          const currentSessionId = session?.user?.id || session?.access_token || null;

          if (currentSessionId === storedSessionId) {
            // Session matches - restore contact ID to nav.data
            setData((prevData: any) => ({
              ...prevData,
              contactId: storedContactId,
            }));
          } else {
            // Session mismatch - clear localStorage (session expired/changed)
            console.log('Session mismatch detected, clearing stored contact session');
            clearContactSession();
          }
        } else if (storedContactId && !storedSessionId) {
          // Contact ID exists but no session ID - still restore contact ID
          // (might be from before session linking was implemented)
          setData((prevData: any) => ({
            ...prevData,
            contactId: storedContactId,
          }));
        }
      } catch (error) {
        console.error('Failed to initialize contact session from localStorage:', error);
      }
    };

    initializeContactSession();
  }, []);

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
    data,
    setData,
  };

  const renderScreen = () => {
    switch (currentScreen) {
      // Phase 0
      case 'splash': return <SplashScreen nav={nav} />;
      case 'login': return <LoginScreen nav={nav} />;
      case 'login_email': return <LoginEmailScreen nav={nav} />;
      case 'verify': return <VerificationScreen nav={nav} />;
      case 'verify_email': return <VerificationEmailScreen nav={nav} />;
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
      case 'debug': return <DebugScreen nav={nav} />;
      
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