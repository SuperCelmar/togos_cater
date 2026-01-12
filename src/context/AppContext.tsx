import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GHLContact, GHLOrder, DeliveryDetails, CartItem } from '../../types';
import { getContactId, getSessionId, clearContactSession, saveContactSession } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { ghlService } from '../services/ghl';

// Selected menu item type (passed via route state or fetched)
export interface SelectedItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  serves_min?: number;
  serves_max?: number;
}

// App state interface (shared state that persists across routes)
export interface AppState {
  // Session
  contactId: string | null;
  contact: GHLContact | null;
  isSessionLoading: boolean;
  
  // Auth flow data (temporary, passed between auth screens)
  phone: string | null;
  email: string | null;
  
  // Order flow
  guestCount: number | null;
  deliveryDetails: DeliveryDetails | null;
  
  // Cart
  cartItems: CartItem[];
  
  // Loyalty
  cashbackBalance: number;
  
  // Orders
  orders: GHLOrder[];
  selectedOrder: GHLOrder | null;
}

// Context value interface
export interface AppContextValue extends AppState {
  // Session actions
  setContactSession: (contactId: string, contact: GHLContact | null, sessionId?: string) => void;
  clearSession: () => void;
  
  // Auth actions
  setPhone: (phone: string) => void;
  setEmail: (email: string) => void;
  
  // Order flow actions
  setGuestCount: (count: number) => void;
  setDeliveryDetails: (details: DeliveryDetails) => void;
  
  // Cart actions
  addToCart: (item: CartItem) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  
  // Cashback actions
  setCashbackBalance: (balance: number) => void;
  
  // Order actions
  setOrders: (orders: GHLOrder[]) => void;
  setSelectedOrder: (order: GHLOrder | null) => void;
}

const defaultState: AppState = {
  contactId: null,
  contact: null,
  isSessionLoading: true,
  phone: null,
  email: null,
  guestCount: null,
  deliveryDetails: null,
  cartItems: [],
  cashbackBalance: 0,
  orders: [],
  selectedOrder: null,
};

const AppContext = createContext<AppContextValue | null>(null);

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);

  // Initialize session from localStorage on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const storedContactId = getContactId();
        const storedSessionId = getSessionId();

        if (storedContactId && storedSessionId) {
          // Verify current Supabase session matches stored session ID
          const { data: { session } } = await supabase.auth.getSession();
          const currentSessionId = session?.user?.id || session?.access_token || null;

          if (currentSessionId === storedSessionId) {
            // Session matches - try to fetch contact profile
            try {
              const profileResponse = await ghlService.getContactProfile(storedContactId);
              const contact = profileResponse.contact || profileResponse || null;
              
              setState(prev => ({
                ...prev,
                contactId: storedContactId,
                contact,
                isSessionLoading: false,
              }));
              return;
            } catch (profileError) {
              console.warn('[AppContext] Failed to fetch contact profile:', profileError);
              // Still set contactId even if profile fetch fails
              setState(prev => ({
                ...prev,
                contactId: storedContactId,
                isSessionLoading: false,
              }));
              return;
            }
          } else {
            // Session mismatch - clear localStorage
            console.log('[AppContext] Session mismatch, clearing stored session');
            clearContactSession();
          }
        } else if (storedContactId && !storedSessionId) {
          // Legacy case: contact ID exists but no session ID
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            try {
              const profileResponse = await ghlService.getContactProfile(storedContactId);
              const contact = profileResponse.contact || profileResponse || null;
              
              // Save session ID for future use
              saveContactSession(storedContactId, session.user?.id || session.access_token || undefined);
              
              setState(prev => ({
                ...prev,
                contactId: storedContactId,
                contact,
                isSessionLoading: false,
              }));
              return;
            } catch (profileError) {
              console.warn('[AppContext] Failed to restore legacy session:', profileError);
            }
          }
        }

        // No valid session
        setState(prev => ({ ...prev, isSessionLoading: false }));
      } catch (error) {
        console.error('[AppContext] Session initialization failed:', error);
        setState(prev => ({ ...prev, isSessionLoading: false }));
      }
    };

    initializeSession();
  }, []);

  // Session actions
  const setContactSession = (contactId: string, contact: GHLContact | null, sessionId?: string) => {
    saveContactSession(contactId, sessionId);
    setState(prev => ({ ...prev, contactId, contact }));
  };

  const clearSession = () => {
    clearContactSession();
    setState(prev => ({
      ...prev,
      contactId: null,
      contact: null,
      phone: null,
      email: null,
      cartItems: [],
      orders: [],
      selectedOrder: null,
    }));
  };

  // Auth actions
  const setPhone = (phone: string) => {
    setState(prev => ({ ...prev, phone }));
  };

  const setEmail = (email: string) => {
    setState(prev => ({ ...prev, email }));
  };

  // Order flow actions
  const setGuestCount = (guestCount: number) => {
    setState(prev => ({ ...prev, guestCount }));
  };

  const setDeliveryDetails = (deliveryDetails: DeliveryDetails) => {
    setState(prev => ({ ...prev, deliveryDetails }));
  };

  // Cart actions
  const addToCart = (item: CartItem) => {
    setState(prev => {
      const existingIndex = prev.cartItems.findIndex(i => i.id === item.id);
      
      if (existingIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...prev.cartItems];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + item.quantity,
          specialInstructions: item.specialInstructions || updatedItems[existingIndex].specialInstructions,
        };
        return { ...prev, cartItems: updatedItems };
      } else {
        // Add new item
        return { ...prev, cartItems: [...prev.cartItems, item] };
      }
    });
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    setState(prev => {
      if (quantity <= 0) {
        return { ...prev, cartItems: prev.cartItems.filter(i => i.id !== itemId) };
      }
      return {
        ...prev,
        cartItems: prev.cartItems.map(i => 
          i.id === itemId ? { ...i, quantity } : i
        ),
      };
    });
  };

  const removeFromCart = (itemId: string) => {
    setState(prev => ({
      ...prev,
      cartItems: prev.cartItems.filter(i => i.id !== itemId),
    }));
  };

  const clearCart = () => {
    setState(prev => ({ ...prev, cartItems: [] }));
  };

  // Cashback actions
  const setCashbackBalance = (cashbackBalance: number) => {
    setState(prev => ({ ...prev, cashbackBalance }));
  };

  // Order actions
  const setOrders = (orders: GHLOrder[]) => {
    setState(prev => ({ ...prev, orders }));
  };

  const setSelectedOrder = (selectedOrder: GHLOrder | null) => {
    setState(prev => ({ ...prev, selectedOrder }));
  };

  const value: AppContextValue = {
    ...state,
    setContactSession,
    clearSession,
    setPhone,
    setEmail,
    setGuestCount,
    setDeliveryDetails,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    setCashbackBalance,
    setOrders,
    setSelectedOrder,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
