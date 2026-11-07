import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Calendar, Clock, AlertCircle, Check, X } from 'lucide-react';
import { Offer, ProductCard } from '../../types';
import { api } from '../../services/api';

export const AdminOffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(20);
  const [promoCode, setPromoCode] = useState('');
  const [badgeText, setBadgeText] = useState('20% OFF');
  const [bannerImage, setBannerImage] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isActive, setIsActive] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  const fetchOffers = () => {
    setLoading(true);
    Promise.all([
      api.admin.getOffers(),
      api.admin.getProducts({ page_size: 50 })
    ])
      .then(([offersData, prodsData]) => {
        setOffers(offersData);
        setProducts(prodsData.items);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const openCreateModal = () => {
    setEditingOffer(null);
    setTitle('');
    setDescription('');
    setDiscountPercentage(20);
    setPromoCode('');
    setBadgeText('20% OFF');
    setBannerImage('https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1200&q=80');
    setStartDate(new Date().toISOString().split('T')[0]);
    setExpiryDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setIsActive(true);
    setSelectedProductIds([]);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (o: Offer) => {
    setEditingOffer(o);
    setTitle(o.title);
    setDescription(o.description || '');
    setDiscountPercentage(o.discount_percentage);
    setPromoCode(o.promo_code || '');
    setBadgeText(o.badge_text || '');
    setBannerImage(o.banner_image || '');
    setStartDate(o.start_date.split('T')[0]);
    setExpiryDate(o.expiry_date.split('T')[0]);
    setIsActive(o.is_active);
    setSelectedProductIds([]);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      discount_percentage: Number(discountPercentage),
      promo_code: promoCode.trim() || undefined,
      badge_text: badgeText.trim() || 'SPECIAL OFFER',
      banner_image: bannerImage.trim() || undefined,
      start_date: new Date(`${startDate}T00:00:00Z`).toISOString(),
      expiry_date: new Date(`${expiryDate}T23:59:59Z`).toISOString(),
      is_active: isActive,
      product_ids: selectedProductIds
    };

    try {
      if (editingOffer) {
        await api.admin.updateOffer(editingOffer.id, payload);
      } else {
        await api.admin.createOffer(payload);
      }
      setModalOpen(false);
      fetchOffers();
    } catch (err: any) {
      setError(err.message || 'Failed to save offer');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this promotional offer?')) return;
    try {
      await api.admin.deleteOffer(id);
      fetchOffers();
    } catch (err: any) {
      alert(`Error deleting offer: ${err.message}`);
    }
  };

  const toggleProductSelection = (prodId: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Create */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#EAE6E1]">
        <div>
          <h1 className="font-serif text-3xl text-boutique-charcoal font-medium">
            Promotional Offers & Festive Sales
          </h1>
          <p className="text-xs text-[#8C827A] mt-1">
            Schedule seasonal discounts, promo codes, and automated expiry windows
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-luxury font-semibold flex items-center gap-2 shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Offer</span>
        </button>
      </div>

      {/* Offers Table */}
      <div className="bg-white border border-[#EAE6E1] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#8C827A] animate-pulse">
            Loading offers...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#EAE6E1] text-[#8C827A] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Offer Campaign</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Promo Code</th>
                  <th className="py-3 px-4">Active Timeline</th>
                  <th className="py-3 px-4">Linked Items</th>
                  <th className="py-3 px-4 text-center">Live Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1]">
                {offers.map((offer) => {
                  const now = new Date();
                  const start = new Date(offer.start_date);
                  const expiry = new Date(offer.expiry_date);
                  const isScheduled = now < start;
                  const isExpired = now > expiry;
                  const isLive = offer.is_active && !isScheduled && !isExpired;

                  return (
                    <tr key={offer.id} className="hover:bg-[#FAF7F2]/60">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-boutique-charcoal text-sm">
                          {offer.title}
                        </div>
                        <div className="text-[11px] text-[#8C827A] line-clamp-1">
                          {offer.description || 'Seasonal promotion'}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-[#B86B5A]">
                        {offer.discount_percentage}% OFF
                      </td>

                      <td className="py-3 px-4">
                        {offer.promo_code ? (
                          <span className="px-2 py-0.5 bg-[#FAF7F2] border border-[#D5C4B0] font-mono font-bold text-black">
                            {offer.promo_code}
                          </span>
                        ) : (
                          <span className="text-[#8C827A]">Auto-applied</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs text-[#6B6B6B]">
                        <div>{start.toLocaleDateString()} to {expiry.toLocaleDateString()}</div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-boutique-charcoal">
                        {offer.product_count || 0} products
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            isLive
                              ? 'bg-emerald-100 text-emerald-800'
                              : isScheduled
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {isLive ? 'Active Live' : isScheduled ? 'Scheduled' : 'Expired'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(offer)}
                            className="p-1.5 text-[#8C827A] hover:text-[#B86B5A]"
                            title="Edit Offer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(offer.id)}
                            className="p-1.5 text-red-400 hover:text-red-600"
                            title="Delete Offer"
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
        )}
      </div>

      {/* Offer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full p-6 sm:p-8 border border-[#EAE6E1] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-2xl text-boutique-charcoal font-medium pb-2 border-b border-[#EAE6E1]">
              {editingOffer ? `Edit Offer: ${editingOffer.title}` : 'Create Promotional Campaign'}
            </h2>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Festive Glamour Sale"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Terms, eligible clothing types, in-store trial notes..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                    Discount Percentage (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EAE6E1]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                    Promo Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FESTIVE25"
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EAE6E1] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. 20% OFF, LIMITED TIME"
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EAE6E1]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                    Banner URL
                  </label>
                  <input
                    type="text"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EAE6E1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EAE6E1]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EAE6E1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-2">
                  Apply to Specific Products:
                </label>
                <div className="max-h-36 overflow-y-auto border border-[#EAE6E1] p-2 space-y-1 bg-[#FAF7F2]">
                  {products.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer p-1 hover:bg-white">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(p.id)}
                        onChange={() => toggleProductSelection(p.id)}
                      />
                      <span className="truncate">{p.name} ({p.sku})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="offerActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="offerActive" className="text-xs font-semibold text-boutique-charcoal cursor-pointer">
                  Campaign is Active
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#EAE6E1]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 text-xs uppercase tracking-wider border border-[#D5C4B0] text-boutique-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs uppercase tracking-luxury bg-[#1A1A1A] hover:bg-black text-white font-semibold"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

