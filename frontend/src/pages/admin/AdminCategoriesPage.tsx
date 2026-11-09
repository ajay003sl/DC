import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, FolderTree, Check, X, AlertCircle, AlertTriangle, ArrowRight, ExternalLink, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Category } from '../../types';
import { api } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import { useAdminNotification } from '../../context/AdminNotificationContext';

export const AdminCategoriesPage: React.FC = () => {
  const { refreshCategories: refreshStorefrontCategories } = useStore();
  const { showSuccess, showError } = useAdminNotification();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State (Slug & Description removed per store owner request)
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Proper Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleteOption, setDeleteOption] = useState<'reassign' | 'cascade'>('reassign');
  const [reassignTargetId, setReassignTargetId] = useState<number | ''>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const results = await api.admin.uploadImages([file]);
      if (results && results.length > 0) {
        setImageUrl(results[0].image_url);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload category image from local file');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setImageUrl('');
    setDisplayOrder(categories.length + 1);
    setIsActive(true);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setImageUrl(cat.image_url || '');
    setDisplayOrder(cat.display_order);
    setIsActive(cat.is_active);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name: name.trim(),
      image_url: imageUrl.trim() || undefined,
      display_order: Number(displayOrder),
      is_active: isActive
    };

    try {
      if (editingCategory) {
        await api.admin.updateCategory(editingCategory.id, payload);
        showSuccess('Category Updated Successfully!', `Category "${payload.name}" has been updated.`);
      } else {
        await api.admin.createCategory(payload);
        showSuccess('Category Created Successfully!', `Category "${payload.name}" has been created.`);
      }
      setModalOpen(false);
      await fetchCategories();
      await refreshStorefrontCategories();
    } catch (err: any) {
      const errMsg = err.message || 'Failed to save category';
      setError(errMsg);
      showError('Failed to Save Category', errMsg);
    }
  };

  // Open Proper Delete Modal
  const openDeleteModal = (cat: Category) => {
    setDeletingCategory(cat);
    setDeleteError(null);
    // Find first other available category for reassign target
    const otherCategories = categories.filter((c) => c.id !== cat.id);
    setReassignTargetId(otherCategories.length > 0 ? otherCategories[0].id : '');
    setDeleteOption(otherCategories.length > 0 ? 'reassign' : 'cascade');
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    const catName = deletingCategory.name;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const hasProducts = (deletingCategory.product_count || 0) > 0;
      await api.admin.deleteCategory(deletingCategory.id, {
        reassignToId: hasProducts && deleteOption === 'reassign' && reassignTargetId !== '' ? Number(reassignTargetId) : undefined,
        force: hasProducts && deleteOption === 'cascade' ? true : undefined
      });

      setDeleteModalOpen(false);
      setDeletingCategory(null);
      await fetchCategories();
      await refreshStorefrontCategories();
      showSuccess('Category Deleted Successfully!', `Category "${catName}" was permanently removed.`);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to delete category';
      setDeleteError(errMsg);
      showError('Failed to Delete Category', errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#EAE6E1]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-boutique-charcoal font-medium">
            Category Management
          </h1>
          <p className="text-xs text-[#8C827A] mt-1">
            Configure dynamic department sections for your public storefront
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto justify-center px-4 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-luxury font-semibold flex items-center gap-2 shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Categories Container */}
      <div className="bg-white border border-[#EAE6E1] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#8C827A] animate-pulse">
            Loading categories...
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: Responsive Category Cards */}
            <div className="block md:hidden divide-y divide-[#EAE6E1]">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 space-y-3 hover:bg-[#FAF7F2]/40 transition-colors">
                  {/* Top: Image + Info */}
                  <div className="flex gap-3.5 items-start">
                    <img
                      src={cat.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80'}
                      alt={cat.name}
                      className="w-16 h-14 object-cover border border-[#EAE6E1] bg-[#F5F2EB] shadow-2xs flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-base font-semibold text-boutique-charcoal">
                          {cat.name}
                        </h3>
                        <span className="text-[10px] text-[#8C827A] font-semibold bg-[#FAF7F2] px-1.5 py-0.5 border border-[#EAE6E1]">
                          #{cat.display_order}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-[#8C827A] mt-0.5 truncate">
                        /category/{cat.slug}
                      </div>

                      {cat.description && (
                        <p className="text-[11px] text-[#8C827A] line-clamp-1 mt-1">
                          {cat.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-[#F0ECE1]">
                        <span className="text-xs font-semibold text-boutique-charcoal">
                          {cat.product_count || 0} dresses
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F5F2EB]">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border ${
                        cat.is_active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      {cat.is_active ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-gray-500" />}
                      <span>{cat.is_active ? 'Visible on Store' : 'Hidden'}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <a
                        href={`/category/${cat.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View on Storefront"
                        className="p-2 text-[#8C827A] hover:text-black hover:bg-[#FAF7F2] rounded transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => openEditModal(cat)}
                        title="Edit Category"
                        className="p-2 text-[#8C827A] hover:text-[#B86B5A] hover:bg-[#FAF7F2] rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(cat)}
                        title="Delete Category"
                        className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: Data Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#EAE6E1] text-[#8C827A] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Banner Preview</th>
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Slug (URL)</th>
                    <th className="py-3 px-4">Active Products</th>
                    <th className="py-3 px-4 text-center">Display Order</th>
                    <th className="py-3 px-4 text-center">Store Visibility</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0ECE1]">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#FAF7F2]/60">
                      <td className="py-3 px-4">
                        <img
                          src={cat.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80'}
                          alt={cat.name}
                          className="w-12 h-10 object-cover border border-[#EAE6E1] bg-[#F5F2EB]"
                        />
                      </td>
                      <td className="py-3 px-4 font-semibold text-boutique-charcoal">
                        {cat.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#8C827A]">
                        /category/{cat.slug}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-[#FAF7F2] border border-[#EAE6E1] font-semibold text-boutique-charcoal">
                          {cat.product_count || 0} items
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        {cat.display_order}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            cat.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {cat.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>{cat.is_active ? 'Visible' : 'Hidden'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/category/${cat.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-[#8C827A] hover:text-black transition-colors"
                            title="View on Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 text-[#8C827A] hover:text-[#B86B5A] transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(cat)}
                            className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Proper Delete Category Modal */}
      {deleteModalOpen && deletingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8 border border-red-200 shadow-2xl space-y-4 sm:space-y-5">
            {/* Modal Header */}
            <div className="flex items-start gap-3 pb-3 border-b border-[#EAE6E1]">
              <div className="p-2.5 bg-red-100 text-red-600 rounded-full flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-xl font-medium text-boutique-charcoal">
                  Delete Category: <span className="font-bold text-red-700">{deletingCategory.name}</span>
                </h3>
                <p className="text-xs text-[#8C827A] mt-0.5">
                  Are you sure you want to remove this department from your physical boutique catalog?
                </p>
              </div>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="text-[#8C827A] hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error in modal if any */}
            {deleteError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Category Info Box */}
            <div className="flex items-center gap-3.5 p-3.5 bg-[#FAF7F2] border border-[#EAE6E1]">
              <img
                src={deletingCategory.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80'}
                alt={deletingCategory.name}
                className="w-12 h-12 object-cover border border-[#EAE6E1]"
              />
              <div className="min-w-0 flex-1 text-xs">
                <p className="font-semibold text-boutique-charcoal truncate">{deletingCategory.name}</p>
                <p className="text-[#8C827A] font-mono text-[11px]">/category/{deletingCategory.slug}</p>
                <p className="text-[#B86B5A] font-medium mt-0.5">
                  {(deletingCategory.product_count || 0)} dresses assigned
                </p>
              </div>
            </div>

            {/* If Category Has Products: Offer Safe Options */}
            {(deletingCategory.product_count || 0) > 0 ? (
              <div className="space-y-3 pt-1">
                <p className="text-xs font-semibold text-boutique-charcoal">
                  This category contains {(deletingCategory.product_count || 0)} products. Choose what happens to them:
                </p>

                {/* Option 1: Reassign */}
                <label className={`block p-3.5 border cursor-pointer transition-colors ${
                  deleteOption === 'reassign' ? 'border-[#1A1A1A] bg-stone-50' : 'border-[#EAE6E1] hover:bg-stone-50/50'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="deleteOption"
                      value="reassign"
                      checked={deleteOption === 'reassign'}
                      onChange={() => setDeleteOption('reassign')}
                      className="mt-1 text-[#1A1A1A]"
                    />
                    <div className="flex-1 text-xs">
                      <span className="font-semibold text-boutique-charcoal block">
                        Move products to another category (Safe & Recommended)
                      </span>
                      <p className="text-[#8C827A] mt-0.5">
                        Keep the products active and reassign them to another department:
                      </p>
                      
                      {deleteOption === 'reassign' && (
                        <div className="mt-2.5">
                          <select
                            value={reassignTargetId}
                            onChange={(e) => setReassignTargetId(Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs bg-white border border-[#D5C4B0] font-medium"
                          >
                            {categories
                              .filter((c) => c.id !== deletingCategory.id)
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  Transfer to: {c.name} ({c.product_count || 0} existing items)
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </label>

                {/* Option 2: Delete All Products */}
                <label className={`block p-3.5 border cursor-pointer transition-colors ${
                  deleteOption === 'cascade' ? 'border-red-600 bg-red-50/50' : 'border-[#EAE6E1] hover:bg-red-50/20'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="deleteOption"
                      value="cascade"
                      checked={deleteOption === 'cascade'}
                      onChange={() => setDeleteOption('cascade')}
                      className="mt-1 text-red-600"
                    />
                    <div className="flex-1 text-xs">
                      <span className="font-semibold text-red-700 block">
                        Delete this category AND all its {(deletingCategory.product_count || 0)} products
                      </span>
                      <p className="text-[#8C827A] mt-0.5">
                        Warning: All dresses inside this category will be permanently deleted from the database.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              <p className="text-xs text-[#6B6B6B]">
                This category has no assigned products. It will be permanently removed from your navigation and storefront.
              </p>
            )}

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-[#EAE6E1]">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-xs uppercase tracking-wider border border-[#D5C4B0] hover:bg-[#FAF7F2] text-boutique-charcoal font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-xs uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 shadow transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8 border border-[#EAE6E1] shadow-2xl space-y-4">
            <h2 className="font-serif text-2xl text-boutique-charcoal font-medium pb-2 border-b border-[#EAE6E1]">
              {editingCategory ? `Edit: ${editingCategory.name}` : 'Create New Category'}
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Festive Wear, Casual Dresses, Evening Wear"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-boutique-charcoal"
                />
              </div>

              {/* Local File Upload for Category Image */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-1.5">
                  Category Image
                </label>

                {/* Hidden Local File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="p-3 bg-[#FAF7F2] border border-[#EAE6E1] rounded-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={imageUrl}
                        alt="Category preview"
                        className="w-20 h-16 object-cover border border-[#D5C4B0] bg-white shadow-xs rounded-sm flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-boutique-charcoal truncate">Image Uploaded</p>
                        <p className="text-[10px] text-[#8C827A] truncate mt-0.5">{imageUrl}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="px-2.5 py-1 text-[11px] bg-white border border-[#D5C4B0] hover:bg-[#F5F2EB] text-boutique-charcoal font-medium rounded-xs transition-colors flex items-center gap-1.5"
                          >
                            <Upload className="w-3 h-3 text-[#B86B5A]" />
                            <span>Change Image</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="px-2 py-1 text-[11px] text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xs transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploadingImage && fileInputRef.current?.click()}
                    className={`border-2 border-dashed border-[#D5C4B0] hover:border-boutique-charcoal hover:bg-[#FAF7F2]/60 p-6 text-center cursor-pointer transition-all rounded-sm ${
                      uploadingImage ? 'opacity-60 pointer-events-none' : ''
                    }`}
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#B86B5A]" />
                        <span className="text-xs text-boutique-charcoal font-medium">Uploading image from your device...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#EAE6E1] flex items-center justify-center text-[#B86B5A]">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-boutique-charcoal">
                            Click to upload image from your computer / phone
                          </p>
                          <p className="text-[11px] text-[#8C827A] mt-0.5">
                            Supports PNG, JPG, JPEG, WEBP
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-boutique-charcoal mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EAE6E1]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-[#D5C4B0] text-[#1A1A1A]"
                    />
                    <span className="font-semibold text-boutique-charcoal">Publicly Visible</span>
                  </label>
                </div>
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
