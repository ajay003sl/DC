export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  product_count?: number;
  created_at?: string;
}

export interface ProductImage {
  id?: number;
  image_url: string;
  public_id?: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductVariant {
  id?: number;
  size: string;
  colour: string;
  colour_hex: string;
  stock_quantity: number;
  sku_suffix?: string;
}

export interface Offer {
  id: number;
  title: string;
  description?: string;
  discount_percentage: number;
  promo_code?: string;
  badge_text: string;
  banner_image?: string;
  start_date: string;
  expiry_date: string;
  is_active: boolean;
  is_currently_valid: boolean;
  product_count?: number;
  created_at?: string;
}

export interface ProductCard {
  id: number;
  sku: string;
  name: string;
  slug: string;
  category_id: number;
  category_name?: string;
  original_price: number;
  discounted_price?: number | null;
  discount_percentage: number;
  effective_price: number;
  primary_image_url: string;
  images: ProductImage[];
  available_sizes: string[];
  available_colours: string[];
  total_stock: number;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_on_offer: boolean;
  offer_label?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ProductDetail extends ProductCard {
  description?: string;
  category?: Category;
  variants: ProductVariant[];
  offers: Offer[];
  updated_at: string;
}

export interface ProductListResponse {
  items: ProductCard[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  sku: string;
  primary_image_url: string;
  size: string;
  colour: string;
  stock_quantity: number;
}

export interface CategoryStat {
  category_id: number;
  category_name: string;
  product_count: number;
}

export interface DashboardOverview {
  total_products: number;
  active_products: number;
  inactive_products: number;
  out_of_stock_products: number;
  low_stock_products_count: number;
  on_offer_products: number;
  new_arrivals_count: number;
  total_categories: number;
  low_stock_items: LowStockProduct[];
  category_stats: CategoryStat[];
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface StoreInfo {
  store_name: string;
  tagline: string;
  logo_url?: string;
  whatsapp_number: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  maps_embed_url: string;
}

