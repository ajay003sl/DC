import {
  Category,
  ProductCard,
  ProductDetail,
  ProductListResponse,
  Offer,
  DashboardOverview,
  User,
  StoreInfo
} from '../types';

const API_BASE = '/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('aura_admin_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.detail) {
        errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Public Storefront APIs
  public: {
    getStoreInfo: async (): Promise<StoreInfo> => {
      const res = await fetch(`${API_BASE}/public/store-info`);
      return handleResponse<StoreInfo>(res);
    },

    getCategories: async (): Promise<Category[]> => {
      const res = await fetch(`${API_BASE}/public/categories`);
      return handleResponse<Category[]>(res);
    },

    getProducts: async (params: {
      page?: number;
      page_size?: number;
      category_slug?: string;
      category_id?: number;
      sizes?: string;
      colour?: string;
      min_price?: number;
      max_price?: number;
      sort_by?: string;
      search?: string;
      is_featured?: boolean;
      is_new_arrival?: boolean;
      is_on_offer?: boolean;
      in_stock_only?: boolean;
    } = {}): Promise<ProductListResponse> => {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page.toString());
      if (params.page_size) query.set('page_size', params.page_size.toString());
      if (params.category_slug) query.set('category_slug', params.category_slug);
      if (params.category_id) query.set('category_id', params.category_id.toString());
      if (params.sizes) query.set('sizes', params.sizes);
      if (params.colour) query.set('colour', params.colour);
      if (params.min_price !== undefined) query.set('min_price', params.min_price.toString());
      if (params.max_price !== undefined) query.set('max_price', params.max_price.toString());
      if (params.sort_by) query.set('sort_by', params.sort_by);
      if (params.search) query.set('search', params.search);
      if (params.is_featured !== undefined) query.set('is_featured', String(params.is_featured));
      if (params.is_new_arrival !== undefined) query.set('is_new_arrival', String(params.is_new_arrival));
      if (params.is_on_offer !== undefined) query.set('is_on_offer', String(params.is_on_offer));
      if (params.in_stock_only) query.set('in_stock_only', 'true');

      const res = await fetch(`${API_BASE}/public/products?${query.toString()}`);
      return handleResponse<ProductListResponse>(res);
    },

    getProductDetail: async (slugOrId: string | number): Promise<ProductDetail> => {
      const res = await fetch(`${API_BASE}/public/products/${slugOrId}`);
      return handleResponse<ProductDetail>(res);
    },

    getRelatedProducts: async (slugOrId: string | number, limit = 4): Promise<ProductCard[]> => {
      const res = await fetch(`${API_BASE}/public/products/${slugOrId}/related?limit=${limit}`);
      return handleResponse<ProductCard[]>(res);
    },

    getOffers: async (): Promise<Offer[]> => {
      const res = await fetch(`${API_BASE}/public/offers`);
      return handleResponse<Offer[]>(res);
    },

    getFeaturedCollections: async (): Promise<{
      new_arrivals: ProductCard[];
      featured: ProductCard[];
      special_offers: ProductCard[];
    }> => {
      const res = await fetch(`${API_BASE}/public/featured-collections`);
      return handleResponse(res);
    }
  },

  // Auth APIs
  auth: {
    login: async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return handleResponse(res);
    },

    getMe: async (): Promise<User> => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
      return handleResponse<User>(res);
    },

    logout: async () => {
      localStorage.removeItem('aura_admin_token');
      localStorage.removeItem('aura_admin_user');
    }
  },

  // Admin APIs
  admin: {
    getOverview: async (): Promise<DashboardOverview> => {
      const res = await fetch(`${API_BASE}/admin/analytics/overview`, {
        headers: getAuthHeaders()
      });
      return handleResponse<DashboardOverview>(res);
    },

    getProducts: async (params: {
      page?: number;
      page_size?: number;
      search?: string;
      category_id?: number;
      is_active?: boolean;
      is_on_offer?: boolean;
      sort_by?: string;
    } = {}): Promise<ProductListResponse> => {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page.toString());
      if (params.page_size) query.set('page_size', params.page_size.toString());
      if (params.search) query.set('search', params.search);
      if (params.category_id) query.set('category_id', params.category_id.toString());
      if (params.is_active !== undefined) query.set('is_active', String(params.is_active));
      if (params.is_on_offer !== undefined) query.set('is_on_offer', String(params.is_on_offer));
      if (params.sort_by) query.set('sort_by', params.sort_by);

      const res = await fetch(`${API_BASE}/admin/products?${query.toString()}`, {
        headers: getAuthHeaders()
      });
      return handleResponse<ProductListResponse>(res);
    },

    getProduct: async (id: number): Promise<ProductDetail> => {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse<ProductDetail>(res);
    },

    createProduct: async (data: any): Promise<ProductDetail> => {
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<ProductDetail>(res);
    },

    updateProduct: async (id: number, data: any): Promise<ProductDetail> => {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<ProductDetail>(res);
    },

    deleteProduct: async (id: number): Promise<{ message: string }> => {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    toggleProductStatus: async (id: number, statusData: {
      is_active?: boolean;
      is_featured?: boolean;
      is_new_arrival?: boolean;
      is_on_offer?: boolean;
    }) => {
      const query = new URLSearchParams();
      if (statusData.is_active !== undefined) query.set('is_active', String(statusData.is_active));
      if (statusData.is_featured !== undefined) query.set('is_featured', String(statusData.is_featured));
      if (statusData.is_new_arrival !== undefined) query.set('is_new_arrival', String(statusData.is_new_arrival));
      if (statusData.is_on_offer !== undefined) query.set('is_on_offer', String(statusData.is_on_offer));

      const res = await fetch(`${API_BASE}/admin/products/${id}/status?${query.toString()}`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    // Categories
    getCategories: async (): Promise<Category[]> => {
      const res = await fetch(`${API_BASE}/admin/categories`, {
        headers: getAuthHeaders()
      });
      return handleResponse<Category[]>(res);
    },

    createCategory: async (data: Partial<Category>): Promise<Category> => {
      const res = await fetch(`${API_BASE}/admin/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<Category>(res);
    },

    updateCategory: async (id: number, data: Partial<Category>): Promise<Category> => {
      const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<Category>(res);
    },

    deleteCategory: async (id: number, options?: { reassignToId?: number; force?: boolean }): Promise<{ message: string }> => {
      const params = new URLSearchParams();
      if (options?.reassignToId) params.append('reassign_to_id', options.reassignToId.toString());
      if (options?.force) params.append('force', 'true');
      const qs = params.toString() ? `?${params.toString()}` : '';

      const res = await fetch(`${API_BASE}/admin/categories/${id}${qs}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    // Offers
    getOffers: async (): Promise<Offer[]> => {
      const res = await fetch(`${API_BASE}/admin/offers`, {
        headers: getAuthHeaders()
      });
      return handleResponse<Offer[]>(res);
    },

    createOffer: async (data: any): Promise<Offer> => {
      const res = await fetch(`${API_BASE}/admin/offers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<Offer>(res);
    },

    updateOffer: async (id: number, data: any): Promise<Offer> => {
      const res = await fetch(`${API_BASE}/admin/offers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<Offer>(res);
    },

    deleteOffer: async (id: number): Promise<{ message: string }> => {
      const res = await fetch(`${API_BASE}/admin/offers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },

    // Upload
    uploadImages: async (files: File[]): Promise<Array<{ image_url: string; public_id: string }>> => {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));

      const token = localStorage.getItem('aura_admin_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/admin/upload/images`, {
        method: 'POST',
        headers,
        body: formData
      });
      return handleResponse(res);
    },

    // Settings
    getSettings: async (): Promise<StoreInfo> => {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        headers: getAuthHeaders()
      });
      return handleResponse<StoreInfo>(res);
    },

    updateSettings: async (data: Partial<StoreInfo>): Promise<StoreInfo> => {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse<StoreInfo>(res);
    },

    // Change Password
    changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
      });
      return handleResponse(res);
    }
  }
};

