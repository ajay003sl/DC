import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  Check,
  Star,
  Sparkles,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Category, ProductDetail, ProductImage, ProductVariant } from '../../types';
import { api } from '../../services/api';

export const AdminProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number>(2999);

  // Flags
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);

  // Images & Variants
  const [images, setImages] = useState<ProductImage[]>([
    {
      image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      is_primary: true,
      display_order: 0,
      alt_text: 'Front view'
    }
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [variants, setVariants] = useState<ProductVariant[]>([
    { size: 'Free Size', colour: 'Standard', colour_hex: '#FFFFFF', stock_quantity: 5 }
  ]);

  // Load categories and product data if editing
  useEffect(() => {
    api.admin.getCategories()
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0 && !isEditing) {
          setCategoryId(cats[0].id);
        }
      })
      .catch((e) => console.error(e));

    if (isEditing) {
      setLoading(true);
      api.admin.getProduct(Number(id))
        .then((data: ProductDetail) => {
          setName(data.name);
          setSku(data.sku);
          setCategoryId(data.category_id);
          setDescription(data.description || '');
          setOriginalPrice(data.original_price);
          setIsActive(data.is_active);
          setIsFeatured(data.is_featured);
          setIsNewArrival(data.is_new_arrival);
          if (data.images && data.images.length > 0) {
            setImages(data.images);
          }
          if (data.variants && data.variants.length > 0) {
            setVariants(data.variants);
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  // Image actions
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages([
      ...images,
      {
        image_url: newImageUrl.trim(),
        is_primary: images.length === 0,
        display_order: images.length,
        alt_text: name || 'Product image'
      }
    ]);
    setNewImageUrl('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      const filesArray = Array.from(e.target.files);
      const uploaded = await api.admin.uploadImages(filesArray);
      const newImgs = uploaded.map((u, idx) => ({
        image_url: u.image_url,
        public_id: u.public_id,
        is_primary: images.length === 0 && idx === 0,
        display_order: images.length + idx,
        alt_text: name || 'Uploaded dress image'
      }));
      setImages([...images, ...newImgs]);
    } catch (err: any) {
      alert(`Image upload failed: ${err.message}`);
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages(
      images.map((img, idx) => ({
        ...img,
        is_primary: idx === index
      }))
    );
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    if (updated.length > 0 && !updated.some((i) => i.is_primary)) {
      updated[0].is_primary = true;
    }
    setImages(updated);
  };

  // Size Constants
  const STANDARD_LETTER_SIZES = ['Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
  const NUMERIC_SIZES = ['26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48'];
  const BOUTIQUE_SIZES = ['Unstitched', 'Semi-Stitched'];
  const ALL_PRESET_SIZES = [...STANDARD_LETTER_SIZES, ...NUMERIC_SIZES, ...BOUTIQUE_SIZES];

  // Variant actions
  const handleAddVariantRow = (defaultSize: string = 'Free Size', colour: string = 'Standard') => {
    setVariants([
      ...variants,
      { size: defaultSize, colour, colour_hex: '#FFFFFF', stock_quantity: 5 }
    ]);
  };

  const handleQuickAddLetterSizes = (colour: string = 'Standard') => {
    const stdSizes = ['S', 'M', 'L', 'XL'];
    const newVars = stdSizes.map((s) => ({
      size: s,
      colour,
      colour_hex: '#FFFFFF',
      stock_quantity: 5
    }));
    setVariants([...variants, ...newVars]);
  };

  const handleQuickAddNumericSizes = (colour: string = 'Standard') => {
    const numSizes = ['30', '32', '34', '36', '38'];
    const newVars = numSizes.map((s) => ({
      size: s,
      colour,
      colour_hex: '#FFFFFF',
      stock_quantity: 5
    }));
    setVariants([...variants, ...newVars]);
  };

  const handleQuickAddFreeSize = (colour: string = 'Standard') => {
    setVariants([
      ...variants,
      { size: 'Free Size', colour, colour_hex: '#FFFFFF', stock_quantity: 10 }
    ]);
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, val: any) => {
    setVariants(
      variants.map((v, idx) => (idx === index ? { ...v, [field]: val } : v))
    );
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a product title');
      return;
    }
    if (originalPrice <= 0) {
      setError('Original price must be greater than zero');
      return;
    }
    if (images.length === 0) {
      setError('Please add at least one product image');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name: name.trim(),
      sku: sku.trim() || undefined,
      category_id: categoryId,
      description,
      original_price: Number(originalPrice),
      discounted_price: null,
      discount_percentage: 0,
      is_active: isActive,
      is_featured: isFeatured,
      is_new_arrival: isNewArrival,
      is_on_offer: false,
      offer_label: null,
      images,
      variants
    };

    try {
      if (isEditing) {
        await api.admin.updateProduct(Number(id), payload);
      } else {
        await api.admin.createProduct(payload);
      }
      navigate('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#8C827A] animate-pulse">
        Loading product details for editing...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#EAE6E1]">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 bg-white border border-[#D5C4B0] text-boutique-charcoal hover:bg-[#FAF7F2] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl text-boutique-charcoal font-medium">
              {isEditing ? `Edit: ${name}` : 'Add New Dress / Clothing Item'}
            </h1>
            <p className="text-xs text-[#8C827A] mt-0.5">
              Updates immediately reflect on your live public fashion storefront
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-luxury font-semibold flex items-center gap-2 shadow disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Product'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white p-4 sm:p-8 border border-[#EAE6E1] shadow-2xs space-y-5 sm:space-y-6">
          <h2 className="font-serif text-xl text-boutique-charcoal font-medium pb-3 border-b border-[#EAE6E1]">
            1. Core Product Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
                Product Title / Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Zari Embroidered Chanderi Kurti"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-boutique-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Leave blank to auto-generate (e.g. KRT-2601-01)"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] font-mono focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
                Description & Craftsmanship Narrative
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Fabric composition, weave type, lining details, styling suggestions..."
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing */}
        <div className="bg-white p-4 sm:p-8 border border-[#EAE6E1] shadow-2xs space-y-5 sm:space-y-6">
          <h2 className="font-serif text-xl text-boutique-charcoal font-medium pb-3 border-b border-[#EAE6E1]">
            2. Pricing
          </h2>

          <div className="max-w-xs">
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
              Price (₹) *
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              required
              value={originalPrice}
              onChange={(e) => setOriginalPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] font-semibold"
            />
          </div>

          {/* Status Checkbox Toggles */}
          <div className="pt-4 border-t border-[#F0ECE1] grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-[#D5C4B0] text-[#1A1A1A]"
              />
              <span className="font-semibold text-boutique-charcoal">Active on Storefront</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-[#D5C4B0] text-amber-600"
              />
              <span className="font-semibold text-boutique-charcoal">Featured on Home</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="rounded border-[#D5C4B0] text-purple-600"
              />
              <span className="font-semibold text-boutique-charcoal">New Arrival Badge</span>
            </label>
          </div>
        </div>

        {/* Section 3: Multi-Image Management */}
        <div className="bg-white p-4 sm:p-8 border border-[#EAE6E1] shadow-2xs space-y-5 sm:space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-[#EAE6E1]">
            <h2 className="font-serif text-xl text-boutique-charcoal font-medium">
              3. Product Photography & Gallery
            </h2>
            <span className="text-xs text-[#8C827A]">
              First image serves as product card thumbnail
            </span>
          </div>

          {/* Image Upload / URL Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Paste Image URL (https://...)"
              className="flex-1 px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-4 py-2.5 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#D5C4B0] text-xs uppercase tracking-wider font-semibold text-boutique-charcoal"
            >
              Add URL
            </button>
            <label className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-wider font-semibold cursor-pointer flex items-center justify-center gap-2">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Local Files</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Current Images Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`relative group aspect-[3/4] bg-[#FAF7F2] border-2 overflow-hidden shadow-sm ${
                  img.is_primary ? 'border-boutique-charcoal ring-2 ring-boutique-charcoal/30' : 'border-[#EAE6E1]'
                }`}
              >
                <img
                  src={img.image_url}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {img.is_primary && (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#1A1A1A] text-white text-[9px] uppercase tracking-wider font-bold">
                    Thumbnail
                  </span>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="self-end p-1 bg-red-600 text-white rounded hover:bg-red-700"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {!img.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(idx)}
                      className="w-full py-1 bg-white text-black text-[9px] uppercase font-bold tracking-wider"
                    >
                      Make Thumbnail
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Size & Colour Stock Matrix */}
        <div className="bg-white p-4 sm:p-8 border border-[#EAE6E1] shadow-2xs space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-[#EAE6E1]">
            <div>
              <h2 className="font-serif text-xl text-boutique-charcoal font-medium">
                4. Size & Colour Stock Matrix
              </h2>
              <p className="text-xs text-[#8C827A] mt-0.5">
                Track physical store quantity for each size and colour combination
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => handleQuickAddLetterSizes('Standard')}
                className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#D5C4B0] text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal hover:bg-[#F2ECE1] transition-colors"
                title="Quickly add standard letter sizes: S, M, L, XL"
              >
                + S, M, L, XL
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddNumericSizes('Standard')}
                className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#D5C4B0] text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal hover:bg-[#F2ECE1] transition-colors"
                title="Quickly add numeric sizes: 30, 32, 34, 36, 38"
              >
                + 30, 32, 34, 36, 38
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddFreeSize('Standard')}
                className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#D5C4B0] text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-boutique-charcoal hover:bg-[#F2ECE1] transition-colors"
                title="Add a Free Size dress row"
              >
                + Free Size
              </button>
              <button
                type="button"
                onClick={() => handleAddVariantRow()}
                className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-black text-white text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#8C827A] uppercase tracking-wider border-b border-[#EAE6E1]">
                <tr>
                  <th className="py-2.5 px-3">Size (Letter / Numeric)</th>
                  <th className="py-2.5 px-3">Colour Name</th>
                  <th className="py-2.5 px-3">In-Store Stock Quantity</th>
                  <th className="py-2.5 px-3 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1]">
                {variants.map((v, idx) => {
                  const isPreset = ALL_PRESET_SIZES.includes(v.size);
                  return (
                    <tr key={idx} className="hover:bg-[#FAF7F2]/50">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <select
                            value={isPreset ? v.size : 'CUSTOM'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'CUSTOM') {
                                handleVariantChange(idx, 'size', '');
                              } else {
                                handleVariantChange(idx, 'size', val);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-white border border-[#D5C4B0] text-xs font-semibold focus:outline-none focus:border-boutique-charcoal"
                          >
                            <optgroup label="Standard Letter Sizes (S, M, L...)">
                              {STANDARD_LETTER_SIZES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Numeric Sizes (30, 32, 34, 36...)">
                              {NUMERIC_SIZES.map((n) => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </optgroup>
                            <optgroup label="Boutique Fabric Fit">
                              {BOUTIQUE_SIZES.map((b) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </optgroup>
                            <option value="CUSTOM">Custom / Other Size...</option>
                          </select>

                          {(!isPreset || v.size === '') && (
                            <input
                              type="text"
                              value={v.size}
                              onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                              placeholder="Type size..."
                              className="w-24 px-2 py-1.5 bg-white border border-[#D5C4B0] text-xs font-semibold focus:outline-none focus:border-boutique-charcoal"
                              autoFocus
                            />
                          )}
                        </div>
                      </td>

                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={v.colour}
                        onChange={(e) => handleVariantChange(idx, 'colour', e.target.value)}
                        placeholder="e.g. Sage Green, Ruby Red, Black"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#D5C4B0] text-xs"
                      />
                    </td>

                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        value={v.stock_quantity}
                        onChange={(e) => handleVariantChange(idx, 'stock_quantity', Number(e.target.value))}
                        className="w-24 px-2.5 py-1.5 bg-white border border-[#D5C4B0] text-xs font-bold"
                      />
                    </td>

                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="p-1 text-red-500 hover:text-red-700"
                        title="Delete Row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 border border-[#D5C4B0] text-xs uppercase tracking-luxury font-medium text-boutique-charcoal hover:bg-white text-center"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-luxury font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save & Publish to Store'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

