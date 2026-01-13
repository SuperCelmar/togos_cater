import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAppContext } from '../context/AppContext';
import { GHLOrder, GHLContact } from '../../types';
import { BottomNav } from './HomeScreens';
import { ghlService } from '../services/ghl';
import { formatPrice } from '../lib/menuService';

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

export const OrdersScreen: React.FC = () => {
  const navigate = useNavigate();
  const { contactId, orders, setOrders, setSelectedOrder } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#181111] dark:text-white w-full max-w-md mx-auto shadow-2xl h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-20 flex items-center bg-white dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="w-10"></div>
        <h2 className="text-[#181111] dark:text-white text-xl font-extrabold leading-tight tracking-[-0.015em] flex-1 text-center">My Orders</h2>
        <div className="w-10"></div>
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
                    <button className="w-full h-12 border-2 border-primary text-primary font-bold rounded-xl">Download Receipt (PDF)</button>
                    <button className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 text-[#181111] dark:text-white font-bold rounded-xl">Download Invoice (PDF)</button>
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
                setOrders((data || []).slice(0, 5));
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
    const { selectedOrder, deliveryDetails, setDeliveryDetails, addToCart, clearCart } = useAppContext();
    
    // Initialize with order items or empty
    const [items, setItems] = useState(selectedOrder?.items || []);
    const [date, setDate] = useState(deliveryDetails?.date || '');
    const [time, setTime] = useState(deliveryDetails?.time || '11:30');
    const [address, setAddress] = useState(
        deliveryDetails 
            ? `${deliveryDetails.address}, ${deliveryDetails.city}, ${deliveryDetails.state} ${deliveryDetails.zip}`
            : selectedOrder?.deliveryAddress || ''
    );

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updateQuantity = (idx: number, delta: number) => {
        setItems(prev => prev.map((item, i) => {
            if (i === idx) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const handleContinue = () => {
        // Clear existing cart and add reorder items
        clearCart();
        
        items.forEach(item => {
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

                <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm space-y-4">
                    <h3 className="font-bold">Items</h3>
                    {items.length === 0 ? (
                        <p className="text-gray-500 text-sm">No items in order</p>
                    ) : (
                        items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <span className="font-medium">{item.name}</span>
                                <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/10 rounded-lg px-2 py-1">
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
    const { contactId, cashbackBalance, orders, setOrders } = useAppContext();
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
                setOrders((data || []).slice(0, 10));
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchOrders();
    }, [contactId, orders.length, setOrders]);

    const recentOrders = orders.slice(0, 10);

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
                        ) : recentOrders.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No cashback history yet
                            </div>
                        ) : (
                            recentOrders.map((order) => {
                                const cashbackEarned = order.totalAmount * 0.05;
                                return (
                                    <div key={order.id} className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold">Order #{order.id.slice(-5)}</p>
                                            <p className="text-xs text-gray-500">{formatOrderDate(order.createdAt)}</p>
                                        </div>
                                        <span className="text-green-600 font-bold">+ {formatPrice(cashbackEarned)}</span>
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
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">event_repeat</span>
                    <p className="text-gray-500 mb-2">No scheduled orders</p>
                    <p className="text-sm text-gray-400">Set up recurring orders for your team</p>
                </div>
            </main>
             <div className="p-4 shrink-0">
                <button className="w-full h-12 border-2 border-primary border-dashed text-primary font-bold rounded-xl flex items-center justify-center gap-2">
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
    const { contact, deliveryDetails } = useAppContext();
    
    // Get saved address from contact or delivery details
    const savedAddress = contact?.address1 
        ? `${contact.address1}${contact.city ? `, ${contact.city}` : ''}${contact.state ? `, ${contact.state}` : ''} ${contact.postalCode || ''}`
        : deliveryDetails 
            ? `${deliveryDetails.address}, ${deliveryDetails.city}, ${deliveryDetails.state} ${deliveryDetails.zip}`
            : null;

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
                {savedAddress ? (
                    <div className="bg-white dark:bg-[#2a1a1a] p-4 rounded-xl shadow-sm border-2 border-primary">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold">Primary Address</h3>
                            <span className="material-symbols-outlined text-primary">check_circle</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{savedAddress}</p>
                        <div className="flex justify-end gap-3 mt-3">
                             <span className="material-symbols-outlined text-gray-400 text-sm cursor-pointer">edit</span>
                             <span className="material-symbols-outlined text-gray-400 text-sm cursor-pointer">delete</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">location_off</span>
                        <p className="text-gray-500">No saved addresses</p>
                    </div>
                )}
                
                 <button className="w-full h-14 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center gap-2 font-bold text-gray-500">
                    <span className="material-symbols-outlined">add</span> Add New Address
                 </button>
             </main>
        </div>
    );
};
