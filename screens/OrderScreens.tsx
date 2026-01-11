import React from 'react';
import { NavContextType } from '../types';

export const ItemDetailScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
  return (
    <div className="relative flex h-screen w-full flex-col bg-white dark:bg-background-dark group/design-root overflow-hidden max-w-md mx-auto shadow-xl">
        <div className="sticky top-0 z-50 flex items-center bg-white/90 dark:bg-background-dark/90 backdrop-blur-md p-4 pb-2 justify-between shrink-0">
            <div onClick={() => nav.goBack()} className="text-[#181111] dark:text-white flex size-12 shrink-0 items-center cursor-pointer">
                <span className="material-symbols-outlined">arrow_back_ios</span>
            </div>
            <div className="flex w-12 items-center justify-end">
                <span className="material-symbols-outlined">share</span>
            </div>
        </div>
        <div className="flex-grow pb-32 overflow-y-auto no-scrollbar">
            <div className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-white dark:bg-zinc-800 min-h-80" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDfiYJBJ3CKNFsvfdmt6JgWQx1mUNMm8jeYEtWLIZ-AMCtc_5QybwsA9Tn7Gy4HrBosVCEg5wmq9oxYz_HUzrROChOeK6M7fmVOBcjWjocZ_NlVlvPRNvQAiyiKANvFfrmQJbZHT6WxVKKDRO4Jg47YZb2RO7ZzEocc79kTyNATHgKa84lZWk4rchLZqKaYvCyABJ_4QtQNneOV96GptvhYtwSUCoPeduiCvlMo69Me8sjnyrIS0kTWMHjCrPaVJge4MS7vOsMooUQ")' }}></div>
            <div className="px-4">
                <h1 className="text-[#181111] dark:text-white tracking-tight text-[32px] font-bold leading-tight pt-6">Italian Sub Platter</h1>
                <div className="flex items-baseline justify-between pt-1">
                    <h2 className="text-[#181111] dark:text-white text-[24px] font-bold leading-tight tracking-[-0.015em]">$89.99</h2>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-normal leading-relaxed pt-4">
                    A variety of our famous Italian subs featuring premium mortadella, capicola, salami, ham, and provolone cheese. Served with crisp lettuce, tomatoes, onions, and our signature dressing. Serves 10.
                </p>
            </div>
            <div className="h-6"></div>
            <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 mx-4"></div>
            <div className="px-4 pt-6">
                <h3 className="text-[#181111] dark:text-white text-lg font-bold pb-4">Quantity</h3>
                <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 w-max">
                    <button className="flex items-center justify-center w-12 h-12 text-primary hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="w-10 text-center font-bold text-lg">1</span>
                    <button className="flex items-center justify-center w-12 h-12 text-primary hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>
            </div>
             <div className="px-4 pt-8">
                <h3 className="text-[#181111] dark:text-white text-lg font-bold pb-3">Special Instructions</h3>
                <textarea className="w-full h-32 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-primary focus:border-primary text-zinc-800 dark:text-zinc-200 resize-none font-display text-sm" placeholder="Any allergies or special requests?"></textarea>
            </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-background-dark/95 backdrop-blur-lg border-t border-zinc-100 dark:border-zinc-800 p-4 pb-8 z-50">
            <button onClick={() => nav.navigate('cart')} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between transition-all active:scale-[0.98]">
                <span>Add to Cart</span>
                <span className="text-white/90 font-medium">$89.99</span>
            </button>
        </div>
    </div>
  );
};

export const CartScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
    return (
        <div className="relative flex h-screen w-full max-w-md mx-auto flex-col bg-background-light dark:bg-background-dark overflow-hidden shadow-2xl">
            <header className="sticky top-0 z-50 flex items-center bg-white dark:bg-[#2d1a1a] p-4 pb-2 justify-between border-b border-gray-100 dark:border-white/10 shrink-0">
                <div onClick={() => nav.goBack()} className="text-[#181111] dark:text-white flex size-12 shrink-0 items-center cursor-pointer">
                    <span className="material-symbols-outlined">arrow_back_ios</span>
                </div>
                <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Your Order</h2>
            </header>
            <div className="flex-1 pb-44 overflow-y-auto no-scrollbar">
                 <div className="flex items-center gap-4 bg-white dark:bg-[#2d1a1a] px-4 min-h-[88px] py-4 border-b border-gray-50 dark:border-white/5">
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex justify-between items-start">
                            <p className="text-[#181111] dark:text-white text-base font-bold leading-normal">Italian Sub Platter</p>
                            <span className="material-symbols-outlined text-gray-400 text-sm">delete</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/10 rounded-lg px-2 py-1">
                                <span className="material-symbols-outlined text-sm">remove</span>
                                <span className="text-sm font-bold">2</span>
                                <span className="material-symbols-outlined text-sm">add</span>
                            </div>
                            <p className="text-[#181111] dark:text-white text-base font-bold leading-normal">$179.98</p>
                        </div>
                    </div>
                </div>

                <div className="px-4 pt-6">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-[#181111] dark:text-white text-lg font-bold">Delivery Details</h2>
                        <button onClick={() => nav.navigate('delivery_setup')} className="text-primary text-sm font-bold">Edit</button>
                    </div>
                    <div className="bg-white dark:bg-[#2d1a1a] rounded-xl p-4 shadow-sm">
                        <p className="font-bold text-[#181111] dark:text-white">123 Main St, Floor 5</p>
                        <p className="text-sm text-gray-500 mt-1">Thursday, Dec 12 @ 11:30 AM</p>
                    </div>
                </div>
                
                <div className="px-4 pt-6 pb-4">
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold mb-3">Order Summary</h2>
                    <div className="bg-white dark:bg-[#2d1a1a] rounded-xl p-4 shadow-sm space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="text-[#181111] dark:text-white">$450.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tax (8%)</span>
                            <span className="text-[#181111] dark:text-white">$36.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Delivery Fee</span>
                            <span className="text-[#181111] dark:text-white">$15.00</span>
                        </div>
                        <div className="flex items-center justify-between py-2 px-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <input defaultChecked className="rounded border-primary text-primary focus:ring-primary h-5 w-5" type="checkbox"/>
                                <span className="text-sm font-medium text-primary">Apply $25.00 Cashback?</span>
                            </div>
                            <span className="text-primary font-bold">-$25.00</span>
                        </div>
                        <div className="h-px bg-gray-100 dark:bg-white/10 pt-1"></div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-2xl font-black text-primary">$476.00</span>
                        </div>
                    </div>
                </div>
            </div>
             <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-[#2d1a1a] p-4 border-t border-gray-100 dark:border-white/10 flex flex-col gap-3">
                <button onClick={() => nav.navigate('checkout')} className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform">
                    Continue to Payment
                </button>
                <button onClick={() => nav.navigate('menu')} className="w-full bg-transparent text-[#181111] dark:text-white py-2 rounded-xl font-medium text-sm">
                    Continue Shopping
                </button>
            </div>
        </div>
    );
};

export const CheckoutScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col text-[#181111] dark:text-white w-full max-w-md mx-auto shadow-2xl overflow-hidden">
             <header className="sticky top-0 z-50 bg-white dark:bg-[#181111] border-b border-gray-200 dark:border-gray-800 shrink-0">
                <div className="flex items-center p-4 pb-2 justify-between">
                    <div onClick={() => nav.goBack()} className="text-[#181111] dark:text-white flex size-12 shrink-0 items-center cursor-pointer">
                        <span className="material-symbols-outlined">arrow_back_ios</span>
                    </div>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Checkout</h2>
                     <div className="flex items-center justify-end">
                        <div className="text-right">
                            <p className="text-primary text-base font-bold leading-normal tracking-[0.015em] shrink-0">$476.00</p>
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
                        <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#181111] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-[#e6dbdb] dark:border-gray-700 bg-white dark:bg-[#2a1a1a] h-14 placeholder:text-[#896161] p-[15px] text-base font-normal leading-normal" defaultValue="Acme Corp"/>
                    </label>
                </div>
                 <div className="flex items-center justify-center gap-2 px-4 py-6 text-[#896161] dark:text-gray-400">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    <p className="text-xs font-medium uppercase tracking-widest">Secure 256-bit SSL Encrypted</p>
                </div>
            </main>
            <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-[#181111] border-t border-gray-200 dark:border-gray-800 px-4 py-6">
                <button onClick={() => nav.navigate('success')} className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-primary text-white text-lg font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">
                    <span className="truncate">Complete Order</span>
                    <span className="material-symbols-outlined ml-2">check_circle</span>
                </button>
            </footer>
        </div>
    );
};

export const OrderSuccessScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
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
                    <p className="text-gray-500 mb-6">Order #12345</p>
                    
                    <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 text-left shadow-sm border border-gray-100 dark:border-white/5 mb-6">
                        <div className="border-b border-gray-100 dark:border-gray-700 pb-3 mb-3">
                             <div className="flex justify-between font-bold text-[#181111] dark:text-white mb-1">
                                <span>2x Italian Sub Platter</span>
                             </div>
                             <div className="flex justify-between font-bold text-[#181111] dark:text-white">
                                <span>1x Dessert Platter</span>
                             </div>
                             <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-gray-200">
                                <span className="text-gray-500">Total Paid</span>
                                <span className="text-xl font-black text-primary">$476.00</span>
                             </div>
                        </div>
                        <div className="text-sm text-gray-500 space-y-2">
                             <div className="flex gap-2">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                <span>123 Main St, Floor 5</span>
                             </div>
                             <div className="flex gap-2">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                <span>Thursday, Dec 12 @ 11:30 AM</span>
                             </div>
                        </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-xl p-4 flex items-center justify-between mb-6">
                        <div className="text-left">
                            <p className="text-primary font-bold text-lg">+$23.80 Cashback</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">New Balance: $48.80</p>
                        </div>
                        <span className="material-symbols-outlined text-primary text-3xl">stars</span>
                    </div>
                </div>
            </div>
             <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md flex flex-col gap-3">
                <button onClick={() => nav.navigate('home')} className="w-full py-4 bg-primary text-white font-bold rounded-xl text-center hover:opacity-90 transition-opacity">
                    Back to Home
                </button>
                <button className="w-full py-3 text-gray-500 font-bold text-sm">Download Receipt</button>
            </div>
        </div>
    );
};
