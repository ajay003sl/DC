import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  AlertTriangle,
  Sparkles,
  Layers,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  XCircle,
  ExternalLink,
  FolderTree,
  Settings,
  RefreshCw
} from 'lucide-react';
import { DashboardOverview } from '../../types';
import { api } from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    api.admin.getOverview()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load overview stats', err))
      .finally(() => {
        setLoading(false);
        if (isRefresh) setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 sm:w-64 bg-gray-200" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 sm:h-32 bg-white border border-[#EAE6E1]" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Products',
      value: stats?.total_products || 0,
      sub: `${stats?.active_products || 0} visible live`,
      icon: ShoppingBag,
      color: 'text-boutique-charcoal',
      bg: 'bg-white',
      border: 'border-[#EAE6E1]'
    },
    {
      label: 'Live on Store',
      value: stats?.active_products || 0,
      sub: 'Publicly active',
      icon: CheckCircle,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/40',
      border: 'border-emerald-200/60'
    },
    {
      label: 'Out of Stock',
      value: stats?.out_of_stock_products || 0,
      sub: 'Needs restocking',
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50/40',
      border: 'border-red-200/60'
    },
    {
      label: 'Low Stock Alerts',
      value: stats?.low_stock_products_count || 0,
      sub: '≤ 3 items left in store',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50/40',
      border: 'border-amber-200/60'
    },
  ];

  const totalCatalogUnits = stats?.category_stats.reduce((acc, c) => acc + c.product_count, 0) || 1;

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* 1. Top Header & Primary Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 pb-4 sm:pb-6 border-b border-[#EAE6E1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl text-boutique-charcoal font-medium">
              Store Overview
            </h1>
            <button
              onClick={() => fetchOverview(true)}
              className="p-1.5 text-[#8C827A] hover:text-black rounded-full hover:bg-white transition-colors"
              title="Refresh Stats"
              disabled={refreshing}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-[#8C827A] mt-0.5">
            Real-time physical store inventory & customer storefront sync
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            to="/admin/products/new"
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-luxury font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors rounded-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            to="/"
            target="_blank"
            className="px-3 py-2.5 bg-white border border-[#D5C4B0] hover:bg-[#FAF7F2] text-boutique-charcoal text-xs font-semibold flex items-center gap-1.5 transition-colors rounded-xs"
            title="Open Live Website in New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#8C827A]" />
            <span className="hidden sm:inline">View Store</span>
          </Link>
        </div>
      </div>

      {/* 2. Metric Cards: 2 Columns on Mobile, 4 Columns on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-3.5 sm:p-5 bg-white border ${card.border} shadow-2xs flex flex-col justify-between rounded-xs`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#8C827A] font-semibold truncate pr-1">
                  {card.label}
                </span>
                <div className={`p-1.5 sm:p-2 rounded-full ${card.bg} flex-shrink-0`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.color}`} />
                </div>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-4xl font-bold text-boutique-charcoal">
                  {card.value}
                </span>
                <p className="text-[10px] sm:text-xs text-[#8C827A] mt-0.5 truncate font-medium">
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Low Stock Variants & Category Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left Section: Low Stock Variants (7 Columns on Desktop) */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-6 border border-[#EAE6E1] shadow-sm rounded-xs">
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#EAE6E1] mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-amber-50 rounded-full text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-base sm:text-lg text-boutique-charcoal font-semibold">
                  Low Stock Variants
                </h2>
                <p className="text-[10px] sm:text-xs text-[#8C827A]">
                  Items with 3 or fewer pieces in physical store
                </p>
              </div>
            </div>
            <Link
              to="/admin/products"
              className="text-xs text-boutique-terracotta hover:underline font-semibold flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats?.low_stock_items && stats.low_stock_items.length > 0 ? (
            <>
              {/* MOBILE CARD VIEW (< md): Replaces squished table with clean, spacious mobile cards */}
              <div className="md:hidden space-y-3">
                {stats.low_stock_items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FAF7F2]/60 border border-[#EAE6E1] rounded-xs flex gap-3 items-center hover:bg-[#FAF7F2] transition-colors"
                  >
                    {/* Thumbnail Image */}
                    <img
                      src={item.primary_image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80'}
                      alt={item.name}
                      className="w-14 h-18 object-cover border border-[#EAE6E1] bg-white flex-shrink-0 shadow-2xs rounded-xs"
                    />

                    {/* Info Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h4 className="font-serif text-xs font-semibold text-boutique-charcoal truncate">
                          {item.name}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                          item.stock_quantity === 0
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {item.stock_quantity === 0 ? 'Sold Out' : `${item.stock_quantity} left`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#8C827A] mb-2 flex-wrap">
                        <span className="font-mono bg-white px-1.5 py-0.2 border border-[#EAE6E1] rounded-xs text-[10px]">
                          {item.sku}
                        </span>
                        <span className="text-boutique-charcoal font-semibold">
                          Size: {item.size}
                        </span>
                        <span>•</span>
                        <span className="text-boutique-charcoal">
                          {item.colour}
                        </span>
                      </div>

                      <Link
                        to={`/admin/products/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1A] hover:bg-black text-white text-[10px] uppercase tracking-wider font-semibold rounded-xs shadow-2xs active:scale-95 transition-all"
                      >
                        <span>Update Stock</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE VIEW (>= md): Clean tabular presentation on desktop monitors */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#F0ECE1] text-[#8C827A] uppercase tracking-wider">
                      <th className="py-2.5">Product</th>
                      <th className="py-2.5">SKU</th>
                      <th className="py-2.5">Size / Colour</th>
                      <th className="py-2.5 text-right">In Store</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE1]">
                    {stats.low_stock_items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF7F2] transition-colors">
                        <td className="py-2.5 font-medium text-boutique-charcoal flex items-center gap-2.5">
                          <img
                            src={item.primary_image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=100&q=80'}
                            alt={item.name}
                            className="w-8 h-10 object-cover border border-[#EAE6E1] bg-white flex-shrink-0"
                          />
                          <span className="truncate max-w-[170px]">{item.name}</span>
                        </td>
                        <td className="py-2.5 font-mono text-[#8C827A]">{item.sku}</td>
                        <td className="py-2.5">
                          <span className="font-semibold text-boutique-charcoal">{item.size}</span> • {item.colour}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            item.stock_quantity === 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.stock_quantity === 0 ? '0 Left' : `${item.stock_quantity} left`}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <Link
                            to={`/admin/products/${item.id}`}
                            className="text-boutique-terracotta hover:underline font-semibold"
                          >
                            Edit Stock
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-xs text-[#8C827A] space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="font-semibold text-boutique-charcoal">Inventory Levels Healthy!</p>
              <p className="text-[11px] text-[#8C827A] max-w-xs mx-auto">
                All sizes and colours currently have sufficient stock in your boutique.
              </p>
            </div>
          )}
        </div>

        {/* Right Section: Category Catalog Distribution (5 Columns on Desktop) */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-6 border border-[#EAE6E1] shadow-sm rounded-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#EAE6E1] mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-[#FAF7F2] rounded-full text-[#C5A880]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif text-base sm:text-lg text-boutique-charcoal font-semibold">
                    Category Distribution
                  </h2>
                  <p className="text-[10px] sm:text-xs text-[#8C827A]">
                    Dresses breakdown across store collections
                  </p>
                </div>
              </div>
              <Link to="/admin/categories" className="text-xs text-boutique-terracotta hover:underline font-semibold">
                Manage
              </Link>
            </div>

            {/* Category Progress Bars */}
            <div className="space-y-3.5">
              {stats?.category_stats.map((cat) => {
                const percent = Math.round((cat.product_count / totalCatalogUnits) * 100);
                return (
                  <div key={cat.category_id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-boutique-charcoal">{cat.category_name}</span>
                      <span className="text-[11px] font-bold text-[#8C827A]">
                        {cat.product_count} {cat.product_count === 1 ? 'item' : 'items'} ({percent}%)
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-[#FAF7F2] h-2 rounded-full overflow-hidden border border-[#EAE6E1]">
                      <div
                        className="bg-[#1A1A1A] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percent, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Management Links */}
          <div className="mt-6 pt-4 border-t border-[#EAE6E1] grid grid-cols-2 gap-2">
            <Link
              to="/admin/products"
              className="py-2.5 px-2 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#D5C4B0] text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal flex items-center justify-center gap-1.5 transition-colors rounded-xs text-center"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>All Products</span>
            </Link>
            <Link
              to="/admin/categories"
              className="py-2.5 px-2 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#D5C4B0] text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal flex items-center justify-center gap-1.5 transition-colors rounded-xs text-center"
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Categories</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
