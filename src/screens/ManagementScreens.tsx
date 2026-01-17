import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAppContext } from '../context/AppContext';
import { GHLOrder, GHLContact } from '../../types';
import { BottomNav } from './HomeScreens';
import { ghlService } from '../services/ghl';
import { formatPrice } from '../lib/menuService';
import { getCashbackHistory, CashbackTransaction } from '../lib/cashbackService';
import { getScheduledOrders, saveScheduledOrders } from '../lib/storage';

/**
 * Format date for display
 */
function formatOrderDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return dateString;
  }
}

/**
 * Get order status badge color
 */
function getStatusColor(status: string): { bg: string; text: string } {
  switch (status?.toLowerCase()) {
    case 'delivered':
    case 'completed':
      return { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400' };
    case 'pending':
    case 'processing':
      return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400' };
    case 'cancelled':
      return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400' };
    default:
      return { bg: 'bg-gray-50 dark:bg-gray-900/20', text: 'text-gray-700 dark:text-gray-400' };
  }
}

function getOrdersSignature(orders: GHLOrder[]): string {
  return JSON.stringify(
    orders.map(order => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      itemsCount: order.items?.length || 0,
    }))
  );
}

type ScheduleFrequency = 'weekly' | 'biweekly' | 'monthly';

interface ScheduledOrder {
  id: string;
  name: string;
  frequency: ScheduleFrequency;
  nextDate: string;
  time: string;
  address: string;
  notes?: string;
  createdAt: string;
}

export const OrdersScreen: React.FC = () => {
  const navigate = useNavigate();
  const { contactId, orders, setOrders, setSelectedOrder, setHomeOrdersRefreshPending } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      if (!contactId) {
        setIsLoading(false);
        return;
      }

      // If orders already loaded, skip fetch to prevent loops
      if (orders.length > 0) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await ghlService.getOrdersByContactId(contactId);
        // Use a functional update or ensure setOrders is stable
        setOrders(data || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [contactId, orders.length, setOrders]);

  const handleOrderClick = (order: GHLOrder) => {
    setSelectedOrder(order);
    navigate(`/orders/${order.id}`);
  };

  const handleRefresh = async () => {
    if (!contactId || isRefreshing) return;
    setIsRefreshing(true);

    try {
      const data = await ghlService.getOrdersByContactId(contactId);
      const nextOrders = data || [];
      const currentSignature = getOrdersSignature(orders);
      const nextSignature = getOrdersSignature(nextOrders);

      if (currentSignature !== nextSignature) {
        setOrders(nextOrders);
        setHomeOrdersRefreshPending(true);
      }
    } catch (error) {
      console.error('Failed to refresh orders:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#181111] dark:text-white w-full max-w-md mx-auto shadow-2xl h-screen flex flex-col overflow-hidden">
      <header className="flex items-center bg-white dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex flex-col flex-1">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Orders</p>
          <h2 className="text-[#181111] dark:text-white text-lg font-extrabold leading-tight">My Orders</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-primary disabled:opacity-60"
          aria-label="Refresh orders"
        >
          <span className={`material-symbols-outlined ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
        </button>
      </header>
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">receipt_long</span>
            <p className="text-gray-500 mb-2">No orders yet</p>
            <p className="text-sm text-gray-400">Your order history will appear here</p>
          </div>
        ) : (
          orders.map((order) => {
            const statusColors = getStatusColor(order.status);
            const orderSummary = order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ') || 'Catering Order';
            
            return (
              <div 
                key={order.id} 
                onClick={() => handleOrderClick(order)} 
                className="group relative flex flex-col gap-4 rounded-xl bg-white dark:bg-[#2a1a1a] p-4 shadow-sm border border-transparent hover:border-primary/20 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">
                      {formatOrderDate(order.createdAt)}
                    </p>
                    <span className={`inline-flex items-center gap-1 rounded-full ${statusColors.bg} px-2 py-1 text-xs font-bold ${statusColors.text}`}>
                         <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                         {order.status}
                    </span>
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col justify-center flex-1">
                        <h3 className="text-[#181111] dark:text-white text-base font-bold leading-tight line-clamp-1">{orderSummary}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">
                          Order #{order.id.slice(-5)} • {formatPrice(order.totalAmount)}
                        </p>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 self-center">chevron_right</span>
                </div>
              </div>
            );
          })
        )}
      </main>
       <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-4 z-40 pointer-events-none">
            <button onClick={() => navigate('/menu')} className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 pointer-events-auto">Place New Order</button>
       </div>
      <BottomNav />
    </div>
  );
};

export const OrderDetailScreen: React.FC = () => {
    const navigate = useNavigate();
    const { orderId } = useParams<{ orderId: string }>();
    const { selectedOrder, orders, setSelectedOrder } = useAppContext();
    
    // Find order from context or orders list
    const order = selectedOrder?.id === orderId 
      ? selectedOrder 
      : orders.find(o => o.id === orderId);
    
    if (!order) {
      return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-2xl overflow-hidden items-center justify-center">
          <p className="text-gray-500">No order selected</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold">Go Back</button>
        </div>
      );
    }

    const statusColors = getStatusColor(order.status);

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-2xl overflow-hidden">
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                    <button onClick={() => navigate(-1)} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">Order #{order.id.slice(-5)}</h2>
                    <div className="w-10"></div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
                <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between mb-4">
                         <span className="font-bold text-lg">{formatOrderDate(order.createdAt)}</span>
                         <span className={`font-bold ${statusColors.bg} ${statusColors.text} px-2 py-0.5 rounded text-sm`}>
                           {order.status}
                         </span>
                    </div>
                    <div className="space-y-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                              <span>{item.quantity}x {item.name}</span>
                              <span>{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        )) || (
                          <div className="text-gray-500">Order items not available</div>
                        )}
                    </div>
                    <div className="h-px bg-gray-100 dark:bg-white/10 my-4"></div>
                    <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.totalAmount * 0.85)}</span></div>
                        <div className="flex justify-between"><span>Tax</span><span>{formatPrice(order.totalAmount * 0.07)}</span></div>
                        <div className="flex justify-between"><span>Delivery</span><span>{formatPrice(15)}</span></div>
                        <div className="flex justify-between text-lg font-black text-[#181111] dark:text-white mt-2">
                          <span>Total Paid</span>
                          <span>{formatPrice(order.totalAmount)}</span>
                        </div>
                    </div>
                </div>
                
                {order.deliveryAddress && (
                  <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm">
                      <h3 className="font-bold mb-2">Delivery Info</h3>
                      <p className="text-sm text-gray-500">{order.deliveryAddress}</p>
                      {(order.deliveryDate || order.deliveryTime) && (
                        <p className="text-sm text-gray-500">
                          {order.deliveryDate} {order.deliveryTime ? `@ ${order.deliveryTime}` : ''}
                        </p>
                      )}
                  </div>
                )}

                <div className="space-y-3">
                    <button 
                        onClick={() => {
                            window.open(`https://link.togos.app/invoice/${order.id}`, '_blank');
                        }}
                        className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 text-[#181111] dark:text-white font-bold rounded-xl"
                    >
                        Download Invoice (PDF)
                    </button>
                </div>
            </main>
             <div className="p-4 bg-white dark:bg-[#1a0c0c] border-t border-gray-100 dark:border-gray-800 shrink-0">
                <button 
                  onClick={() => {
                    setSelectedOrder(order);
                    navigate(`/orders/${order.id}/reorder/modify`);
                  }} 
                  className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20"
                >
                  Reorder This
                </button>
             </div>
        </div>
    );
};

export const ReorderScreen: React.FC = () => {
    const navigate = useNavigate();
    const { contactId, orders, setOrders, setSelectedOrder } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            if (!contactId) {
                setIsLoading(false);
                return;
            }

            if (orders.length > 0) {
                setIsLoading(false);
                return;
            }

            try {
                const data = await ghlService.getOrdersByContactId(contactId);
                setOrders(data || []);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchOrders();
    }, [contactId, orders.length, setOrders]);

    const recentOrders = orders.slice(0, 5);

    const handleReorder = (order: GHLOrder) => {
        setSelectedOrder(order);
        navigate('/reorder/modify');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-2xl overflow-hidden">
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                     <button onClick={() => navigate('/home')} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">Reorder</h2>
                    <div className="w-10"></div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p>No previous orders to reorder</p>
                    </div>
                ) : (
                    recentOrders.map((order, idx) => {
                        const orderSummary = order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ') || 'Catering Order';
                        
                        return (
                            <div 
                                key={order.id} 
                                className={`bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5 ${idx > 0 ? 'opacity-70' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-lg">{formatOrderDate(order.createdAt)}</p>
                                        <p className="text-sm text-gray-500 line-clamp-1">{orderSummary}</p>
                                    </div>
                                    <p className="font-bold text-lg">{formatPrice(order.totalAmount)}</p>
                                </div>
                                <button 
                                    onClick={() => handleReorder(order)} 
                                    className={`w-full h-10 rounded-lg font-bold ${idx === 0 ? 'bg-primary text-white' : 'border border-primary text-primary'}`}
                                >
                                    Reorder
                                </button>
                            </div>
                        );
                    })
                )}
            </main>
             <div className="p-4 shrink-0">
                <button onClick={() => navigate('/menu')} className="w-full py-4 text-primary font-bold">Browse Full Menu</button>
             </div>
        </div>
    );
};

export const ModifyReorderScreen: React.FC = () => {
    const navigate = useNavigate();
    const { orderId } = useParams<{ orderId: string }>();
    const { 
        contactId, 
        orders, 
        setOrders,
        selectedOrder, 
        setSelectedOrder,
        deliveryDetails, 
        setDeliveryDetails, 
        addToCart, 
        clearCart 
    } = useAppContext();
    
    const filterReorderItems = (orderItems: NonNullable<typeof selectedOrder>['items'] = []) =>
        (orderItems || []).filter(item => {
            const normalizedName = item.name?.toLowerCase().trim() || '';
            return !normalizedName.includes('delivery fee');
        });

    const [resolvedOrder, setResolvedOrder] = useState<GHLOrder | null>(null);
    const [isResolvingOrder, setIsResolvingOrder] = useState(false);
    const [resolveError, setResolveError] = useState<string | null>(null);

    useEffect(() => {
        setResolveError(null);

        if (!orderId) {
            setResolvedOrder(selectedOrder || null);
            return;
        }

        if (selectedOrder?.id === orderId) {
            setResolvedOrder(selectedOrder);
            return;
        }

        const orderFromList = orders.find(order => order.id === orderId);
        if (orderFromList) {
            setResolvedOrder(orderFromList);
            setSelectedOrder(orderFromList);
            return;
        }

        if (!contactId) {
            setResolvedOrder(null);
            return;
        }

        let isActive = true;

        const fetchOrder = async () => {
            setIsResolvingOrder(true);

            try {
                const data = await ghlService.getOrdersByContactId(contactId);
                const nextOrders = data || [];

                if (!isActive) return;

                setOrders(nextOrders);
                const matchedOrder = nextOrders.find(order => order.id === orderId) || null;
                setResolvedOrder(matchedOrder);
                setSelectedOrder(matchedOrder);

                if (!matchedOrder) {
                    setResolveError('Order not found.');
                }
            } catch (error) {
                console.error('Failed to fetch order for reorder:', error);
                if (isActive) {
                    setResolveError('Unable to load order details.');
                }
            } finally {
                if (isActive) {
                    setIsResolvingOrder(false);
                }
            }
        };

        fetchOrder();

        return () => {
            isActive = false;
        };
    }, [orderId, selectedOrder, orders, contactId, setOrders, setSelectedOrder]);

    const orderForReorder = resolvedOrder || selectedOrder;

    // Initialize with order items or empty
    const [items, setItems] = useState(filterReorderItems(orderForReorder?.items || []));
    const [date, setDate] = useState(deliveryDetails?.date || orderForReorder?.deliveryDate || '');
    const [time, setTime] = useState(deliveryDetails?.time || orderForReorder?.deliveryTime || '11:30');
    const [address, setAddress] = useState(
        deliveryDetails 
            ? `${deliveryDetails.address}, ${deliveryDetails.city}, ${deliveryDetails.state} ${deliveryDetails.zip}`
            : orderForReorder?.deliveryAddress || ''
    );

    useEffect(() => {
        if (!orderForReorder) {
            setItems([]);
            return;
        }

        setItems(filterReorderItems(orderForReorder.items || []));

        if (!deliveryDetails) {
            setDate(prev => prev || orderForReorder.deliveryDate || '');
            setTime(prev => prev || orderForReorder.deliveryTime || '11:30');
            setAddress(prev => prev || orderForReorder.deliveryAddress || '');
        }
    }, [orderForReorder, deliveryDetails]);

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updateQuantity = (idx: number, delta: number) => {
        setItems(prev => prev.map((item, i) => {
            if (i === idx) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const handleLoadItemsToCart = () => {
        const nextItems = filterReorderItems(items);

        if (nextItems.length === 0) {
            return;
        }

        clearCart();

        nextItems.forEach(item => {
            addToCart({
                id: `reorder-${item.name}`,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
            });
        });

        navigate('/cart');
    };

    const handleContinue = () => {
        // Clear existing cart and add reorder items
        clearCart();
        
        const filteredItems = filterReorderItems(items);
        filteredItems.forEach(item => {
            addToCart({
                id: `reorder-${item.name}`,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
            });
        });

        // Update delivery details with new date/time
        if (deliveryDetails) {
            setDeliveryDetails({
                ...deliveryDetails,
                date,
                time,
            });
        }

        navigate('/checkout');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-2xl overflow-hidden">
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                     <button onClick={() => navigate(-1)} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">Modify Reorder</h2>
                    <div className="w-10"></div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
                <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold mb-4">When do you need it?</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" 
                        />
                        <input 
                            type="time" 
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" 
                        />
                    </div>
                </div>

                <div 
                    onClick={handleLoadItemsToCart}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleLoadItemsToCart();
                        }
                    }}
                    className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm space-y-4 cursor-pointer"
                    aria-label="Load reorder items into cart"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold">Items</h3>
                        <span className="text-xs text-primary font-bold">Load to Cart</span>
                    </div>
                    {isResolvingOrder ? (
                        <p className="text-gray-500 text-sm">Loading order items...</p>
                    ) : items.length === 0 ? (
                        <p className="text-gray-500 text-sm">{resolveError || 'No items in order'}</p>
                    ) : (
                        items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <span className="font-medium">{item.name}</span>
                                <div
                                    onClick={(event) => event.stopPropagation()}
                                    className="flex items-center gap-3 bg-gray-100 dark:bg-white/10 rounded-lg px-2 py-1"
                                >
                                    <span 
                                        onClick={() => updateQuantity(idx, -1)}
                                        className="material-symbols-outlined text-sm cursor-pointer"
                                    >remove</span>
                                    <span className="text-sm font-bold">{item.quantity}</span>
                                    <span 
                                        onClick={() => updateQuantity(idx, 1)}
                                        className="material-symbols-outlined text-sm cursor-pointer"
                                    >add</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold mb-2">Deliver to</h3>
                    <input 
                        className="w-full h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Delivery address"
                    />
                </div>
            </main>
             <div className="p-4 bg-white dark:bg-[#1a0c0c] border-t border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex justify-between mb-4 font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                </div>
                <button 
                    onClick={handleContinue} 
                    disabled={items.length === 0}
                    className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    Continue to Payment
                </button>
             </div>
        </div>
    );
};

export const LoyaltyScreen: React.FC = () => {
    const navigate = useNavigate();
    const { contactId, cashbackBalance } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<CashbackTransaction[]>([]);

    useEffect(() => {
        async function fetchCashbackHistory() {
            if (!contactId) {
                setIsLoading(false);
                return;
            }

            try {
                const history = await getCashbackHistory(contactId, 50);
                setTransactions(history);
            } catch (error) {
                console.error('Failed to fetch cashback history:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchCashbackHistory();
    }, [contactId]);

    const formatTransactionDate = (dateString?: string) => {
        if (!dateString) return '--';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return '--';
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-2xl overflow-hidden">
             <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                     <button onClick={() => navigate(-1)} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">Cashback Rewards</h2>
                    <div className="w-10"></div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
                 <div className="bg-primary text-white rounded-2xl p-6 shadow-lg shadow-primary/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="opacity-80 text-sm font-medium mb-1">Current Balance</p>
                        <h3 className="text-4xl font-black tracking-tight mb-4">{formatPrice(cashbackBalance)}</h3>
                        <div className="space-y-1 text-sm bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                            <p>• You earn 5% on every order</p>
                            <p>• No expiration date</p>
                        </div>
                    </div>
                    <span className="absolute -right-8 -top-8 text-9xl text-white opacity-10 material-symbols-outlined">stars</span>
                </div>

                <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-2">How it works</h3>
                    <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">1</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Order any catering from our menu.</p>
                    </div>
                     <div className="flex gap-4 items-start mt-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">2</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Earn 5% cashback automatically on total paid.</p>
                    </div>
                     <div className="flex gap-4 items-start mt-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">3</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Use your balance at checkout on your next order.</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-lg px-1">History</h3>
                    <div className="bg-white dark:bg-[#2a1a1a] rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-4">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No cashback history yet
                            </div>
                        ) : (
                            transactions.map((tx) => {
                                const isEarned = tx.type === 'earned';
                                const displayText = tx.description || (isEarned ? 'Earned cashback' : 'Redeemed cashback');
                                const orderRef = tx.orderId ? `Order #${tx.orderId.slice(-5)}` : tx.invoiceId ? `Invoice #${tx.invoiceId.slice(-5)}` : '';
                                
                                return (
                                    <div key={tx.id} className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold">{displayText}</p>
                                            {orderRef && (
                                                <p className="text-xs text-gray-500">{orderRef}</p>
                                            )}
                                            <p className="text-xs text-gray-500">{formatTransactionDate(tx.createdAt)}</p>
                                        </div>
                                        <span className={`font-bold ${isEarned ? 'text-green-600' : 'text-red-600'}`}>
                                            {isEarned ? '+' : '-'} {formatPrice(tx.amount)}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export const ScheduledOrdersScreen: React.FC = () => {
    const navigate = useNavigate();
    const { contactId, contact, deliveryDetails } = useAppContext();
    const [scheduledOrders, setScheduledOrders] = useState<ScheduledOrder[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');
    const [frequency, setFrequency] = useState<ScheduleFrequency>('weekly');
    const [nextDate, setNextDate] = useState('');
    const [time, setTime] = useState('11:30');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!contactId) {
            setScheduledOrders([]);
            return;
        }
        setScheduledOrders(getScheduledOrders<ScheduledOrder>(contactId));
    }, [contactId]);

    useEffect(() => {
        const defaultAddress = contact?.address1
            ? `${contact.address1}${contact.city ? `, ${contact.city}` : ''}${contact.state ? `, ${contact.state}` : ''} ${contact.postalCode || ''}`.trim()
            : deliveryDetails
                ? `${deliveryDetails.address}, ${deliveryDetails.city}, ${deliveryDetails.state} ${deliveryDetails.zip}`
                : '';
        if (!address && defaultAddress) {
            setAddress(defaultAddress);
        }
    }, [contact, deliveryDetails, address]);

    const handleCreateSchedule = () => {
        if (!contactId) {
            setError('Please sign in to create a schedule.');
            return;
        }
        if (!name.trim()) {
            setError('Please enter a schedule name.');
            return;
        }
        if (!nextDate) {
            setError('Please select a next delivery date.');
            return;
        }
        if (!time) {
            setError('Please select a delivery time.');
            return;
        }
        if (!address.trim()) {
            setError('Please enter a delivery address.');
            return;
        }

        const nextSchedule: ScheduledOrder = {
            id: `schedule-${Date.now()}`,
            name: name.trim(),
            frequency,
            nextDate,
            time,
            address: address.trim(),
            notes: notes.trim() || undefined,
            createdAt: new Date().toISOString(),
        };

        const nextSchedules = [nextSchedule, ...scheduledOrders];
        setScheduledOrders(nextSchedules);
        saveScheduledOrders(contactId, nextSchedules);

        setName('');
        setFrequency('weekly');
        setNextDate('');
        setTime('11:30');
        setNotes('');
        setIsCreating(false);
        setError('');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-xl overflow-hidden">
             <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                     <button onClick={() => navigate(-1)} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">Scheduled Orders</h2>
                     <div className="w-10"></div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                {scheduledOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">event_repeat</span>
                        <p className="text-gray-500 mb-2">No scheduled orders</p>
                        <p className="text-sm text-gray-400">Set up recurring orders for your team</p>
                    </div>
                ) : (
                    scheduledOrders.map((schedule) => (
                        <div key={schedule.id} className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5 space-y-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-bold text-lg">{schedule.name}</p>
                                    <p className="text-sm text-gray-500">{schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} cadence</p>
                                </div>
                                <span className="text-xs text-primary font-bold">{schedule.nextDate} @ {schedule.time}</span>
                            </div>
                            <p className="text-xs text-gray-500">{schedule.address}</p>
                            {schedule.notes && (
                                <p className="text-xs text-gray-400">{schedule.notes}</p>
                            )}
                        </div>
                    ))
                )}

                {isCreating && (
                    <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Schedule Name</label>
                            <input
                                className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                                placeholder="Weekly Team Lunch"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Frequency</label>
                                <select
                                    className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value as ScheduleFrequency)}
                                >
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Biweekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Next Date</label>
                                <input
                                    type="date"
                                    className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                                    value={nextDate}
                                    onChange={(e) => setNextDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Time</label>
                                <input
                                    type="time"
                                    className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Address</label>
                                <input
                                    className="w-full h-11 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                                    placeholder="Delivery address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Notes (optional)</label>
                            <textarea
                                className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                                placeholder="Special instructions or preferences"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => { setIsCreating(false); setError(''); }} className="flex-1 h-11 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold">
                                Cancel
                            </button>
                            <button onClick={handleCreateSchedule} className="flex-1 h-11 rounded-lg bg-primary text-white font-bold">
                                Save Schedule
                            </button>
                        </div>
                    </div>
                )}
            </main>
             <div className="p-4 shrink-0">
                <button onClick={() => setIsCreating(true)} className="w-full h-12 border-2 border-primary border-dashed text-primary font-bold rounded-xl flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">add</span> Create New Schedule
                </button>
             </div>
        </div>
    );
};

export const InvoicesScreen: React.FC = () => {
    const navigate = useNavigate();
    const { contactId, orders, setOrders } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            if (!contactId) {
                setIsLoading(false);
                return;
            }

            // Skip if already loaded
            if (orders.length > 0) {
                setIsLoading(false);
                return;
            }

            try {
                const data = await ghlService.getOrdersByContactId(contactId);
                setOrders(data || []);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchOrders();
    }, [contactId, orders.length, setOrders]);

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-xl overflow-hidden">
             <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                     <button onClick={() => navigate(-1)} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">Invoices</h2>
                     <div className="w-10"></div>
                </div>
            </header>
             <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">description</span>
                        <p className="text-gray-500">No invoices yet</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#2a1a1a] rounded-xl shadow-sm">
                            <div>
                                <p className="font-bold">Invoice #INV-{order.id.slice(-5)}</p>
                                <p className="text-xs text-gray-500">{formatOrderDate(order.createdAt)} • {formatPrice(order.totalAmount)}</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold rounded ${
                                    order.status === 'completed' || order.status === 'delivered' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {order.status === 'completed' || order.status === 'delivered' ? 'Paid' : 'Pending'}
                                </span>
                            </div>
                            <button className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">download</span>
                            </button>
                        </div>
                    ))
                )}
             </main>
        </div>
    );
};

export const AddressManagementScreen: React.FC = () => {
    const navigate = useNavigate();
    const { contactId, contact, deliveryDetails, setDeliveryDetails, clearDeliveryDetails, setContactSession } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [street, setStreet] = useState(deliveryDetails?.address || contact?.address1 || '');
    const [city, setCity] = useState(deliveryDetails?.city || contact?.city || '');
    const [stateValue, setStateValue] = useState(deliveryDetails?.state || contact?.state || '');
    const [zip, setZip] = useState(deliveryDetails?.zip || contact?.postalCode || '');
    
    // Get saved address from contact or delivery details
    const savedAddress = contact?.address1 
        ? `${contact.address1}${contact.city ? `, ${contact.city}` : ''}${contact.state ? `, ${contact.state}` : ''} ${contact.postalCode || ''}`
        : deliveryDetails 
            ? `${deliveryDetails.address}, ${deliveryDetails.city}, ${deliveryDetails.state} ${deliveryDetails.zip}`
            : null;

    useEffect(() => {
        if (!isEditing && savedAddress) {
            setStreet(contact?.address1 || deliveryDetails?.address || '');
            setCity(contact?.city || deliveryDetails?.city || '');
            setStateValue(contact?.state || deliveryDetails?.state || '');
            setZip(contact?.postalCode || deliveryDetails?.zip || '');
        }
    }, [isEditing, savedAddress, contact, deliveryDetails]);

    const handleSaveAddress = async () => {
        if (!street.trim()) {
            setError('Please enter a street address.');
            return;
        }
        if (!city.trim()) {
            setError('Please enter a city.');
            return;
        }
        if (!stateValue.trim()) {
            setError('Please enter a state.');
            return;
        }
        if (!zip.trim()) {
            setError('Please enter a ZIP code.');
            return;
        }

        setError('');
        setIsSaving(true);

        const addressPayload = {
            address: street.trim(),
            city: city.trim(),
            state: stateValue.trim(),
            zip: zip.trim(),
        };

        try {
            if (contactId) {
                await ghlService.updateContactAddress(contactId, {
                    address: addressPayload.address,
                    city: addressPayload.city,
                    state: addressPayload.state,
                    postalCode: addressPayload.zip,
                });
                try {
                    const profileResponse = await ghlService.getContactProfile(contactId);
                    const nextContact = profileResponse.contact || profileResponse || null;
                    setContactSession(contactId, nextContact);
                } catch (profileError) {
                    console.warn('[AddressManagement] Failed to refresh contact profile:', profileError);
                }
            }

            setDeliveryDetails({
                address: addressPayload.address,
                city: addressPayload.city,
                state: addressPayload.state,
                zip: addressPayload.zip,
                date: deliveryDetails?.date || '',
                time: deliveryDetails?.time || '11:30',
                specialInstructions: deliveryDetails?.specialInstructions || '',
            });
            setIsEditing(false);
        } catch (saveError) {
            console.error('[AddressManagement] Failed to save address:', saveError);
            setError('Unable to save address. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAddress = async () => {
        setError('');
        setIsSaving(true);
        try {
            if (contactId) {
                await ghlService.updateContactProfile(contactId, {
                    address1: null,
                    city: null,
                    state: null,
                    postalCode: null,
                });
                try {
                    const profileResponse = await ghlService.getContactProfile(contactId);
                    const nextContact = profileResponse.contact || profileResponse || null;
                    setContactSession(contactId, nextContact);
                } catch (profileError) {
                    console.warn('[AddressManagement] Failed to refresh contact profile:', profileError);
                }
            }
            clearDeliveryDetails();
            setStreet('');
            setCity('');
            setStateValue('');
            setZip('');
        } catch (deleteError) {
            console.error('[AddressManagement] Failed to delete address:', deleteError);
            setError('Unable to delete address. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-xl overflow-hidden">
             <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                     <button onClick={() => navigate(-1)} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">Delivery Addresses</h2>
                     <div className="w-10"></div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                {savedAddress && !isEditing ? (
                    <div className="bg-white dark:bg-[#2a1a1a] p-4 rounded-xl shadow-sm border-2 border-primary">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold">Primary Address</h3>
                            <span className="material-symbols-outlined text-primary">check_circle</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{savedAddress}</p>
                        <div className="flex justify-end gap-3 mt-3">
                             <button onClick={() => setIsEditing(true)} className="text-gray-400 text-sm font-medium">Edit</button>
                             <button onClick={handleDeleteAddress} disabled={isSaving} className="text-red-500 text-sm font-medium disabled:opacity-50">Delete</button>
                        </div>
                    </div>
                ) : isEditing ? (
                    <div className="bg-white dark:bg-[#2a1a1a] p-4 rounded-xl shadow-sm space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Street Address</label>
                                <input 
                                    className="w-full h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                    placeholder="123 Main St"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">City</label>
                                    <input 
                                        className="w-full h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="Los Angeles"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">State</label>
                                    <input 
                                        className="w-full h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                                        value={stateValue}
                                        onChange={(e) => setStateValue(e.target.value)}
                                        placeholder="CA"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">ZIP Code</label>
                                <input 
                                    className="w-full h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                                    value={zip}
                                    onChange={(e) => setZip(e.target.value)}
                                    placeholder="90503"
                                />
                            </div>
                        </div>
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                        <div className="flex gap-3">
                            {savedAddress && (
                                <button onClick={() => { setIsEditing(false); setError(''); }} className="flex-1 h-12 border border-gray-200 dark:border-gray-700 rounded-lg font-bold text-gray-600 dark:text-gray-300">
                                    Cancel
                                </button>
                            )}
                            <button onClick={handleSaveAddress} disabled={isSaving} className="flex-1 h-12 bg-primary text-white rounded-lg font-bold disabled:opacity-60">
                                {isSaving ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">location_off</span>
                        <p className="text-gray-500">No saved addresses</p>
                    </div>
                )}
                
                 {!savedAddress && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="w-full h-14 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center gap-2 font-bold text-gray-500">
                        <span className="material-symbols-outlined">add</span> Add New Address
                    </button>
                 )}
            </main>
        </div>
    );
};

export const ProfileEditScreen: React.FC = () => {
    const navigate = useNavigate();
    const { contactId, contact, setContactSession } = useAppContext();
    const [firstName, setFirstName] = useState(contact?.firstName || '');
    const [lastName, setLastName] = useState(contact?.lastName || '');
    const [email, setEmail] = useState(contact?.email || '');
    const [phone, setPhone] = useState(contact?.phone || '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSave = async () => {
        if (!contactId) {
            setError('Please sign in to update your profile.');
            return;
        }
        if (!firstName.trim() || !lastName.trim()) {
            setError('Please enter your first and last name.');
            return;
        }
        if (email && !email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        setError('');
        setSuccess('');
        setIsSaving(true);

        try {
            await ghlService.updateContactProfile(contactId, {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim() || null,
                phone: phone.trim() || null,
            });
            const profileResponse = await ghlService.getContactProfile(contactId);
            const nextContact: GHLContact = profileResponse.contact || profileResponse || null;
            setContactSession(contactId, nextContact);
            setSuccess('Profile updated successfully.');
        } catch (saveError) {
            console.error('[ProfileEdit] Failed to update profile:', saveError);
            setError('Unable to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-xl overflow-hidden">
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                    <button onClick={() => navigate(-1)} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">Edit Profile</h2>
                    <div className="w-10"></div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">First Name</label>
                            <input
                                className="w-full h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Lin"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Last Name</label>
                            <input
                                className="w-full h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Marcel"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Email</label>
                        <input
                            className="w-full h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Phone</label>
                        <input
                            className="w-full h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}
            </main>
            <div className="p-4 bg-white dark:bg-[#1a0c0c] border-t border-gray-100 dark:border-gray-800 shrink-0">
                <button onClick={handleSave} disabled={isSaving} className="w-full h-12 bg-primary text-white rounded-xl font-bold disabled:opacity-60">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export const PaymentMethodsScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-xl overflow-hidden">
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                    <button onClick={() => navigate(-1)} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">Payment Methods</h2>
                    <div className="w-10"></div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">credit_card</span>
                    <p className="text-gray-500 mb-2">No saved payment methods</p>
                    <p className="text-sm text-gray-400">Secure payment storage is coming soon.</p>
                </div>
            </main>
            <div className="p-4 shrink-0">
                <button className="w-full h-12 border-2 border-primary border-dashed text-primary font-bold rounded-xl flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">add</span> Add Payment Method
                </button>
            </div>
        </div>
    );
};

export const ContactUsScreen: React.FC = () => {
    const navigate = useNavigate();
    const supportEmail = 'support@togos.app';
    const supportPhone = '+1 310-214-8222';

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-xl overflow-hidden">
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                    <button onClick={() => navigate(-1)} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">Contact Us</h2>
                    <div className="w-10"></div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm space-y-3">
                    <p className="font-bold text-lg">We are here to help</p>
                    <p className="text-sm text-gray-500">Reach out anytime for order support, billing questions, or catering guidance.</p>
                </div>
                <button
                    onClick={() => window.open(`mailto:${supportEmail}`, '_blank')}
                    className="w-full bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm flex items-center justify-between"
                >
                    <div>
                        <p className="font-bold">Email Support</p>
                        <p className="text-sm text-gray-500">{supportEmail}</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                </button>
                <button
                    onClick={() => window.open(`tel:${supportPhone}`, '_self')}
                    className="w-full bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm flex items-center justify-between"
                >
                    <div>
                        <p className="font-bold">Call Us</p>
                        <p className="text-sm text-gray-500">{supportPhone}</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                </button>
            </main>
        </div>
    );
};

export const FaqsScreen: React.FC = () => {
    const navigate = useNavigate();
    const faqs = [
        {
            question: 'How does cashback work?',
            answer: 'You earn 5% cashback on every completed order and can redeem it at checkout.',
        },
        {
            question: 'Can I edit a scheduled order?',
            answer: 'Scheduled orders are saved locally for now. You can update or delete them once editing is enabled.',
        },
        {
            question: 'Do you offer same-day catering?',
            answer: 'Yes, when availability allows. We recommend scheduling at least 24 hours ahead for large orders.',
        },
        {
            question: 'How do I update my delivery address?',
            answer: 'Go to Account > Delivery Addresses to edit and save your primary address.',
        },
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-xl overflow-hidden">
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                    <button onClick={() => navigate(-1)} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">FAQs</h2>
                    <div className="w-10"></div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
                {faqs.map((faq) => (
                    <div key={faq.question} className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm space-y-2">
                        <p className="font-bold">{faq.question}</p>
                        <p className="text-sm text-gray-500">{faq.answer}</p>
                    </div>
                ))}
            </main>
        </div>
    );
};
