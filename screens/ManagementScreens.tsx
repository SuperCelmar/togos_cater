import React from 'react';
import { NavContextType } from '../types';
import { BottomNav } from './HomeScreens';

export const OrdersScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#181111] dark:text-white w-full max-w-md mx-auto shadow-2xl h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-20 flex items-center bg-white dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="w-10"></div>
        <h2 className="text-[#181111] dark:text-white text-xl font-extrabold leading-tight tracking-[-0.015em] flex-1 text-center">My Orders</h2>
        <div className="w-10"></div>
      </header>
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 p-4 space-y-4">
         {/* Order Card 1 */}
         <div onClick={() => nav.navigate('order_detail')} className="group relative flex flex-col gap-4 rounded-xl bg-white dark:bg-[#2a1a1a] p-4 shadow-sm border border-transparent hover:border-primary/20 transition-all cursor-pointer">
            <div className="flex items-center justify-between">
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">Dec 10, 2024</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-bold text-green-700 dark:text-green-400">
                     <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>Delivered
                </span>
            </div>
            <div className="flex gap-4">
                <div className="flex flex-col justify-center flex-1">
                    <h3 className="text-[#181111] dark:text-white text-base font-bold leading-tight">50 Sandwich Platter + 20 Drinks</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">Order #12345 • $450.00</p>
                </div>
                <span className="material-symbols-outlined text-gray-300 self-center">chevron_right</span>
            </div>
        </div>
        {/* Order Card 2 */}
         <div onClick={() => nav.navigate('order_detail')} className="group relative flex flex-col gap-4 rounded-xl bg-white dark:bg-[#2a1a1a] p-4 shadow-sm border border-transparent hover:border-primary/20 transition-all cursor-pointer">
            <div className="flex items-center justify-between">
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">Nov 28, 2024</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-bold text-green-700 dark:text-green-400">
                     <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>Delivered
                </span>
            </div>
            <div className="flex gap-4">
                <div className="flex flex-col justify-center flex-1">
                    <h3 className="text-[#181111] dark:text-white text-base font-bold leading-tight">Holiday Party Feast</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">Order #12340 • $1,200.00</p>
                </div>
                 <span className="material-symbols-outlined text-gray-300 self-center">chevron_right</span>
            </div>
        </div>
      </main>
       <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-4 z-40 pointer-events-none">
            <button onClick={() => nav.navigate('menu')} className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 pointer-events-auto">Place New Order</button>
       </div>
      <BottomNav nav={nav} active="orders" />
    </div>
  );
};

export const OrderDetailScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-2xl overflow-hidden">
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                    <button onClick={() => nav.goBack()} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">Order #12345</h2>
                    <div className="w-10"></div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
                <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between mb-4">
                         <span className="font-bold text-lg">Dec 10, 2024</span>
                         <span className="text-green-600 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-sm">Delivered</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span>2x Italian Sub Platter</span>
                            <span>$179.98</span>
                        </div>
                         <div className="flex justify-between">
                            <span>1x Dessert Platter</span>
                            <span>$89.99</span>
                        </div>
                    </div>
                    <div className="h-px bg-gray-100 dark:bg-white/10 my-4"></div>
                    <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex justify-between"><span>Subtotal</span><span>$450.00</span></div>
                        <div className="flex justify-between"><span>Tax</span><span>$36.00</span></div>
                        <div className="flex justify-between"><span>Delivery</span><span>$15.00</span></div>
                        <div className="flex justify-between text-primary"><span>Cashback Used</span><span>-$25.00</span></div>
                        <div className="flex justify-between text-lg font-black text-[#181111] dark:text-white mt-2"><span>Total Paid</span><span>$476.00</span></div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold mb-2">Delivery Info</h3>
                    <p className="text-sm text-gray-500">123 Main St, Floor 5</p>
                    <p className="text-sm text-gray-500">Dec 10 @ 11:30 AM</p>
                </div>

                <div className="space-y-3">
                    <button className="w-full h-12 border-2 border-primary text-primary font-bold rounded-xl">Download Receipt (PDF)</button>
                    <button className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 text-[#181111] dark:text-white font-bold rounded-xl">Download Invoice (PDF)</button>
                </div>
            </main>
             <div className="p-4 bg-white dark:bg-[#1a0c0c] border-t border-gray-100 dark:border-gray-800 shrink-0">
                <button onClick={() => nav.navigate('modify_reorder')} className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20">Reorder This</button>
             </div>
        </div>
    );
};

export const ReorderScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-2xl overflow-hidden">
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                     <button onClick={() => nav.navigate('home')} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">Reorder</h2>
                    <div className="w-10"></div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                 <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="font-bold text-lg">Dec 10</p>
                            <p className="text-sm text-gray-500">50 Sandwich Platter, 20 Drinks</p>
                        </div>
                        <p className="font-bold text-lg">$450</p>
                    </div>
                    <button onClick={() => nav.navigate('modify_reorder')} className="w-full h-10 bg-primary text-white rounded-lg font-bold">Reorder</button>
                 </div>
                 
                  <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5 opacity-70">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <p className="font-bold text-lg">Nov 28</p>
                            <p className="text-sm text-gray-500">Holiday Party Feast</p>
                        </div>
                        <p className="font-bold text-lg">$1,200</p>
                    </div>
                    <button onClick={() => nav.navigate('modify_reorder')} className="w-full h-10 border border-primary text-primary rounded-lg font-bold">Reorder</button>
                 </div>
            </main>
             <div className="p-4 shrink-0">
                <button onClick={() => nav.navigate('menu')} className="w-full py-4 text-primary font-bold">Browse Full Menu</button>
             </div>
        </div>
    );
};

export const ModifyReorderScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
     return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-2xl overflow-hidden">
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                     <button onClick={() => nav.goBack()} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
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
                        <input type="date" className="w-full h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" />
                        <input type="time" defaultValue="11:30" className="w-full h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm space-y-4">
                    <h3 className="font-bold">Items</h3>
                     <div className="flex justify-between items-center">
                        <span className="font-medium">Italian Sub Platter</span>
                        <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/10 rounded-lg px-2 py-1">
                            <span className="material-symbols-outlined text-sm">remove</span>
                            <span className="text-sm font-bold">2</span>
                            <span className="material-symbols-outlined text-sm">add</span>
                        </div>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="font-medium">Dessert Platter</span>
                        <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/10 rounded-lg px-2 py-1">
                            <span className="material-symbols-outlined text-sm">remove</span>
                            <span className="text-sm font-bold">1</span>
                            <span className="material-symbols-outlined text-sm">add</span>
                        </div>
                    </div>
                </div>
                 <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold mb-2">Deliver to</h3>
                    <input className="w-full h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent" defaultValue="123 Main St, Floor 5" />
                 </div>
            </main>
             <div className="p-4 bg-white dark:bg-[#1a0c0c] border-t border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex justify-between mb-4 font-bold text-lg">
                    <span>Total</span>
                    <span>$476.00</span>
                </div>
                <button onClick={() => nav.navigate('checkout')} className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20">Continue to Payment</button>
             </div>
        </div>
     );
};

export const LoyaltyScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-2xl overflow-hidden">
             <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                     <button onClick={() => nav.goBack()} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
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
                        <h3 className="text-4xl font-black tracking-tight mb-4">$48.80</h3>
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
                        <div className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-bold">Order #12345</p>
                                <p className="text-xs text-gray-500">Dec 10</p>
                            </div>
                            <span className="text-green-600 font-bold">+ $23.80</span>
                        </div>
                         <div className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-bold">Order #12340</p>
                                <p className="text-xs text-gray-500">Nov 28</p>
                            </div>
                            <span className="text-green-600 font-bold">+ $21.50</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export const ScheduledOrdersScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-xl overflow-hidden">
             <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                     <button onClick={() => nav.goBack()} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">Scheduled Orders</h2>
                     <div className="w-10"></div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                <div className="bg-white dark:bg-[#2a1a1a] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
                     <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">Team Lunch</h3>
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Active</span>
                     </div>
                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Every Thursday @ 11:30 AM</p>
                     
                     <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg mb-4 text-sm">
                        <p>Next: <span className="font-bold">Thursday, Dec 12</span></p>
                        <p>Total: <span className="font-bold">$450.00</span></p>
                     </div>

                     <div className="flex gap-2">
                        <button className="flex-1 h-9 bg-primary text-white rounded-lg text-sm font-bold">Edit</button>
                        <button className="flex-1 h-9 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold">Skip</button>
                     </div>
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

export const InvoicesScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
     return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-xl overflow-hidden">
             <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                     <button onClick={() => nav.goBack()} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">Invoices</h2>
                     <div className="w-10"></div>
                </div>
            </header>
             <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-[#2a1a1a] rounded-xl shadow-sm">
                    <div>
                        <p className="font-bold">Invoice #INV-2024-001</p>
                        <p className="text-xs text-gray-500">Dec 10 • $476.00</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded">Paid</span>
                    </div>
                    <button className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">download</span>
                    </button>
                </div>
                 <div className="flex items-center justify-between p-4 bg-white dark:bg-[#2a1a1a] rounded-xl shadow-sm">
                    <div>
                        <p className="font-bold">Invoice #INV-2024-002</p>
                        <p className="text-xs text-gray-500">Nov 28 • $1,200.00</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-bold rounded">Pending</span>
                    </div>
                    <button className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">download</span>
                    </button>
                </div>
             </main>
        </div>
     );
};

export const AddressManagementScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-xl overflow-hidden">
             <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                     <button onClick={() => nav.goBack()} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">Delivery Addresses</h2>
                     <div className="w-10"></div>
                </div>
            </header>
             <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                <div className="bg-white dark:bg-[#2a1a1a] p-4 rounded-xl shadow-sm border-2 border-primary">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold">Office Main</h3>
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">123 Main St, Floor 5</p>
                    <p className="text-xs text-gray-500 mt-2">"Use back entrance"</p>
                    <div className="flex justify-end gap-3 mt-3">
                         <span className="material-symbols-outlined text-gray-400 text-sm">edit</span>
                         <span className="material-symbols-outlined text-gray-400 text-sm">delete</span>
                    </div>
                </div>
                
                 <button className="w-full h-14 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center gap-2 font-bold text-gray-500">
                    <span className="material-symbols-outlined">add</span> Add New Address
                 </button>
             </main>
        </div>
    );
};
