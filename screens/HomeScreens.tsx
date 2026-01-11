import React from 'react';
import { NavContextType } from '../types';

export const HomeScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
  return (
    <div className="relative flex h-screen w-full max-w-md mx-auto flex-col bg-white dark:bg-background-dark shadow-2xl overflow-hidden">
      <header className="flex items-center bg-white dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex flex-col">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Welcome back</p>
            <h2 className="text-[#181111] dark:text-white text-lg font-extrabold leading-tight">Acme Corp</h2>
        </div>
        <div onClick={() => nav.navigate('account')} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden cursor-pointer border-2 border-white dark:border-gray-600">
             <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzgZ-laCoxBDAXdN9rJLe5LkO1bEN_hxLAGtK-wcBjvzp7iduoghOuwBnklc9cduj9rBhr54CnsuOGIH581BqUwpjld2L8HeXaOT_NZI-wl3BXjkI4EPp1wIiUPfrPFQqHkg5hNgmWiNaaM8Mp86WMi5LtRE4iQH93juKJLRyoxuHU1lV1K5keSIJYaDm_LLeTYx1sYU2hAOzsU0_uF5s0zWm7Ryvs3ioziOI9iT3lDoUCvF-Gcmtmzk-ebJZeSUnLtFhXRqD7MqA" className="w-full h-full object-cover"/>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        <div className="p-4">
          <div className="flex flex-col items-stretch justify-start rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 relative">
            <div className="w-full h-32 bg-center bg-no-repeat bg-cover relative" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCyE1C2iCMLSaZoG9Cnr4qx7scj4YiYjmuJgZ1IrW2s5WIUxP_0v6Zf2ju7nZli_ZYkAjxn2zHEq5hrMJddnXRU193ADfWi6o7v1_JY6KChZhOp85QUdn9ie5S5si4dcAYNxLzDGmE3sIvHh_t24jSeN7LAOf0U9iYG4TnLvBXyJscMegBI7MHcIQQOgqz7vuy92EuYlFVV82SEz2Q2vzXAceNWc4TciQCeAQBDuw3eg7k2qeG8YnK_jLjanejgL7uYxvi0xdl8wmg")' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-4 text-white">
                    <p className="text-sm font-medium opacity-90">Last Order</p>
                    <p className="font-bold text-lg">50 Sandwich Platter...</p>
                </div>
            </div>
            <div className="p-4 flex items-center justify-between">
                 <div>
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total</p>
                    <p className="text-[#181111] dark:text-white font-bold text-lg">$450.00</p>
                 </div>
                 <button onClick={() => nav.navigate('modify_reorder')} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all">
                    Reorder
                 </button>
            </div>
          </div>
        </div>
        
        <div className="px-4 grid grid-cols-2 gap-3 mb-6">
            <div onClick={() => nav.navigate('loyalty')} className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/20 cursor-pointer">
                <span className="material-symbols-outlined text-primary mb-2">stars</span>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Cashback</p>
                <p className="text-lg font-black text-primary">$25.00</p>
            </div>
             <div onClick={() => nav.navigate('scheduled')} className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20 cursor-pointer">
                <span className="material-symbols-outlined text-blue-600 mb-2">event</span>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Next Order</p>
                <p className="text-lg font-black text-blue-900 dark:text-blue-100">Thursday</p>
            </div>
        </div>

        <div className="px-4">
             <div onClick={() => nav.navigate('menu')} className="w-full bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl p-6 text-center cursor-pointer shadow-xl">
                <h3 className="text-xl font-black mb-1">Need something different?</h3>
                <p className="opacity-80 mb-4 text-sm">Explore our full catering menu for your next event.</p>
                <span className="inline-block px-4 py-2 bg-white/20 dark:bg-black/10 rounded-lg font-bold text-sm">Browse Menu</span>
             </div>
        </div>
      </main>
      <BottomNav nav={nav} active="home" />
    </div>
  );
};

export const MenuScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
    const categories = [
        { name: "Sandwiches & Wraps", items: 12, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVUfzu5A_5qtIWFCJ1BbSQFKtgwjv9VTjyMoJv-Jcb-ih6a_9CKgn4PAXoGtO75BRbE_D7Dgzg1nZdqZFk0irFahjC4LGUnvMxtr7YrZNFF0F8Fl5SxQiAcBvMnlFRMezskYmFLgYtsi1a8rsOoj0z1DxlVS3WWTGK2w7bDHi7KUNE18eAlXR5bBxvf6CvxQ5M1V982aC2nIGaLJuPfGo7QXwbelShfccxf_fvHKnlmvBcbZtZJpXWbg-Rfqv5rGZDJXNhUhcSmYY" },
        { name: "Platters & Sides", items: 8, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3wQjVrTLFYv3vJmmF_KrJYKoGBhKd8YkWvLHbuiJV0FekzPJ2i4iT4ofimJpueRKVicG-g1zhkdVE-DnuErhJf1a14nc0tyBRobXexd4UDLdmCQvudTkcRr2RFGmJdZGr1ndJDWqoLsMiMHVFOSU2gF483-_wUGQ1HNcBJT0sSQXSpReYQZa2eU7b0DkBh7WFjNYWGlHj7Wr0h3f4i-RknYKAQhAdHQFYt8Tx8zP-zjWkC24YE6lp8rv3TAt1zcdywHhFq7MgVIQ" },
        { name: "Beverages", items: 10, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAr_a1Bv1Wody7TMYlKlUo_OIyfCpcqMyR7RB08LfLYVpd8mgNYDHcPhjGwuVzmtNzfB6WSlnPFdc7a6-k23l_S2-9XzdowQXL45ZhPg-LKf7cL5miD2clePYD1Zewr_BoYGs28lENNSe-8IUe8FcgF_INaZpDs_B4769P1OHft5jjleTTGFgA7i1OPl5ZkTZPZwJpChGUVD7faTbxeaA5Ib3In2zl4etcDjLAsOIS_IAaex3lt9PwQsSAPwPYYm9YJf4Ez0kDXdRQ" },
        { name: "Desserts & Sweets", items: 5, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQB60hr6eeaMx4TZP_MUsyYNVf8lFamQjhzNhaDxKNropSkwJmWeb3bN6EXhoTjFYKcMiuKMwOFaXuR2NfBQ6AMiA2Q5wK2HhvbudTqRtCnPxbHC7um_STQ9bhriPubcKDzZRJzqBNLuJgVKNZbWq5QDIheWqVtn5apzVTwkFsptiKH6l1vYqadg3YP5kMlbIa09toxFceutWeR2qPSpXMqb1PBDPKRwnH0FN8K7pMr-dPKN3ZvkAl9_4rW8RAaBYAksSCDYIMBZs" },
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-2xl overflow-hidden">
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                    <h2 className="text-[#181111] dark:text-white text-xl font-bold leading-tight flex-1">Catering Menu</h2>
                    <div onClick={() => nav.navigate('cart')} className="flex w-12 items-center justify-end cursor-pointer">
                        <span className="material-symbols-outlined">shopping_bag</span>
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar">
                <div className="px-4 py-3">
                     <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-400 material-symbols-outlined">search</span>
                        <input className="w-full bg-white dark:bg-[#2a1a1a] h-12 pl-10 pr-4 rounded-xl border-none outline-none text-[#181111] dark:text-white placeholder-gray-400" placeholder="Search our menu..." />
                     </div>
                </div>
                <div className="grid grid-cols-1 gap-4 p-4">
                    {categories.map((cat, idx) => (
                        <div key={idx} onClick={() => nav.navigate('category_detail')} className="flex items-center gap-4 p-4 bg-white dark:bg-[#2a1a1a] rounded-xl cursor-pointer hover:shadow-md transition-shadow">
                            <div className="w-20 h-20 bg-center bg-no-repeat bg-cover rounded-lg shrink-0" style={{ backgroundImage: `url("${cat.img}")` }}></div>
                            <div className="flex-1">
                                <h3 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">{cat.name}</h3>
                                <p className="text-gray-500 text-sm mt-1">{cat.items} items</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                        </div>
                    ))}
                </div>
                <div className="h-20"></div>
            </main>
            <BottomNav nav={nav} active="menu" />
        </div>
    );
};

export const CategoryDetailScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-2xl overflow-hidden">
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                    <button onClick={() => nav.goBack()} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight text-center">Sandwiches & Wraps</h2>
                    <div onClick={() => nav.navigate('cart')} className="flex w-10 items-center justify-center cursor-pointer">
                        <span className="material-symbols-outlined">shopping_bag</span>
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 gap-4 flex flex-col">
                <div onClick={() => nav.navigate('item_detail')} className="bg-white dark:bg-[#2a1a1a] rounded-xl overflow-hidden shadow-sm cursor-pointer">
                    <div className="h-40 w-full bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDfiYJBJ3CKNFsvfdmt6JgWQx1mUNMm8jeYEtWLIZ-AMCtc_5QybwsA9Tn7Gy4HrBosVCEg5wmq9oxYz_HUzrROChOeK6M7fmVOBcjWjocZ_NlVlvPRNvQAiyiKANvFfrmQJbZHT6WxVKKDRO4Jg47YZb2RO7ZzEocc79kTyNATHgKa84lZWk4rchLZqKaYvCyABJ_4QtQNneOV96GptvhYtwSUCoPeduiCvlMo69Me8sjnyrIS0kTWMHjCrPaVJge4MS7vOsMooUQ")'}}></div>
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-[#181111] dark:text-white">Italian Sub Platter</h3>
                            <span className="font-bold text-primary">$89.99</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">Serves 10 people</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">Premium mortadella, capicola, salami, ham, and provolone cheese.</p>
                    </div>
                </div>
                {/* Duplicate for demo */}
                <div onClick={() => nav.navigate('item_detail')} className="bg-white dark:bg-[#2a1a1a] rounded-xl overflow-hidden shadow-sm cursor-pointer">
                    <div className="h-40 w-full bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCVUfzu5A_5qtIWFCJ1BbSQFKtgwjv9VTjyMoJv-Jcb-ih6a_9CKgn4PAXoGtO75BRbE_D7Dgzg1nZdqZFk0irFahjC4LGUnvMxtr7YrZNFF0F8Fl5SxQiAcBvMnlFRMezskYmFLgYtsi1a8rsOoj0z1DxlVS3WWTGK2w7bDHi7KUNE18eAlXR5bBxvf6CvxQ5M1V982aC2nIGaLJuPfGo7QXwbelShfccxf_fvHKnlmvBcbZtZJpXWbg-Rfqv5rGZDJXNhUhcSmYY")'}}></div>
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-[#181111] dark:text-white">Turkey & Avocado Wrap</h3>
                            <span className="font-bold text-primary">$75.00</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">Serves 8-10 people</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">Roasted turkey breast, fresh avocado, bacon, and ranch.</p>
                    </div>
                </div>
                 <div className="h-20"></div>
            </main>
            <BottomNav nav={nav} active="menu" />
        </div>
    );
};

export const AccountScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased h-screen flex flex-col overflow-hidden w-full max-w-md mx-auto shadow-2xl">
            <header className="flex-none bg-white dark:bg-background-dark px-4 pt-4 pb-4 sticky top-0 z-20 shadow-sm dark:shadow-none dark:border-b dark:border-white/10">
                <h1 className="text-xl font-bold tracking-tight w-full text-center">Account</h1>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar pb-24 px-4 space-y-6 pt-4">
                <section className="bg-white dark:bg-[#2a1a1a] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-white/5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzgZ-laCoxBDAXdN9rJLe5LkO1bEN_hxLAGtK-wcBjvzp7iduoghOuwBnklc9cduj9rBhr54CnsuOGIH581BqUwpjld2L8HeXaOT_NZI-wl3BXjkI4EPp1wIiUPfrPFQqHkg5hNgmWiNaaM8Mp86WMi5LtRE4iQH93juKJLRyoxuHU1lV1K5keSIJYaDm_LLeTYx1sYU2hAOzsU0_uF5s0zWm7Ryvs3ioziOI9iT3lDoUCvF-Gcmtmzk-ebJZeSUnLtFhXRqD7MqA" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Acme Corp</h2>
                        <p className="text-slate-500 text-sm">John Smith • +1 (555) 123-4567</p>
                        <button className="text-primary text-xs font-bold mt-1">Edit Profile</button>
                    </div>
                </section>

                <section onClick={() => nav.navigate('loyalty')} className="bg-primary text-white rounded-xl p-6 shadow-lg shadow-primary/20 relative overflow-hidden cursor-pointer">
                    <div className="relative z-10">
                        <p className="opacity-80 text-sm font-medium mb-1">Cashback Balance</p>
                        <h3 className="text-3xl font-extrabold tracking-tight">$25.00</h3>
                        <p className="text-xs mt-2 bg-white/20 inline-block px-2 py-1 rounded">You earn 5% on every order</p>
                    </div>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-6xl opacity-20">stars</span>
                </section>

                <div className="space-y-2">
                    <h3 className="font-bold text-lg px-1">Settings</h3>
                    <div className="bg-white dark:bg-[#2a1a1a] rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                        <button onClick={() => nav.navigate('addresses')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 text-left">
                            <span className="font-medium">Delivery Addresses</span>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                         <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 text-left">
                            <span className="font-medium">Payment Methods</span>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                         <button onClick={() => nav.navigate('scheduled')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 text-left">
                            <span className="font-medium">Scheduled Orders</span>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                     <h3 className="font-bold text-lg px-1">Help</h3>
                     <div className="bg-white dark:bg-[#2a1a1a] rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 text-left">
                            <span className="font-medium">Contact Us</span>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 text-left">
                            <span className="font-medium">FAQs</span>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                    </div>
                </div>
            </main>
            <BottomNav nav={nav} active="account" />
        </div>
    );
};

export const BottomNav: React.FC<{ nav: NavContextType, active: string }> = ({ nav, active }) => (
  <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-background-dark border-t border-gray-200 dark:border-gray-800 flex justify-around items-center h-20 px-2 pb-4 z-50">
    <div onClick={() => nav.navigate('home')} className={`flex flex-col items-center cursor-pointer ${active === 'home' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
      <span className="material-symbols-outlined">home</span>
      <span className="text-[10px] font-bold mt-1">Home</span>
    </div>
    <div onClick={() => nav.navigate('menu')} className={`flex flex-col items-center cursor-pointer ${active === 'menu' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
      <span className="material-symbols-outlined">restaurant_menu</span>
      <span className="text-[10px] font-medium mt-1">Menu</span>
    </div>
    <div onClick={() => nav.navigate('orders')} className={`flex flex-col items-center cursor-pointer ${active === 'orders' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
      <span className="material-symbols-outlined">receipt_long</span>
      <span className="text-[10px] font-medium mt-1">My Orders</span>
    </div>
    <div onClick={() => nav.navigate('account')} className={`flex flex-col items-center cursor-pointer ${active === 'account' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
      <span className="material-symbols-outlined">person</span>
      <span className="text-[10px] font-medium mt-1">Account</span>
    </div>
  </nav>
);
