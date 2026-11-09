import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Download
} from 'lucide-react';
import { ProductCard, Category, ProductListResponse } from '../../types';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/format';
import { useAdminNotification } from '../../context/AdminNotificationContext';

export const AdminProductsPage: React.FC = () => {
  const { showSuccess, showError } = useAdminNotification();
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all'); // all, active, inactive
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    const activeFilter = selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined;

    api.admin.getProducts({
      page,
      page_size: 15,
      search: search.trim() || undefined,
      category_id: selectedCategory !== '' ? Number(selectedCategory) : undefined,
      is_active: activeFilter,
    })
      .then((res: ProductListResponse) => {
        setProducts(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.admin.getCategories()
      .then((cats) => setCategories(cats))
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, search, selectedCategory, selectedStatus]);

  const handleToggleStatus = async (productId: number, currentStatus: boolean) => {
    const product = products.find((p) => p.id === productId);
    const prodName = product ? product.name : 'Product';
    try {
      await api.admin.toggleProductStatus(productId, { is_active: !currentStatus });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_active: !currentStatus } : p))
      );
      showSuccess(
        !currentStatus ? 'Product Activated' : 'Product Deactivated',
        `"${prodName}" is now ${!currentStatus ? 'visible on' : 'hidden from'} the public storefront.`
      );
    } catch (err: any) {
      showError('Status Update Failed', err.message || 'Could not update product status.');
    }
  };

  const handleDelete = async (id: number) => {
    const productToDelete = products.find((p) => p.id === id);
    const prodName = productToDelete ? productToDelete.name : 'Product';
    try {
      await api.admin.deleteProduct(id);
      setDeleteConfirmId(null);
      await fetchProducts();
      showSuccess('Product Deleted Successfully!', `"${prodName}" has been permanently removed from your catalog.`);
    } catch (err: any) {
      showError('Failed to Delete Product', err.message || 'An error occurred while deleting the product.');
    }
  };

  const handleExportCSV = () => {
    if (products.length === 0) {
      alert('No products to export.');
      return;
    }
    const headers = ['ID', 'SKU', 'Name', 'Category', 'Price', 'Stock Quantity', 'Status', 'Featured', 'New Arrival'];
    const rows = products.map((p) => [
      p.id,
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category_name || ''}"`,
      p.original_price,
      p.total_stock,
      p.is_active ? 'Active' : 'Hidden',
      p.is_featured ? 'Yes' : 'No',
      p.is_new_arrival ? 'Yes' : 'No'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jershiha_fashion_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#EAE6E1]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-boutique-charcoal font-medium">
            Product Catalog & Stock Matrix
          </h1>
          <p className="text-xs text-[#8C827A] mt-1">
            Manage your boutique clothing catalog, multi-images, and variant stock
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial justify-center px-3.5 py-2.5 bg-white border border-[#D5C4B0] text-boutique-charcoal hover:bg-[#FAF7F2] text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Download CSV Spreadsheet"
          >
            <Download className="w-4 h-4 text-[#8C827A]" />
            <span>Export CSV</span>
          </button>

          <Link
            to="/admin/products/new"
            className="flex-1 sm:flex-initial justify-center px-4 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-luxury font-semibold flex items-center gap-2 shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 border border-[#EAE6E1] shadow-2xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product name, SKU..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-boutique-charcoal rounded-none text-boutique-charcoal placeholder-[#9C948B]"
          />
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-3" />
        </div>

        {/* Filters Grid for Mobile */}
        <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto">
          {/* Category filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value === '' ? '' : Number(e.target.value));
                setPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none rounded-none text-boutique-charcoal font-medium cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="w-full md:w-40">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none rounded-none text-boutique-charcoal font-medium cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Hidden / Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Container */}
      <div className="bg-white border border-[#EAE6E1] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#8C827A] animate-pulse">
            Loading boutique products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-serif text-xl text-boutique-charcoal mb-2">No products found</p>
            <p className="text-xs text-[#8C827A] mb-4">Try clearing your filters or create a new product.</p>
            <Link
              to="/admin/products/new"
              className="px-4 py-2 bg-[#1A1A1A] text-white text-xs uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Product</span>
            </Link>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: High-end Responsive Product Cards */}
            <div className="block md:hidden divide-y divide-[#EAE6E1]">
              {products.map((p) => {
                const stockBadgeClass =
                  p.total_stock === 0
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : p.total_stock <= 3
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200';

                const stockLabel =
                  p.total_stock === 0
                    ? 'Out of Stock'
                    : p.total_stock <= 3
                    ? `${p.total_stock} in store (Low)`
                    : `${p.total_stock} in store`;

                return (
                  <div key={p.id} className="p-4 space-y-3 hover:bg-[#FAF7F2]/40 transition-colors">
                    {/* Top Row: Thumbnail + Info */}
                    <div className="flex gap-3.5 items-start">
                      <Link to={`/admin/products/${p.id}`} className="flex-shrink-0">
                        <img
                          src={p.primary_image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80'}
                          alt={p.name}
                          className="w-16 h-20 object-cover border border-[#EAE6E1] bg-[#F5F2EB] shadow-2xs"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <Link
                          to={`/admin/products/${p.id}`}
                          className="font-serif text-sm font-semibold text-boutique-charcoal hover:text-[#B86B5A] leading-snug line-clamp-2"
                        >
                          {p.name}
                        </Link>

                        {/* Category & Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {p.is_featured && (
                            <span className="px-1.5 py-0.5 text-[9px] bg-amber-100 text-amber-800 font-semibold uppercase tracking-wider">
                              Featured
                            </span>
                          )}
                          {p.is_new_arrival && (
                            <span className="px-1.5 py-0.5 text-[9px] bg-purple-100 text-purple-800 font-semibold uppercase tracking-wider">
                              New
                            </span>
                          )}
                          <span className="text-[11px] text-[#8C827A] font-medium truncate">
                            {p.category_name || 'Uncategorized'}
                          </span>
                        </div>

                        {/* SKU */}
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#8C827A]">
                          <span className="font-mono bg-[#FAF7F2] px-1.5 py-0.5 border border-[#EAE6E1] text-[10px]">
                            {p.sku}
                          </span>
                        </div>

                        {/* Price & Stock */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F0ECE1]">
                          <span className="text-sm font-bold text-boutique-charcoal">
                            {formatPrice(p.original_price)}
                          </span>
                          <span className={`px-2 py-0.5 border text-[10px] font-bold ${stockBadgeClass}`}>
                            {stockLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#F5F2EB]">
                      {/* Storefront Status Toggle */}
                      <button
                        onClick={() => handleToggleStatus(p.id, p.is_active)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors border ${
                          p.is_active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                        title="Tap to toggle live storefront visibility"
                      >
                        {p.is_active ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-gray-500" />}
                        <span>{p.is_active ? 'Active on Store' : 'Hidden'}</span>
                      </button>

                      {/* Quick Action Links */}
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/product/${p.slug}`}
                          target="_blank"
                          title="View on Storefront"
                          className="p-2 text-[#8C827A] hover:text-black hover:bg-[#FAF7F2] rounded transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/products/${p.id}`}
                          title="Edit Product"
                          className="p-2 text-[#8C827A] hover:text-[#B86B5A] hover:bg-[#FAF7F2] rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          title="Delete Product"
                          className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW: Clean Data Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#EAE6E1] text-[#8C827A] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-center">Storefront Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE1]">
                  {products.map((p) => {
                    return (
                      <tr key={p.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        {/* Image & Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.primary_image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=100&q=80'}
                              alt={p.name}
                              className="w-10 h-14 object-cover border border-[#EAE6E1] bg-[#F5F2EB]"
                            />
                            <div>
                              <Link
                                to={`/admin/products/${p.id}`}
                                className="font-medium text-boutique-charcoal hover:text-[#B86B5A] text-xs line-clamp-1"
                              >
                                {p.name}
                              </Link>
                              <div className="flex items-center gap-1 mt-1">
                                {p.is_featured && (
                                  <span className="px-1.5 py-0.2 text-[9px] bg-amber-100 text-amber-800 rounded font-medium">
                                    Featured
                                  </span>
                                )}
                                {p.is_new_arrival && (
                                  <span className="px-1.5 py-0.2 text-[9px] bg-purple-100 text-purple-800 rounded font-medium">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3 px-4 font-mono text-[#8C827A]">{p.sku}</td>

                        {/* Category */}
                        <td className="py-3 px-4 text-boutique-charcoal font-medium">
                          {p.category_name || '—'}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-boutique-charcoal">
                            {formatPrice(p.original_price)}
                          </div>
                        </td>

                        {/* Stock Level */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.total_stock === 0
                                ? 'bg-red-100 text-red-700'
                                : p.total_stock <= 3
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {p.total_stock === 0 ? 'Out of Stock' : `${p.total_stock} in store`}
                          </span>
                        </td>

                        {/* Status Toggle Switch */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(p.id, p.is_active)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase transition-colors ${
                              p.is_active
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {p.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            <span>{p.is_active ? 'Active' : 'Hidden'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/product/${p.slug}`}
                              target="_blank"
                              title="View on Storefront"
                              className="p-1.5 text-[#8C827A] hover:text-black transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            <Link
                              to={`/admin/products/${p.id}`}
                              title="Edit Product"
                              className="p-1.5 text-[#8C827A] hover:text-[#B86B5A] transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              title="Delete Product"
                              className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3.5 sm:p-4 bg-[#FAF7F2] border-t border-[#EAE6E1] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[#8C827A] text-center sm:text-left">
              Page {page} of {totalPages} ({total} total products)
            </span>
            <div className="flex gap-1.5 w-full sm:w-auto justify-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex-1 sm:flex-initial px-4 py-1.5 bg-white border border-[#D5C4B0] text-boutique-charcoal disabled:opacity-40 font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex-1 sm:flex-initial px-4 py-1.5 bg-white border border-[#D5C4B0] text-boutique-charcoal disabled:opacity-40 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-sm w-full border border-[#EAE6E1] shadow-xl text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
            <h3 className="font-serif text-xl font-medium text-boutique-charcoal">
              Delete Product?
            </h3>
            <p className="text-xs text-[#6B6B6B]">
              This will permanently remove the item, its images, and stock variants from the database. It will immediately disappear from the public website.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs uppercase tracking-wider border border-[#D5C4B0] text-boutique-charcoal"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 text-xs uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

