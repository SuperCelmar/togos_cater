import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, NavLink, useLocation } from 'react-router';
import { useAppContext, SelectedItem } from '../context/AppContext';
import { GHLContact, GHLOrder } from '../../types';
import { getCateringCategories, getCateringItemsByCategory, getCategoryById, formatPrice, getServesText, MenuCategory, MenuItem } from '../lib/menuService';
import { ghlService } from '../services/ghl';

// Default placeholder image for items without images
const PLACEHOLDER_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVUfzu5A_5qtIWFCJ1BbSQFKtgwjv9VTjyMoJv-Jcb-ih6a_9CKgn4PAXoGtO75BRbE_D7Dgzg1nZdqZFk0irFahjC4LGUnvMxtr7YrZNFF0F8Fl5SxQiAcBvMnlFRMezskYmFLgYtsi1a8rsOoj0z1DxlVS3WWTGK2w7bDHi7KUNE18eAlXR5bBxvf6CvxQ5M1V982aC2nIGaLJuPfGo7QXwbelShfccxf_fvHKnlmvBcbZtZJpXWbg-Rfqv5rGZDJXNhUhcSmYY';

/**
 * Get display name from contact data
 */
function getDisplayName(contact?: GHLContact | null): string {
  if (!contact) return 'Guest';
  
  if (contact.companyName) return contact.companyName;
  if (contact.name) return contact.name;
  if (contact.firstName && contact.lastName) return `${contact.firstName} ${contact.lastName}`;
  if (contact.firstName) return contact.firstName;
  if (contact.email) return contact.email.split('@')[0];
  
  return 'Guest';
}

/**
 * Get contact info string (name + phone)
 */
function getContactInfo(contact?: GHLContact | null): string {
  if (!contact) return '';
  
  const parts: string[] = [];
  
  if (contact.firstName || contact.lastName) {
    parts.push([contact.firstName, contact.lastName].filter(Boolean).join(' '));
  }
  
  if (contact.phone) {
    parts.push(contact.phone);
  } else if (contact.email) {
    parts.push(contact.email);
  }
  
  return parts.join(' • ');
}

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { contact, contactId, cashbackBalance } = useAppContext();
  const [lastOrder, setLastOrder] = useState<GHLOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const displayName = getDisplayName(contact);

  useEffect(() => {
    async function fetchLastOrder() {
      if (!contactId) {
        setIsLoading(false);
        return;
      }

      try {
        const orders = await ghlService.getOrdersByContactId(contactId);
        if (orders && orders.length > 0) {
          setLastOrder(orders[0]);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLastOrder();
  }, [contactId]);

  return (
    <div className="relative flex h-screen w-full max-w-md mx-auto flex-col bg-white dark:bg-background-dark shadow-2xl overflow-hidden">
      <header className="flex items-center bg-white dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex flex-col">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Welcome back</p>
            <h2 className="text-[#181111] dark:text-white text-lg font-extrabold leading-tight">{displayName}</h2>
        </div>
        <div onClick={() => navigate('/account')} className="w-10 h-10 rounded-full bg-primary overflow-hidden cursor-pointer border-2 border-white dark:border-gray-600 flex items-center justify-center">
             <span className="text-white font-bold text-lg">{displayName.charAt(0).toUpperCase()}</span>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {/* Last Order Section */}
        <div className="p-4">
          <div className="flex flex-col items-stretch justify-start rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 relative">
            <div className="w-full h-32 bg-center bg-no-repeat bg-cover relative" style={{ backgroundImage: `url("${PLACEHOLDER_IMAGE}")` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-4 text-white">
                    <p className="text-sm font-medium opacity-90">Last Order</p>
                    {isLoading ? (
                      <p className="font-bold text-lg">Loading...</p>
                    ) : lastOrder ? (
                      <p className="font-bold text-lg">{lastOrder.items?.[0]?.name || 'Catering Order'}...</p>
                    ) : (
                      <p className="font-bold text-lg">No orders yet</p>
                    )}
                </div>
            </div>
            <div className="p-4 flex items-center justify-between">
                 <div>
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total</p>
                    <p className="text-[#181111] dark:text-white font-bold text-lg">
                      {lastOrder ? formatPrice(lastOrder.totalAmount) : '--'}
                    </p>
                 </div>
                 <button 
                   onClick={() => navigate(lastOrder ? '/reorder/modify' : '/menu')} 
                   className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all"
                 >
                    {lastOrder ? 'Reorder' : 'Start Order'}
                 </button>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="px-4 grid grid-cols-2 gap-3 mb-6">
            <div onClick={() => navigate('/account/loyalty')} className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/20 cursor-pointer">
                <span className="material-symbols-outlined text-primary mb-2">stars</span>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Cashback</p>
                <p className="text-lg font-black text-primary">{formatPrice(cashbackBalance)}</p>
            </div>
             <div onClick={() => navigate('/account/scheduled')} className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20 cursor-pointer">
                <span className="material-symbols-outlined text-blue-600 mb-2">event</span>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Next Order</p>
                <p className="text-lg font-black text-blue-900 dark:text-blue-100">--</p>
            </div>
        </div>

        {/* Browse Menu CTA */}
        <div className="px-4">
             <div onClick={() => navigate('/menu')} className="w-full bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl p-6 text-center cursor-pointer shadow-xl">
                <h3 className="text-xl font-black mb-1">Need something different?</h3>
                <p className="opacity-80 mb-4 text-sm">Explore our full catering menu for your next event.</p>
                <span className="inline-block px-4 py-2 bg-white/20 dark:bg-black/10 rounded-lg font-bold text-sm">Browse Menu</span>
             </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export const MenuScreen: React.FC = () => {
    const navigate = useNavigate();
    const { guestCount } = useAppContext();
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const data = await getCateringCategories();
                setCategories(data);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                setError('Failed to load menu. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }

        fetchCategories();
    }, []);

    const handleCategoryClick = (category: MenuCategory) => {
        navigate(`/menu/category/${category.id}`);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-2xl overflow-hidden">
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                    <div className="flex-1">
                        <h2 className="text-[#181111] dark:text-white text-xl font-bold leading-tight">Catering Menu</h2>
                        {guestCount && (
                            <p className="text-xs text-primary font-medium">Building order for {guestCount} people</p>
                        )}
                    </div>
                    <div onClick={() => navigate('/cart')} className="flex w-12 items-center justify-end cursor-pointer">
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
                
                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-500">{error}</div>
                ) : categories.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No catering categories available.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 p-4">
                        {categories.map((cat) => (
                            <div 
                                key={cat.id} 
                                onClick={() => handleCategoryClick(cat)} 
                                className="flex items-center gap-4 p-4 bg-white dark:bg-[#2a1a1a] rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div 
                                    className="w-20 h-20 bg-center bg-no-repeat bg-cover rounded-lg shrink-0 bg-gray-200" 
                                    style={{ backgroundImage: cat.image_url ? `url("${cat.image_url}")` : `url("${PLACEHOLDER_IMAGE}")` }}
                                ></div>
                                <div className="flex-1">
                                    <h3 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">{cat.name}</h3>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {cat.item_count} {cat.item_count === 1 ? 'item' : 'items'}
                                    </p>
                                </div>
                                <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="h-20"></div>
            </main>
            <BottomNav />
        </div>
    );
};

export const CategoryDetailScreen: React.FC = () => {
    const navigate = useNavigate();
    const { categoryId } = useParams<{ categoryId: string }>();
    const { guestCount } = useAppContext();
    
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categoryName, setCategoryName] = useState('Category');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchItems() {
            if (!categoryId) {
                setError('No category selected');
                setIsLoading(false);
                return;
            }

            try {
                // Fetch category name
                const category = await getCategoryById(categoryId);
                if (category) {
                    setCategoryName(category.name);
                }

                const data = await getCateringItemsByCategory(categoryId);
                setItems(data);
            } catch (err) {
                console.error('Failed to fetch items:', err);
                setError('Failed to load items. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }

        fetchItems();
    }, [categoryId]);

    const handleItemClick = (item: MenuItem) => {
        // Pass item data via route state
        navigate(`/menu/item/${item.id}`, { 
            state: { 
                selectedItem: {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    description: item.description,
                    image_url: item.image_url,
                    serves_min: item.serves_min,
                    serves_max: item.serves_max,
                } as SelectedItem
            } 
        });
    };

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col w-full max-w-md mx-auto shadow-2xl overflow-hidden">
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-[#f4f0f0] dark:border-[#3a2a2a] shrink-0">
                <div className="flex items-center p-4 justify-between">
                    <button onClick={() => navigate(-1)} className="text-[#181111] dark:text-white flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex-1 text-center">
                        <h2 className="text-[#181111] dark:text-white text-lg font-bold leading-tight">{categoryName}</h2>
                        {guestCount && (
                            <p className="text-xs text-primary font-medium">For {guestCount} people</p>
                        )}
                    </div>
                    <div onClick={() => navigate('/cart')} className="flex w-10 items-center justify-center cursor-pointer">
                        <span className="material-symbols-outlined">shopping_bag</span>
                    </div>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 gap-4 flex flex-col">
                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-500">{error}</div>
                ) : items.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No items in this category.</div>
                ) : (
                    items.map((item, index) => item ? (
                        <div 
                            key={item.id || `item-${index}`} 
                            onClick={() => handleItemClick(item)} 
                            className="bg-white dark:bg-[#2a1a1a] rounded-xl overflow-hidden shadow-sm cursor-pointer"
                        >
                            <img 
                                src={item.image_url || PLACEHOLDER_IMAGE}
                                alt={item.name || 'Menu item'}
                                onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                                className="h-40 w-full object-cover bg-gray-200"
                            />
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-[#181111] dark:text-white">{item.name || 'Unnamed Item'}</h3>
                                    <span className="font-bold text-primary">{formatPrice(item.price || 0)}</span>
                                </div>
                                {(item.serves_min || item.serves_max) && (
                                    <p className="text-sm text-gray-500 mb-2">
                                        {getServesText(item.serves_min, item.serves_max)}
                                    </p>
                                )}
                                {item.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>
                                )}
                            </div>
                        </div>
                    ) : null)
                )}
                <div className="h-20"></div>
            </main>
            <BottomNav />
        </div>
    );
};

export const AccountScreen: React.FC = () => {
    const navigate = useNavigate();
    const { contact, cashbackBalance } = useAppContext();
    
    const displayName = getDisplayName(contact);
    const contactInfo = getContactInfo(contact);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased h-screen flex flex-col overflow-hidden w-full max-w-md mx-auto shadow-2xl">
            <header className="flex-none bg-white dark:bg-background-dark px-4 pt-4 pb-4 sticky top-0 z-20 shadow-sm dark:shadow-none dark:border-b dark:border-white/10">
                <h1 className="text-xl font-bold tracking-tight w-full text-center">Account</h1>
            </header>
            <main className="flex-1 overflow-y-auto no-scrollbar pb-24 px-4 space-y-6 pt-4">
                {/* Profile Section */}
                <section className="bg-white dark:bg-[#2a1a1a] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-white/5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary overflow-hidden flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">{displayName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{displayName}</h2>
                        <p className="text-slate-500 text-sm">{contactInfo || 'No contact info'}</p>
                        <button className="text-primary text-xs font-bold mt-1">Edit Profile</button>
                    </div>
                </section>

                {/* Cashback Section */}
                <section onClick={() => navigate('/account/loyalty')} className="bg-primary text-white rounded-xl p-6 shadow-lg shadow-primary/20 relative overflow-hidden cursor-pointer">
                    <div className="relative z-10">
                        <p className="opacity-80 text-sm font-medium mb-1">Cashback Balance</p>
                        <h3 className="text-3xl font-extrabold tracking-tight">{formatPrice(cashbackBalance)}</h3>
                        <p className="text-xs mt-2 bg-white/20 inline-block px-2 py-1 rounded">You earn 5% on every order</p>
                    </div>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-6xl opacity-20">stars</span>
                </section>

                {/* Settings */}
                <div className="space-y-2">
                    <h3 className="font-bold text-lg px-1">Settings</h3>
                    <div className="bg-white dark:bg-[#2a1a1a] rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                        <button onClick={() => navigate('/account/addresses')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 text-left">
                            <span className="font-medium">Delivery Addresses</span>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                         <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 text-left">
                            <span className="font-medium">Payment Methods</span>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                         <button onClick={() => navigate('/account/scheduled')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 text-left">
                            <span className="font-medium">Scheduled Orders</span>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                    </div>
                </div>

                {/* Help */}
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
            <BottomNav />
        </div>
    );
};

export const BottomNav: React.FC = () => {
  const location = useLocation();
  
  // Helper to check if current path matches
  const isActive = (path: string) => {
    if (path === '/home') return location.pathname === '/home';
    if (path === '/menu') return location.pathname.startsWith('/menu');
    if (path === '/orders') return location.pathname.startsWith('/orders');
    if (path === '/account') return location.pathname.startsWith('/account');
    return false;
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-background-dark border-t border-gray-200 dark:border-gray-800 flex justify-around items-center h-20 px-2 pb-4 z-50">
      <NavLink 
        to="/home" 
        className={`flex flex-col items-center cursor-pointer ${isActive('/home') ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
      >
        <span className="material-symbols-outlined">home</span>
        <span className="text-[10px] font-bold mt-1">Home</span>
      </NavLink>
      <NavLink 
        to="/menu" 
        className={`flex flex-col items-center cursor-pointer ${isActive('/menu') ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
      >
        <span className="material-symbols-outlined">restaurant_menu</span>
        <span className="text-[10px] font-medium mt-1">Menu</span>
      </NavLink>
      <NavLink 
        to="/orders" 
        className={`flex flex-col items-center cursor-pointer ${isActive('/orders') ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
      >
        <span className="material-symbols-outlined">receipt_long</span>
        <span className="text-[10px] font-medium mt-1">My Orders</span>
      </NavLink>
      <NavLink 
        to="/account" 
        className={`flex flex-col items-center cursor-pointer ${isActive('/account') ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
      >
        <span className="material-symbols-outlined">person</span>
        <span className="text-[10px] font-medium mt-1">Account</span>
      </NavLink>
    </nav>
  );
};
