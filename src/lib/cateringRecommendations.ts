/**
 * Catering Recommendation Engine
 * Calculates optimal food quantities based on guest count
 */

import { getAllCateringItems, MenuItem } from './menuService';

export interface RecommendationItem {
  name: string;
  quantity: number;
  serves: string;
  unitPrice: number;
  totalPrice: number;
}

export interface CateringRecommendation {
  approach: 'tray' | 'boxed';
  mainItems: RecommendationItem[];
  sides: RecommendationItem[];
  drinks: RecommendationItem[];
  desserts: RecommendationItem[];
  subtotal: number;
  estimatedRange: { min: number; max: number };
  guestCount: number;
}

// Catering item pricing (matches Supabase data)
const PRICING = {
  signatureTrayLarge: { price: 149.99, servesMin: 10, servesMax: 14 },
  signatureTrayRegular: { price: 79.99, servesMin: 6, servesMax: 8 },
  createYourOwnLarge: { price: 139.99, servesMin: 10, servesMax: 14 },
  createYourOwnRegular: { price: 74.99, servesMin: 6, servesMax: 8 },
  boxedLunchRegular: { price: 14.99, servesMin: 1, servesMax: 1 },
  boxedLunchLarge: { price: 17.99, servesMin: 1, servesMax: 1 },
  boxedLunchWrap: { price: 15.99, servesMin: 1, servesMax: 1 },
  boxedLunchSalad: { price: 16.99, servesMin: 1, servesMax: 1 },
  cateringSalad: { price: 54.99, servesMin: 6, servesMax: 12 },
  chipsPack: { price: 19.99, servesMin: 8, servesMax: 8 },
  drinksPack: { price: 19.99, servesMin: 8, servesMax: 8 },
  cookieTray: { price: 24.99, servesMin: 8, servesMax: 12 },
  brownieTray: { price: 29.99, servesMin: 8, servesMax: 12 },
  comboDessertTray: { price: 34.99, servesMin: 10, servesMax: 16 },
};

/**
 * Calculate the number of trays needed for a given guest count
 */
function calculateTrayQuantity(
  guestCount: number,
  trayServesMax: number
): number {
  return Math.ceil(guestCount / trayServesMax);
}

/**
 * Calculate packs needed (chips/drinks) - rounds up to nearest pack
 */
function calculatePackQuantity(guestCount: number, packSize: number): number {
  return Math.ceil(guestCount / packSize);
}

/**
 * Generate a tray-based recommendation
 * Best for larger groups where sharing is appropriate
 */
export function getTrayRecommendation(guestCount: number): CateringRecommendation {
  const mainItems: RecommendationItem[] = [];
  const sides: RecommendationItem[] = [];
  const drinks: RecommendationItem[] = [];
  const desserts: RecommendationItem[] = [];

  // Calculate sandwich trays
  // Use large trays for most, supplement with regular if needed
  const largeTrays = Math.floor(guestCount / 12);
  const remainingGuests = guestCount - largeTrays * 12;
  const regularTrays = remainingGuests > 0 ? Math.ceil(remainingGuests / 7) : 0;

  if (largeTrays > 0) {
    mainItems.push({
      name: 'Signature Sandwich Tray - Large',
      quantity: largeTrays,
      serves: `${largeTrays * 10}-${largeTrays * 14}`,
      unitPrice: PRICING.signatureTrayLarge.price,
      totalPrice: largeTrays * PRICING.signatureTrayLarge.price,
    });
  }

  if (regularTrays > 0) {
    mainItems.push({
      name: 'Signature Sandwich Tray - Regular',
      quantity: regularTrays,
      serves: `${regularTrays * 6}-${regularTrays * 8}`,
      unitPrice: PRICING.signatureTrayRegular.price,
      totalPrice: regularTrays * PRICING.signatureTrayRegular.price,
    });
  }

  // Add a salad for groups > 15
  if (guestCount >= 15) {
    const saladCount = Math.floor(guestCount / 20) || 1;
    sides.push({
      name: 'Catering Salad',
      quantity: saladCount,
      serves: `${saladCount * 6}-${saladCount * 12} as side`,
      unitPrice: PRICING.cateringSalad.price,
      totalPrice: saladCount * PRICING.cateringSalad.price,
    });
  }

  // Chips packs
  const chipsPacks = calculatePackQuantity(guestCount, 8);
  sides.push({
    name: 'Chips Pack (8)',
    quantity: chipsPacks,
    serves: `${chipsPacks * 8}`,
    unitPrice: PRICING.chipsPack.price,
    totalPrice: chipsPacks * PRICING.chipsPack.price,
  });

  // Drinks packs
  const drinksPacks = calculatePackQuantity(guestCount, 8);
  drinks.push({
    name: 'Drinks Pack (8)',
    quantity: drinksPacks,
    serves: `${drinksPacks * 8}`,
    unitPrice: PRICING.drinksPack.price,
    totalPrice: drinksPacks * PRICING.drinksPack.price,
  });

  // Dessert for groups > 10
  if (guestCount >= 10) {
    const dessertTrays = Math.ceil(guestCount / 12);
    desserts.push({
      name: 'Cookie & Brownie Combo Tray',
      quantity: dessertTrays,
      serves: `${dessertTrays * 10}-${dessertTrays * 16}`,
      unitPrice: PRICING.comboDessertTray.price,
      totalPrice: dessertTrays * PRICING.comboDessertTray.price,
    });
  }

  const subtotal =
    mainItems.reduce((sum, item) => sum + item.totalPrice, 0) +
    sides.reduce((sum, item) => sum + item.totalPrice, 0) +
    drinks.reduce((sum, item) => sum + item.totalPrice, 0) +
    desserts.reduce((sum, item) => sum + item.totalPrice, 0);

  return {
    approach: 'tray',
    mainItems,
    sides,
    drinks,
    desserts,
    subtotal,
    estimatedRange: {
      min: Math.round(subtotal * 0.9),
      max: Math.round(subtotal * 1.15),
    },
    guestCount,
  };
}

/**
 * Generate a boxed lunch recommendation
 * Best for grab-and-go situations or individual portions
 */
export function getBoxedLunchRecommendation(guestCount: number): CateringRecommendation {
  const mainItems: RecommendationItem[] = [];
  const sides: RecommendationItem[] = [];
  const drinks: RecommendationItem[] = [];
  const desserts: RecommendationItem[] = [];

  // Each person gets their own boxed lunch (includes chips + cookie)
  mainItems.push({
    name: 'Boxed Lunch - Regular',
    quantity: guestCount,
    serves: `${guestCount}`,
    unitPrice: PRICING.boxedLunchRegular.price,
    totalPrice: guestCount * PRICING.boxedLunchRegular.price,
  });

  // Drinks packs (boxed lunch doesn't include drinks)
  const drinksPacks = calculatePackQuantity(guestCount, 8);
  drinks.push({
    name: 'Drinks Pack (8)',
    quantity: drinksPacks,
    serves: `${drinksPacks * 8}`,
    unitPrice: PRICING.drinksPack.price,
    totalPrice: drinksPacks * PRICING.drinksPack.price,
  });

  const subtotal =
    mainItems.reduce((sum, item) => sum + item.totalPrice, 0) +
    sides.reduce((sum, item) => sum + item.totalPrice, 0) +
    drinks.reduce((sum, item) => sum + item.totalPrice, 0) +
    desserts.reduce((sum, item) => sum + item.totalPrice, 0);

  return {
    approach: 'boxed',
    mainItems,
    sides,
    drinks,
    desserts,
    subtotal,
    estimatedRange: {
      min: Math.round(subtotal * 0.95),
      max: Math.round(subtotal * 1.1),
    },
    guestCount,
  };
}

/**
 * Get the default recommendation based on guest count
 * Suggests trays for larger groups, boxed for smaller
 */
export function getRecommendation(guestCount: number): CateringRecommendation {
  // For smaller groups (< 15), boxed lunches might be more practical
  // For larger groups, trays are more economical
  if (guestCount < 15) {
    return getBoxedLunchRecommendation(guestCount);
  }
  return getTrayRecommendation(guestCount);
}

/**
 * Format a price as currency
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Get a simple text summary of the recommendation
 */
export function getRecommendationSummary(guestCount: number): string {
  const rec = getRecommendation(guestCount);
  
  if (rec.approach === 'boxed') {
    return `${guestCount} Boxed Lunches and ${rec.drinks[0]?.quantity || 0} Drink Pack${(rec.drinks[0]?.quantity || 0) > 1 ? 's' : ''}`;
  }
  
  const totalTrays = rec.mainItems.reduce((sum, item) => sum + item.quantity, 0);
  const drinkPacks = rec.drinks[0]?.quantity || 0;
  
  return `${totalTrays} Sandwich Tray${totalTrays > 1 ? 's' : ''} and ${drinkPacks} Drink Pack${drinkPacks > 1 ? 's' : ''}`;
}

// ============================================
// ENHANCED RECOMMENDATION WITH REAL MENU ITEMS
// ============================================

/**
 * Enhanced recommendation item with full MenuItem from Supabase
 */
export interface EnhancedRecommendationItem {
  menuItem: MenuItem;
  quantity: number;
  totalPrice: number;
}

/**
 * Enhanced catering recommendation with real menu items
 */
export interface EnhancedCateringRecommendation {
  approach: 'tray' | 'boxed';
  items: EnhancedRecommendationItem[];
  subtotal: number;
  guestCount: number;
}

/**
 * Name patterns to match recommendation items to Supabase menu items
 * Maps from recommendation name pattern to possible Supabase item name patterns
 */
const ITEM_NAME_PATTERNS: Record<string, string[]> = {
  'Signature Sandwich Tray - Large': ['Signature Sandwich Tray - Large', 'Signature Tray Large', 'Sandwich Tray Large'],
  'Signature Sandwich Tray - Regular': ['Signature Sandwich Tray - Regular', 'Signature Tray Regular', 'Sandwich Tray Regular'],
  'Boxed Lunch - Regular': ['Boxed Lunch - Regular', 'Boxed Lunch Regular', 'Regular Boxed Lunch'],
  'Boxed Lunch - Large': ['Boxed Lunch - Large', 'Boxed Lunch Large', 'Large Boxed Lunch'],
  'Boxed Lunch - Wrap': ['Boxed Lunch - Wrap', 'Wrap Boxed Lunch'],
  'Boxed Lunch - Full Salad': ['Boxed Lunch - Full Salad', 'Salad Boxed Lunch', 'Boxed Lunch Salad'],
  'Catering Salad': ['Catering Salad', 'Side Salad', 'Garden Salad'],
  'Chips Pack (8)': ['Chips Pack', 'Chip Pack', 'Chips (8)', 'Assorted Chips'],
  'Drinks Pack (8)': ['Drinks Pack', 'Drink Pack', 'Drinks (8)', 'Beverage Pack', 'Assorted Drinks'],
  'Cookie & Brownie Combo Tray': ['Cookie & Brownie Combo', 'Combo Dessert Tray', 'Cookie Brownie Tray', 'Dessert Combo'],
  'Cookie Tray': ['Cookie Tray', 'Cookies Tray'],
  'Brownie Tray': ['Brownie Tray', 'Brownies Tray'],
};

/**
 * Find a menu item by matching name patterns (case-insensitive)
 */
function findMenuItemByName(name: string, menuItems: MenuItem[]): MenuItem | null {
  // Direct match first
  const directMatch = menuItems.find(
    item => item.name.toLowerCase() === name.toLowerCase()
  );
  if (directMatch) return directMatch;

  // Try pattern matching
  const patterns = ITEM_NAME_PATTERNS[name] || [name];
  for (const pattern of patterns) {
    const match = menuItems.find(
      item => item.name.toLowerCase().includes(pattern.toLowerCase()) ||
              pattern.toLowerCase().includes(item.name.toLowerCase())
    );
    if (match) return match;
  }

  // Fuzzy match: check if key words match
  const keyWords = name.toLowerCase().split(/[\s-]+/).filter(w => w.length > 2);
  const fuzzyMatch = menuItems.find(item => {
    const itemWords = item.name.toLowerCase();
    return keyWords.filter(w => itemWords.includes(w)).length >= 2;
  });

  return fuzzyMatch || null;
}

/**
 * Convert basic recommendation to enhanced recommendation with real menu items
 */
async function enhanceRecommendation(
  basicRec: CateringRecommendation,
  menuItems: MenuItem[]
): Promise<EnhancedCateringRecommendation> {
  const enhancedItems: EnhancedRecommendationItem[] = [];

  // Process all recommendation items
  const allBasicItems = [
    ...basicRec.mainItems,
    ...basicRec.sides,
    ...basicRec.drinks,
    ...basicRec.desserts,
  ];

  for (const item of allBasicItems) {
    const menuItem = findMenuItemByName(item.name, menuItems);
    if (menuItem) {
      enhancedItems.push({
        menuItem,
        quantity: item.quantity,
        totalPrice: menuItem.price * item.quantity,
      });
    } else {
      console.warn(`[Recommendation] Could not find menu item for: "${item.name}"`);
    }
  }

  // Recalculate subtotal based on actual menu prices
  const subtotal = enhancedItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return {
    approach: basicRec.approach,
    items: enhancedItems,
    subtotal,
    guestCount: basicRec.guestCount,
  };
}

/**
 * Get recommendation with real menu items from Supabase
 * This fetches actual menu items and matches them to the recommendation
 */
export async function getRecommendationWithItems(
  guestCount: number
): Promise<EnhancedCateringRecommendation> {
  // Fetch all catering items from Supabase
  const menuItems = await getAllCateringItems();

  // Get basic recommendation
  const basicRec = getRecommendation(guestCount);

  // Enhance with real menu items
  return enhanceRecommendation(basicRec, menuItems);
}
