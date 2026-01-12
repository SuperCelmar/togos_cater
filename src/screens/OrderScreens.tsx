import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAppContext, SelectedItem } from '../context/AppContext';
import { CartItem } from '../../types';
import { ghlService } from '../services/ghl';
import { formatPrice, getServesText, calculateRecommendedQuantity } from '../lib/menuService';

// Default placeholder image
const PLACEHOLDER_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVUfzu5A_5qtIWFCJ1BbSQFKtgwjv9VTjyMoJv-Jcb-ih6a_9CKgn4PAXoGtO75BRbE_D7Dgzg1nZdqZFk0irFahjC4LGUnvMxtr7YrZNFF0F8Fl5SxQiAcBvMnlFRMezskYmFLgYtsi1a8rsOoj0z1DxlVS3WWTGK2w7bDHi7KUNE18eAlXR5bBxvf6CvxQ5M1V982aC2nIGaLJuPfGo7QXwbelShfccxf_fvHKnlmvBcbZtZJpXWbg-Rfqv5rGZDJXNhUhcSmYY';

export const ItemDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { guestCount, addToCart } = useAppContext();
  
  // Get selected item from route state
  const selectedItem = (location.state as { selectedItem?: SelectedItem })?.selectedItem;
  
  // Calculate recommended quantity based on guest count
  const recommendedQty = guestCount && selectedItem?.serves_min
    ? calculateRecommendedQuantity(guestCount, selectedItem.serves_min, selectedItem.serves_max || null)
    : 1;
  
  const [quantity, setQuantity] = useState(recommendedQty);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Fallback values if no item selected
  const itemName = selectedItem?.name || 'Menu Item';
  const itemPrice = selectedItem?.price || 0;
  const itemDescription = selectedItem?.description || '';
  const itemImage = selectedItem?.image_url || PLACEHOLDER_IMAGE;
  const servesText = getServesText(selectedItem?.serves_min || null, selectedItem?.serves_max || null);

  const totalPrice = itemPrice * quantity;

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: selectedItem?.id || '',
      name: itemName,
      price: itemPrice,
      quantity,
      image_url: itemImage,
      specialInstructions: specialInstructions || undefined,
    };

    addToCart(cartItem);
    navigate('/cart');
  };

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => Math.max(1, q - 1));

  return (
    <div className="relative flex h-screen w-full flex-col bg-white dark:bg-background-dark group/design-root overflow-hidden max-w-md mx-auto shadow-xl">
        <div className="sticky top-0 z-50 flex items-center bg-white/90 dark:bg-background-dark/90 backdrop-blur-md p-4 pb-2 justify-between shrink-0">
            <div onClick={() => navigate(-1)} className="text-[#181111] dark:text-white flex size-12 shrink-0 items-center cursor-pointer">
                <span className="material-symbols-outlined">arrow_back_ios</span>
            </div>
            <div className="flex w-12 items-center justify-end">
                <span className="material-symbols-outlined">share</span>
            </div>
        </div>
        <div className="flex-grow pb-32 overflow-y-auto no-scrollbar">
            <div 
                className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-gray-200 dark:bg-zinc-800 min-h-80" 
                style={{ backgroundImage: `url("${itemImage}")` }}
            ></div>
            <div className="px-4">
                <h1 className="text-[#181111] dark:text-white tracking-tight text-[32px] font-bold leading-tight pt-6">{itemName}</h1>
                <div className="flex items-baseline justify-between pt-1">
                    <h2 className="text-[#181111] dark:text-white text-[24px] font-bold leading-tight tracking-[-0.015em]">{formatPrice(itemPrice)}</h2>
                    {servesText && (
                        <span className="text-sm text-gray-500">{servesText}</span>
                    )}
                </div>
                {itemDescription && (
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm font-normal leading-relaxed pt-4">
                        {itemDescription}
                    </p>
                )}
                {guestCount && recommendedQty > 1 && (
                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/20">
                        <p className="text-sm text-primary font-medium">
                            Recommended: {recommendedQty} for {guestCount} guests
                        </p>
                    </div>
                )}
            </div>
            <div className="h-6"></div>
            <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 mx-4"></div>
            <div className="px-4 pt-6">
                <h3 className="text-[#181111] dark:text-white text-lg font-bold pb-4">Quantity</h3>
                <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 w-max">
                    <button 
                        onClick={decrementQuantity}
                        className="flex items-center justify-center w-12 h-12 text-primary hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                    <button 
                        onClick={incrementQuantity}
                        className="flex items-center justify-center w-12 h-12 text-primary hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>
            </div>
             <div className="px-4 pt-8">
                <h3 className="text-[#181111] dark:text-white text-lg font-bold pb-3">Special Instructions</h3>
                <textarea 
                    className="w-full h-32 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary text-zinc-800 dark:text-zinc-200 resize-none font-display text-sm" 
                    placeholder="Any allergies or special requests?"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                ></textarea>
            </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-background-dark/95 backdrop-blur-lg border-t border-zinc-100 dark:border-zinc-800 p-4 pb-8 z-50">
            <button onClick={handleAddToCart} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between transition-all active:scale-[0.98]">
                <span>Add to Cart</span>
                <span className="text-white/90 font-medium">{formatPrice(totalPrice)}</span>
            </button>
        </div>
    </div>
  );
};

export const CartScreen: React.FC = () => {
    const navigate = useNavigate();
    const { 
      guestCount, 
      deliveryDetails, 
      cartItems, 
      cashbackBalance,
      updateCartItemQuantity,
      removeFromCart 
    } = useAppContext();
    
    const [applyCashback, setApplyCashback] = useState(cashbackBalance > 0);

    const fullAddress = deliveryDetails 
        ? `${deliveryDetails.address}, ${deliveryDetails.city}, ${deliveryDetails.state} ${deliveryDetails.zip}`.trim()
        : 'No address set';

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.08;
    const tax = subtotal * taxRate;
    const deliveryFee = subtotal > 0 ? 15 : 0;
    const cashbackDiscount = applyCashback ? Math.min(cashbackBalance, subtotal) : 0;
    const total = subtotal + tax + deliveryFee - cashbackDiscount;

    const handleUpdateQuantity = (itemId: string, delta: number) => {
        const item = cartItems.find(i => i.id === itemId);
        if (item) {
            updateCartItemQuantity(itemId, item.quantity + delta);
        }
    };
    
    return (
        <div className="relative flex h-screen w-full max-w-md mx-auto flex-col bg-background-light dark:bg-background-dark overflow-hidden shadow-2xl">
            <header className="sticky top-0 z-50 flex items-center bg-white dark:bg-[#2d1a1a] p-4 pb-2 justify-between border-b border-gray-100 dark:border-white/10 shrink-0">
                <div onClick={() => navigate(-1)} className="text-[#181111] dark:text-white flex size-12 shrink-0 items-center cursor-pointer">
                    <span className="material-symbols-outlined">arrow_back_ios</span>
                </div>
                <div className="flex-1 text-center pr-12">
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Your Order</h2>
                    {guestCount && (
                        <p className="text-xs text-primary font-medium">Catering for {guestCount} people</p>
                    )}
                </div>
            </header>
            <div className="flex-1 pb-44 overflow-y-auto no-scrollbar">
                {/* Cart Items */}
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">shopping_cart</span>
                        <p className="text-gray-500">Your cart is empty</p>
                        <button 
                            onClick={() => navigate('/menu')}
                            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-bold"
                        >
                            Browse Menu
                        </button>
                    </div>
                ) : (
                    <>
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-[#2d1a1a] px-4 min-h-[88px] py-4 border-b border-gray-50 dark:border-white/5">
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex justify-between items-start">
                                        <p className="text-[#181111] dark:text-white text-base font-bold leading-normal">{item.name}</p>
                                        <span 
                                            onClick={() => removeFromCart(item.id)}
                                            className="material-symbols-outlined text-gray-400 text-sm cursor-pointer hover:text-red-500"
                                        >delete</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/10 rounded-lg px-2 py-1">
                                            <span 
                                                onClick={() => handleUpdateQuantity(item.id, -1)}
                                                className="material-symbols-outlined text-sm cursor-pointer"
                                            >remove</span>
                                            <span className="text-sm font-bold">{item.quantity}</span>
                                            <span 
                                                onClick={() => handleUpdateQuantity(item.id, 1)}
                                                className="material-symbols-outlined text-sm cursor-pointer"
                                            >add</span>
                                        </div>
                                        <p className="text-[#181111] dark:text-white text-base font-bold leading-normal">
                                            {formatPrice(item.price * item.quantity)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Delivery Details */}
                        <div className="px-4 pt-6">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-[#181111] dark:text-white text-lg font-bold">Delivery Details</h2>
                                <button onClick={() => navigate('/delivery-setup')} className="text-primary text-sm font-bold">Edit</button>
                            </div>
                            <div className="bg-white dark:bg-[#2d1a1a] rounded-xl p-4 shadow-sm">
                                <p className="font-bold text-[#181111] dark:text-white">{fullAddress}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {deliveryDetails?.date || 'No date set'} @ {deliveryDetails?.time || '--:--'}
                                </p>
                            </div>
                        </div>
                        
                        {/* Order Summary */}
                        <div className="px-4 pt-6 pb-4">
                            <h2 className="text-[#181111] dark:text-white text-lg font-bold mb-3">Order Summary</h2>
                            <div className="bg-white dark:bg-[#2d1a1a] rounded-xl p-4 shadow-sm space-y-3">
                                {guestCount && (
                                    <div className="flex justify-between text-sm pb-2 border-b border-gray-100 dark:border-white/10">
                                        <span className="text-gray-500">Guests</span>
                                        <span className="text-primary font-bold">{guestCount} people</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="text-[#181111] dark:text-white">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tax (8%)</span>
                                    <span className="text-[#181111] dark:text-white">{formatPrice(tax)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Delivery Fee</span>
                                    <span className="text-[#181111] dark:text-white">{formatPrice(deliveryFee)}</span>
                                </div>
                                {cashbackBalance > 0 && (
                                    <div className="flex items-center justify-between py-2 px-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <input 
                                                checked={applyCashback}
                                                onChange={(e) => setApplyCashback(e.target.checked)}
                                                className="rounded border-primary text-primary focus:ring-primary h-5 w-5" 
                                                type="checkbox"
                                            />
                                            <span className="text-sm font-medium text-primary">Apply {formatPrice(cashbackBalance)} Cashback?</span>
                                        </div>
                                        {applyCashback && (
                                            <span className="text-primary font-bold">-{formatPrice(cashbackDiscount)}</span>
                                        )}
                                    </div>
                                )}
                                <div className="h-px bg-gray-100 dark:bg-white/10 pt-1"></div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-2xl font-black text-primary">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-[#2d1a1a] p-4 border-t border-gray-100 dark:border-white/10 flex flex-col gap-3">
                    <button onClick={() => navigate('/checkout')} className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform">
                        Continue to Payment
                    </button>
                    <button onClick={() => navigate('/menu')} className="w-full bg-transparent text-[#181111] dark:text-white py-2 rounded-xl font-medium text-sm">
                        Continue Shopping
                    </button>
                </div>
            )}
        </div>
    );
};

export const CheckoutScreen: React.FC = () => {
    const navigate = useNavigate();
    const { 
      cartItems, 
      deliveryDetails, 
      cashbackBalance,
      contact,
      contactId,
      setCashbackBalance,
      clearCart 
    } = useAppContext();
    
    const [isProcessing, setIsProcessing] = useState(false);

    // Calculate total
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const deliveryFee = subtotal > 0 ? 15 : 0;
    const total = subtotal + tax + deliveryFee;

    // Get company name from contact
    const companyName = contact?.companyName || contact?.name || 
        (contact?.firstName && contact?.lastName ? `${contact.firstName} ${contact.lastName}` : '');

    const handleCompleteOrder = async () => {
        setIsProcessing(true);
        
        try {
            // Save the delivery address to GHL for future reuse
            if (deliveryDetails?.address && contactId) {
                try {
                    await ghlService.updateContactAddress(contactId, {
                        address: deliveryDetails.address,
                        city: deliveryDetails.city,
                        state: deliveryDetails.state,
                        postalCode: deliveryDetails.zip,
                        label: 'Delivery Address'
                    });
                } catch (addressError) {
                    console.error('Failed to save address to GHL:', addressError);
                }
            }

            // Calculate cashback earned (5% of total)
            const cashbackEarned = total * 0.05;
            const newCashbackBalance = cashbackBalance + cashbackEarned;

            // Update cashback balance
            setCashbackBalance(newCashbackBalance);
            
            // Clear cart
            clearCart();

            navigate('/success', { 
              state: { 
                orderTotal: total,
                cashbackEarned,
                newCashbackBalance,
                items: cartItems,
                deliveryDetails 
              },
              replace: true 
            });
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col text-[#181111] dark:text-white w-full max-w-md mx-auto shadow-2xl overflow-hidden">
             <header className="sticky top-0 z-50 bg-white dark:bg-[#181111] border-b border-gray-200 dark:border-gray-800 shrink-0">
                <div className="flex items-center p-4 pb-2 justify-between">
                    <div onClick={() => navigate(-1)} className="text-[#181111] dark:text-white flex size-12 shrink-0 items-center cursor-pointer">
                        <span className="material-symbols-outlined">arrow_back_ios</span>
                    </div>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Checkout</h2>
                     <div className="flex items-center justify-end">
                        <div className="text-right">
                            <p className="text-primary text-base font-bold leading-normal tracking-[0.015em] shrink-0">{formatPrice(total)}</p>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
                <div className="px-4 pt-6">
                    <h2 className="text-[#181111] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Payment Method</h2>
                </div>
                <div className="flex flex-col gap-3 p-4">
                     <label className="flex items-center gap-4 rounded-xl border border-solid border-[#e6dbdb] dark:border-gray-700 bg-white dark:bg-[#2a1a1a] p-[18px] cursor-pointer transition-all hover:border-primary/50">
                        <input defaultChecked className="h-5 w-5 border-2 border-[#e6dbdb] bg-transparent text-transparent checked:border-primary focus:outline-none focus:ring-0 focus:ring-offset-0 checked:focus:border-primary" name="payment-method" type="radio"/>
                        <div className="flex grow items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">credit_card</span>
                            </div>
                            <div className="flex flex-col w-full">
                                <p className="text-[#181111] dark:text-white text-sm font-semibold leading-normal">Pay now with card</p>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-[#896161] dark:text-gray-400 text-xs font-normal leading-normal">Visa ••• 4242</p>
                                    <span className="text-primary text-xs font-bold">Change</span>
                                </div>
                            </div>
                        </div>
                    </label>
                     <label className="flex items-center gap-4 rounded-xl border border-solid border-[#e6dbdb] dark:border-gray-700 bg-white dark:bg-[#2a1a1a] p-[18px] cursor-pointer transition-all hover:border-primary/50">
                        <input className="h-5 w-5 border-2 border-[#e6dbdb] bg-transparent text-transparent checked:border-primary focus:outline-none focus:ring-0 focus:ring-offset-0 checked:focus:border-primary" name="payment-method" type="radio"/>
                        <div className="flex grow items-center gap-3">
                             <div className="flex size-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">description</span>
                            </div>
                            <div className="flex flex-col w-full">
                                <p className="text-[#181111] dark:text-white text-sm font-semibold leading-normal">Send me an invoice</p>
                                <p className="text-[#896161] dark:text-gray-400 text-xs font-normal leading-normal">Net-30 Terms</p>
                            </div>
                        </div>
                    </label>
                </div>
                 <div className="px-4 pt-2">
                    <label className="flex flex-col min-w-40 flex-1">
                        <p className="text-[#181111] dark:text-white text-sm font-medium leading-normal pb-2">Company name for invoice</p>
                        <input 
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181111] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-[#e6dbdb] dark:border-gray-700 bg-white dark:bg-[#2a1a1a] h-14 placeholder:text-[#896161] p-[15px] text-base font-normal leading-normal" 
                            defaultValue={companyName}
                            placeholder="Your company name"
                        />
                    </label>
                </div>
                 <div className="flex items-center justify-center gap-2 px-4 py-6 text-[#896161] dark:text-gray-400">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    <p className="text-xs font-medium uppercase tracking-widest">Secure 256-bit SSL Encrypted</p>
                </div>
            </main>
            <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-[#181111] border-t border-gray-200 dark:border-gray-800 px-4 py-6">
                <button 
                    onClick={handleCompleteOrder} 
                    disabled={isProcessing || cartItems.length === 0}
                    className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-primary text-white text-lg font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-70"
                >
                    {isProcessing ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                            <span className="truncate">Processing...</span>
                        </>
                    ) : (
                        <>
                            <span className="truncate">Complete Order</span>
                            <span className="material-symbols-outlined ml-2">check_circle</span>
                        </>
                    )}
                </button>
            </footer>
        </div>
    );
};

export const OrderSuccessScreen: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { deliveryDetails, cashbackBalance } = useAppContext();
    
    // Get order data from route state
    const orderState = location.state as { 
      orderTotal?: number; 
      cashbackEarned?: number;
      newCashbackBalance?: number;
      items?: CartItem[];
      deliveryDetails?: typeof deliveryDetails;
    } | null;
    
    const orderTotal = orderState?.orderTotal || 0;
    const cashbackEarned = orderState?.cashbackEarned || orderTotal * 0.05;
    const orderItems = orderState?.items || [];
    const orderDeliveryDetails = orderState?.deliveryDetails || deliveryDetails;
    
    const fullAddress = orderDeliveryDetails 
        ? `${orderDeliveryDetails.address}, ${orderDeliveryDetails.city}, ${orderDeliveryDetails.state} ${orderDeliveryDetails.zip}`.trim()
        : 'No address';

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen w-full max-w-md mx-auto shadow-2xl relative flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                 <div className="flex items-center justify-center pt-12 pb-6">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-[bounce_1s_ease-in-out_infinite]">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 !text-6xl">check_circle</span>
                    </div>
                </div>
                <div className="px-6 text-center">
                    <h1 className="text-[#181111] dark:text-white text-3xl font-extrabold mb-2">Order Confirmed!</h1>
                    <p className="text-gray-500 mb-6">Order #{Math.floor(Math.random() * 90000) + 10000}</p>
                    
                    <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 text-left shadow-sm border border-gray-100 dark:border-white/5 mb-6">
                        <div className="border-b border-gray-100 dark:border-gray-700 pb-3 mb-3">
                            {orderItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between font-bold text-[#181111] dark:text-white mb-1">
                                    <span>{item.quantity}x {item.name}</span>
                                </div>
                            ))}
                             <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-gray-200">
                                <span className="text-gray-500">Total Paid</span>
                                <span className="text-xl font-black text-primary">{formatPrice(orderTotal)}</span>
                             </div>
                        </div>
                        <div className="text-sm text-gray-500 space-y-2">
                             <div className="flex gap-2">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                <span>{fullAddress}</span>
                             </div>
                             <div className="flex gap-2">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                <span>{orderDeliveryDetails?.date || '--'} @ {orderDeliveryDetails?.time || '--:--'}</span>
                             </div>
                        </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-xl p-4 flex items-center justify-between mb-6">
                        <div className="text-left">
                            <p className="text-primary font-bold text-lg">+{formatPrice(cashbackEarned)} Cashback</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">New Balance: {formatPrice(cashbackBalance)}</p>
                        </div>
                        <span className="material-symbols-outlined text-primary text-3xl">stars</span>
                    </div>
                </div>
            </div>
             <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md flex flex-col gap-3">
                <button onClick={() => navigate('/home', { replace: true })} className="w-full py-4 bg-primary text-white font-bold rounded-xl text-center hover:opacity-90 transition-opacity">
                    Back to Home
                </button>
                <button className="w-full py-3 text-gray-500 font-bold text-sm">Download Receipt</button>
            </div>
        </div>
    );
};
