import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { GHLContact, GHLOrder, DeliveryDetails, CartItem } from '../../types';
import { EnhancedCateringRecommendation } from '../lib/cateringRecommendations';
import { 
  getContactId, 
  getSessionId, 
  clearContactSession, 
  saveContactSession,
  getDeliveryAddress,
  saveDeliveryAddress,
  clearDeliveryAddress,
  getOrdersCache,
  saveOrdersCache,
  clearOrdersCache,
  getOrdersRefreshPending,
  setOrdersRefreshPending,
  clearOrdersRefreshPending
} from '../lib/storage';
import { supabase } from '../lib/supabase';
import { ghlService } from '../services/ghl';
import { getCashbackBalance } from '../lib/cashbackService';

// ... (rest of imports and interfaces)

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
  homeOrdersRefreshPending: boolean;
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
  clearDeliveryDetails: () => void;
  
  // Cart actions
  addToCart: (item: CartItem) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  populateCartFromRecommendation: (recommendation: EnhancedCateringRecommendation) => void;
  
  // Cashback actions
  setCashbackBalance: (balance: number) => void;
  
  // Order actions
  setOrders: (orders: GHLOrder[]) => void;
  setSelectedOrder: (order: GHLOrder | null) => void;
  setHomeOrdersRefreshPending: (pending: boolean) => void;
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
  homeOrdersRefreshPending: false,
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

  // Load cashback balance when contactId changes
  useEffect(() => {
    const loadCashbackBalance = async () => {
      if (!state.contactId) {
        setState(prev => ({ ...prev, cashbackBalance: 0 }));
        return;
      }

      try {
        const balance = await getCashbackBalance(state.contactId);
        setState(prev => ({ ...prev, cashbackBalance: balance }));
      } catch (error) {
        console.error('[AppContext] Failed to load cashback balance:', error);
        setState(prev => ({ ...prev, cashbackBalance: 0 }));
      }
    };

    loadCashbackBalance();
  }, [state.contactId]);

  // Initialize session from localStorage on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const storedContactId = getContactId();
        const storedSessionId = getSessionId();
        const storedAddress = getDeliveryAddress();

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
                deliveryDetails: storedAddress ? {
                  address: storedAddress.address,
                  city: storedAddress.city,
                  state: storedAddress.state,
                  zip: storedAddress.zip,
                  date: prev.deliveryDetails?.date || '',
                  time: prev.deliveryDetails?.time || '11:30',
                } : prev.deliveryDetails,
                isSessionLoading: false,
              }));
              return;
            } catch (profileError) {
              console.warn('[AppContext] Failed to fetch contact profile:', profileError);
              // Still set contactId even if profile fetch fails
              setState(prev => ({
                ...prev,
                contactId: storedContactId,
                deliveryDetails: storedAddress ? {
                  address: storedAddress.address,
                  city: storedAddress.city,
                  state: storedAddress.state,
                  zip: storedAddress.zip,
                  date: prev.deliveryDetails?.date || '',
                  time: prev.deliveryDetails?.time || '11:30',
                } : prev.deliveryDetails,
                isSessionLoading: false,
              }));
              return;
            }
          } else {
            // Session mismatch - clear localStorage
            console.log('[AppContext] Session mismatch, clearing stored session');
            clearContactSession();
            clearDeliveryAddress();
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

  // Hydrate cached orders and refresh flag when contactId changes
  useEffect(() => {
    if (!state.contactId) {
      setState(prev => ({
        ...prev,
        orders: [],
        selectedOrder: null,
        homeOrdersRefreshPending: false,
      }));
      return;
    }

    const cachedOrders = getOrdersCache<GHLOrder>(state.contactId);
    const refreshPending = getOrdersRefreshPending(state.contactId);

    setState(prev => ({
      ...prev,
      orders: prev.orders.length > 0 ? prev.orders : (cachedOrders || []),
      homeOrdersRefreshPending: refreshPending,
    }));
  }, [state.contactId]);

  // Session actions
  const setContactSession = useCallback((contactId: string, contact: GHLContact | null, sessionId?: string) => {
    saveContactSession(contactId, sessionId);
    
    // If contact has address info, persist it
    if (contact?.address1) {
      saveDeliveryAddress({
        address: contact.address1,
        city: contact.city || '',
        state: contact.state || '',
        zip: contact.postalCode || '',
      });
    }
    
    setState(prev => ({ 
      ...prev, 
      contactId, 
      contact,
      deliveryDetails: (contact?.address1 && !prev.deliveryDetails?.address) ? {
        address: contact.address1,
        city: contact.city || '',
        state: contact.state || '',
        zip: contact.postalCode || '',
        date: prev.deliveryDetails?.date || '',
        time: prev.deliveryDetails?.time || '11:30',
      } : prev.deliveryDetails
    }));
  }, []);

  const clearSession = useCallback(() => {
    if (state.contactId) {
      clearOrdersCache(state.contactId);
      clearOrdersRefreshPending(state.contactId);
    }
    clearContactSession();
    clearDeliveryAddress();
    setState(prev => ({
      ...prev,
      contactId: null,
      contact: null,
      phone: null,
      email: null,
      deliveryDetails: null,
      cartItems: [],
      cashbackBalance: 0,
      orders: [],
      selectedOrder: null,
      homeOrdersRefreshPending: false,
    }));
  }, [state.contactId]);

  // Auth actions
  const setPhone = useCallback((phone: string) => {
    setState(prev => ({ ...prev, phone }));
  }, []);

  const setEmail = useCallback((email: string) => {
    setState(prev => ({ ...prev, email }));
  }, []);

  // Order flow actions
  const setGuestCount = useCallback((guestCount: number) => {
    setState(prev => ({ ...prev, guestCount }));
  }, []);

  const setDeliveryDetails = useCallback((deliveryDetails: DeliveryDetails) => {
    saveDeliveryAddress({
      address: deliveryDetails.address,
      city: deliveryDetails.city,
      state: deliveryDetails.state,
      zip: deliveryDetails.zip,
    });
    setState(prev => ({ ...prev, deliveryDetails }));
  }, []);

  const clearDeliveryDetails = useCallback(() => {
    clearDeliveryAddress();
    setState(prev => ({ ...prev, deliveryDetails: null }));
  }, []);

  // Cart actions
  const addToCart = useCallback((item: CartItem) => {
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
  }, []);

  const updateCartItemQuantity = useCallback((itemId: string, quantity: number) => {
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
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      cartItems: prev.cartItems.filter(i => i.id !== itemId),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setState(prev => ({ ...prev, cartItems: [] }));
  }, []);

  const populateCartFromRecommendation = useCallback((recommendation: EnhancedCateringRecommendation) => {
    const newCartItems: CartItem[] = recommendation.items.map(item => ({
      id: item.menuItem.id,
      name: item.menuItem.name,
      price: item.menuItem.price,
      quantity: item.quantity,
      image_url: item.menuItem.image_url || undefined,
    }));

    setState(prev => ({ ...prev, cartItems: newCartItems }));
  }, []);

  // Cashback actions
  const setCashbackBalance = useCallback((cashbackBalance: number) => {
    setState(prev => ({ ...prev, cashbackBalance }));
  }, []);

  // Order actions
  const setOrders = useCallback((orders: GHLOrder[]) => {
    setState(prev => ({ ...prev, orders }));
    if (state.contactId) {
      saveOrdersCache(state.contactId, orders);
    }
  }, [state.contactId]);

  const setSelectedOrder = useCallback((selectedOrder: GHLOrder | null) => {
    setState(prev => ({ ...prev, selectedOrder }));
  }, []);

  const setHomeOrdersRefreshPending = useCallback((pending: boolean) => {
    setState(prev => ({ ...prev, homeOrdersRefreshPending: pending }));
    if (state.contactId) {
      setOrdersRefreshPending(state.contactId, pending);
    }
  }, [state.contactId]);

  const value: AppContextValue = {
    ...state,
    setContactSession,
    clearSession,
    setPhone,
    setEmail,
    setGuestCount,
    setDeliveryDetails,
    clearDeliveryDetails,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    populateCartFromRecommendation,
    setCashbackBalance,
    setOrders,
    setSelectedOrder,
    setHomeOrdersRefreshPending,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
