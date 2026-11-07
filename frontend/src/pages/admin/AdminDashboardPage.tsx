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
  XCircle
} from 'lucide-react';
import { DashboardOverview } from '../../types';
import { api } from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.getOverview()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load overview stats', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white border border-[#EAE6E1]" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Products',
      value: stats?.total_products || 0,
      sub: `${stats?.active_products || 0} visible on storefront`,
      icon: ShoppingBag,
      color: 'text-boutique-charcoal',
      bg: 'bg-white',
    },
    {
      label: 'Live on Storefront',
      value: stats?.active_products || 0,
      sub: 'Visible to public shoppers',
      icon: CheckCircle,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/50',
    },
    {
      label: 'Out of Stock',
      value: stats?.out_of_stock_products || 0,
      sub: 'Needs urgent physical restock',
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50/50',
    },
    {
      label: 'Low Stock Warnings',
      value: stats?.low_stock_products_count || 0,
      sub: '≤ 3 items remaining in store',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50/50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#EAE6E1]">
        <div>
          <h1 className="font-serif text-3xl text-boutique-charcoal font-medium">
            Storefront Inventory & Operations
          </h1>
          <p className="text-xs text-[#8C827A] mt-1">
            Real-time synchronization with your physical clothing store database
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/new"
            className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-luxury font-semibold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 bg-white border border-[#EAE6E1] shadow-sm flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-luxury text-[#8C827A] font-semibold">
                  {card.label}
                </span>
                <div className={`p-2 rounded-full ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div>
                <span className="font-serif text-4xl font-bold text-boutique-charcoal">
                  {card.value}
                </span>
                <p className="text-xs text-[#8C827A] mt-1 font-medium">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Section: Low Stock Table & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Low Stock Alerts Table (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 border border-[#EAE6E1] shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#EAE6E1] mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="font-serif text-xl text-boutique-charcoal font-medium">
                Low Stock Variants (Store Restock Alert)
              </h2>
            </div>
            <Link
              to="/admin/products"
              className="text-xs text-[#B86B5A] hover:underline font-medium"
            >
              Manage all stock →
            </Link>
          </div>

          {stats?.low_stock_items && stats.low_stock_items.length > 0 ? (
            <div className="overflow-x-auto">
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
                    <tr key={idx} className="hover:bg-[#FAF7F2]">
                      <td className="py-2.5 font-medium text-boutique-charcoal flex items-center gap-2">
                        <img
                          src={item.primary_image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=100&q=80'}
                          alt={item.name}
                          className="w-8 h-10 object-cover border border-[#EAE6E1]"
                        />
                        <span className="truncate max-w-[150px]">{item.name}</span>
                      </td>
                      <td className="py-2.5 font-mono text-[#8C827A]">{item.sku}</td>
                      <td className="py-2.5">
                        <span className="font-semibold">{item.size}</span> • {item.colour}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.stock_quantity === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.stock_quantity} left
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          to={`/admin/products/${item.id}`}
                          className="text-[#B86B5A] hover:underline font-semibold"
                        >
                          Edit Stock
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#8C827A]">
              <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p>All product variants currently have healthy inventory levels!</p>
            </div>
          )}
        </div>

        {/* Right: Category Volume Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 border border-[#EAE6E1] shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#EAE6E1] mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C5A880]" />
              <h2 className="font-serif text-xl text-boutique-charcoal font-medium">
                Catalog Distribution
              </h2>
            </div>
            <Link to="/admin/categories" className="text-xs text-[#B86B5A] hover:underline font-medium">
              View categories →
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.category_stats.map((cat) => (
              <div key={cat.category_id} className="flex items-center justify-between text-xs py-2 border-b border-[#FAF7F2]">
                <span className="font-medium text-boutique-charcoal">{cat.category_name}</span>
                <span className="px-2.5 py-0.5 bg-[#FAF7F2] border border-[#EAE6E1] font-semibold text-boutique-charcoal">
                  {cat.product_count} items
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-[#EAE6E1]">
            <Link
              to="/admin/products"
              className="w-full py-2.5 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#D5C4B0] text-xs uppercase tracking-wider font-semibold text-boutique-charcoal flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-[#B86B5A]" />
              <span>Manage Products & Inventory</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

