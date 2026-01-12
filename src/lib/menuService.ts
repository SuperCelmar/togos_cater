import { supabase } from './supabase';

export interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_catering_category: boolean;
  item_count?: number;
  image_url?: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  calories: number | null;
  is_catering_item: boolean;
  is_hot_item: boolean;
  serves_min: number | null;
  serves_max: number | null;
  allergens: string[];
  dietary_tags: string[];
  available_sizes: string[];
  can_be_wrap: boolean;
  can_be_salad_bowl: boolean;
}

export interface CategoryWithItems extends MenuCategory {
  items: MenuItem[];
}

/**
 * Fetch all catering categories with their item counts
 */
export async function getCateringCategories(): Promise<MenuCategory[]> {
  // Fetch categories that are marked as catering
  const { data: categories, error: catError } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('is_catering_category', true)
    .order('display_order', { ascending: true });

  if (catError) {
    console.error('Error fetching categories:', catError);
    throw catError;
  }

  if (!categories || categories.length === 0) {
    return [];
  }

  // Get item counts for each category
  const categoryIds = categories.map(c => c.id);
  const { data: itemCounts, error: countError } = await supabase
    .from('menu_items')
    .select('category_id')
    .eq('is_catering_item', true)
    .in('category_id', categoryIds);

  if (countError) {
    console.error('Error fetching item counts:', countError);
  }

  // Count items per category
  const countMap: Record<string, number> = {};
  if (itemCounts) {
    itemCounts.forEach(item => {
      countMap[item.category_id] = (countMap[item.category_id] || 0) + 1;
    });
  }

  // Get first item image for each category as category image
  const { data: categoryImages, error: imgError } = await supabase
    .from('menu_items')
    .select('category_id, image_url')
    .eq('is_catering_item', true)
    .in('category_id', categoryIds)
    .not('image_url', 'is', null);

  if (imgError) {
    console.error('Error fetching category images:', imgError);
  }

  // Get first image per category
  const imageMap: Record<string, string> = {};
  if (categoryImages) {
    categoryImages.forEach(item => {
      if (!imageMap[item.category_id] && item.image_url) {
        imageMap[item.category_id] = item.image_url;
      }
    });
  }

  return categories.map(cat => ({
    ...cat,
    item_count: countMap[cat.id] || 0,
    image_url: imageMap[cat.id] || null,
  }));
}

/**
 * Fetch all catering items for a specific category
 */
export async function getCateringItemsByCategory(categoryId: string): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_catering_item', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching items:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch a single menu item by ID
 */
export async function getMenuItemById(itemId: string): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (error) {
    console.error('Error fetching item:', error);
    return null;
  }

  return data;
}

/**
 * Get category by ID
 */
export async function getCategoryById(categoryId: string): Promise<MenuCategory | null> {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  return data;
}

/**
 * Calculate recommended quantity based on guest count and item serving size
 */
export function calculateRecommendedQuantity(
  guestCount: number,
  servesMin: number | null,
  servesMax: number | null
): number {
  if (!servesMin && !servesMax) {
    // If no serving info, assume 1 per 10 people
    return Math.ceil(guestCount / 10);
  }

  // Use the average of min and max for calculation
  const avgServes = servesMax 
    ? ((servesMin || servesMax) + servesMax) / 2 
    : servesMin || 10;

  return Math.ceil(guestCount / avgServes);
}

/**
 * Format price as currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Get serves text for display
 */
export function getServesText(servesMin: number | null, servesMax: number | null): string {
  if (!servesMin && !servesMax) {
    return '';
  }
  if (servesMin && servesMax && servesMin !== servesMax) {
    return `Serves ${servesMin}-${servesMax}`;
  }
  return `Serves ${servesMin || servesMax}`;
}
