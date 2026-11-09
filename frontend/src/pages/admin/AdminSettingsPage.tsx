import React, { useState, useEffect, useRef } from 'react';
import {
  Store,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  KeyRound,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  Trash2
} from 'lucide-react';
import { api } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import { StoreInfo } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const { refreshStoreInfo } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [storeData, setStoreData] = useState<StoreInfo>({
    store_name: '',
    tagline: '',
    logo_url: '',
    whatsapp_number: '',
    phone: '',
    email: '',
    address: '',
    hours: '',
    maps_embed_url: ''
  });

  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Active section tab
  const [activeTab, setActiveTab] = useState<'store' | 'security'>('store');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getSettings();
      setStoreData(data);
    } catch (err: any) {
      setSettingsError(err.message || 'Failed to load store settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setSettingsError('');

    try {
      const results = await api.admin.uploadImages([file]);
      if (results && results.length > 0) {
        setStoreData((prev) => ({ ...prev, logo_url: results[0].image_url }));
        setSettingsSuccess('Logo uploaded! Click "Save Store Settings" below to publish it.');
        setTimeout(() => setSettingsSuccess(''), 5000);
      }
    } catch (err: any) {
      setSettingsError(err.message || 'Failed to upload logo image');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');
    setSavingSettings(true);

    try {
      const updated = await api.admin.updateSettings(storeData);
      setStoreData(updated);
      await refreshStoreInfo();
      setSettingsSuccess('Store details, WhatsApp number, and address updated successfully!');
      setTimeout(() => setSettingsSuccess(''), 6000);
    } catch (err: any) {
      setSettingsError(err.message || 'Failed to update store settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    setSavingPassword(true);

    try {
      const res = await api.admin.changePassword(currentPassword, newPassword);
      setPasswordSuccess(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 6000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200" />
        <div className="h-64 bg-white border border-[#EAE6E1]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="pb-6 border-b border-[#EAE6E1]">
        <h1 className="font-serif text-3xl text-boutique-charcoal font-medium">
          Store Settings & Security
        </h1>
        <p className="text-xs text-[#8C827A] mt-1">
          Manage your physical boutique contact details, customer WhatsApp enquiry number, address, and admin credentials.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EAE6E1] space-x-8">
        <button
          onClick={() => setActiveTab('store')}
          className={`pb-3 text-xs uppercase tracking-luxury font-semibold transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'store'
              ? 'border-[#1A1A1A] text-[#1A1A1A]'
              : 'border-transparent text-[#8C827A] hover:text-[#1A1A1A]'
          }`}
        >
          <Store className="w-4 h-4 text-[#B86B5A]" />
          <span>Boutique Profile & WhatsApp</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-xs uppercase tracking-luxury font-semibold transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'security'
              ? 'border-[#1A1A1A] text-[#1A1A1A]'
              : 'border-transparent text-[#8C827A] hover:text-[#1A1A1A]'
          }`}
        >
          <KeyRound className="w-4 h-4 text-[#C5A880]" />
          <span>Change Password</span>
        </button>
      </div>

      {/* Tab 1: Store & Contact Information */}
      {activeTab === 'store' && (
        <form onSubmit={handleSettingsSubmit} className="space-y-6">
          {settingsSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{settingsSuccess}</span>
            </div>
          )}

          {settingsError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{settingsError}</span>
            </div>
          )}

          {/* Logo Management Card */}
          <div className="bg-white p-6 sm:p-8 border border-[#EAE6E1] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-[#EAE6E1]">
              <h2 className="font-serif text-lg text-boutique-charcoal font-medium">
                Store Logo & Brand Icon
              </h2>
              <span className="text-xs text-[#8C827A]">
                Displays in the Storefront Navigation Bar, Footer, and Admin Portal
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              {/* Logo Preview */}
              <div className="w-32 h-32 sm:w-36 sm:h-36 bg-[#1A1A1A] border-2 border-[#D4AF37]/50 rounded-full flex items-center justify-center p-1.5 relative group overflow-hidden flex-shrink-0 shadow-md">
                {storeData.logo_url ? (
                  <>
                    <img
                      src={storeData.logo_url}
                      alt="Store Logo Preview"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('8559d870')) {
                          target.src = '/uploads/8559d870-3228-48ce-af98-cc1677ad15e9.jpg';
                        }
                      }}
                      className="w-full h-full object-cover rounded-full"
                    />
                    <button
                      type="button"
                      onClick={() => setStoreData({ ...storeData, logo_url: '' })}
                      className="absolute inset-0 bg-black/75 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity text-xs font-semibold rounded-full"
                      title="Remove Logo"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                      <span>Remove</span>
                    </button>
                  </>
                ) : (
                  <div className="text-center p-2 text-[#8C827A]">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-[10px] block font-medium">No Logo Uploaded</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="space-y-3 flex-1 w-full">
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#D5C4B0] text-boutique-charcoal text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4 text-[#B86B5A]" />
                    <span>{uploadingLogo ? 'Uploading Logo...' : 'Upload Logo from Device'}</span>
                  </button>
                  <p className="text-[11px] text-[#8C827A] mt-1.5">
                    Recommended: PNG, JPG, or SVG with a transparent background.
                  </p>
                </div>

                <div className="pt-2">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1">
                    Or Enter Direct Image URL:
                  </label>
                  <input
                    type="text"
                    value={storeData.logo_url || ''}
                    onChange={(e) => setStoreData({ ...storeData, logo_url: e.target.value })}
                    placeholder="/uploads/my-logo.png or https://example.com/logo.png"
                    className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 border border-[#EAE6E1] shadow-sm space-y-6">
            <h2 className="font-serif text-lg text-boutique-charcoal font-medium pb-3 border-b border-[#EAE6E1]">
              1. Brand & Communication
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
                  Store Brand Name *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={storeData.store_name}
                    onChange={(e) => setStoreData({ ...storeData, store_name: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-[#1A1A1A]"
                    placeholder="e.g. Jershiha Fashion"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={storeData.tagline || ''}
                  onChange={(e) => setStoreData({ ...storeData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-[#1A1A1A]"
                  placeholder="e.g. Curated Women's Fashion & Ethnic Couture"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5 flex items-center justify-between">
                  <span>Customer WhatsApp Number *</span>
                  <span className="text-[10px] text-emerald-700 normal-case font-normal">Active for all enquiries</span>
                </label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={storeData.whatsapp_number}
                    onChange={(e) => setStoreData({ ...storeData, whatsapp_number: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] font-mono focus:outline-none focus:border-[#1A1A1A]"
                    placeholder="e.g. 918925184903 (with country code)"
                  />
                </div>
                <p className="text-[11px] text-[#8C827A] mt-1">
                  All "Enquire on WhatsApp" clicks will open chats with this number.
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
                  Display Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={storeData.phone}
                    onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-[#1A1A1A]"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
                  Store Contact Email
                </label>
                <div className="relative sm:w-1/2">
                  <Mail className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={storeData.email}
                    onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-[#1A1A1A]"
                    placeholder="care@jershihafashion.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 border border-[#EAE6E1] shadow-sm space-y-6">
            <h2 className="font-serif text-lg text-boutique-charcoal font-medium pb-3 border-b border-[#EAE6E1]">
              2. Physical Store Location & Hours
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
                  Physical Store Address *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#B86B5A] absolute left-3.5 top-3" />
                  <textarea
                    rows={3}
                    required
                    value={storeData.address}
                    onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-[#1A1A1A]"
                    placeholder="Plot 42, Galleria High Street, Indiranagar, Bangalore - 560038"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
                    Operating Hours
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={storeData.hours || ''}
                      onChange={(e) => setStoreData({ ...storeData, hours: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-[#1A1A1A]"
                      placeholder="Mon - Sun: 10:00 AM - 9:00 PM"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
                    Google Maps Embed URL
                  </label>
                  <input
                    type="text"
                    value={storeData.maps_embed_url || ''}
                    onChange={(e) => setStoreData({ ...storeData, maps_embed_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-[#1A1A1A]"
                    placeholder="https://maps.app.goo.gl/... or Google Maps embed URL"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-8 py-3.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-luxury font-semibold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingSettings ? 'Saving Changes...' : 'Save Store Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Security & Password Change */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
          {passwordSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="bg-white p-6 sm:p-8 border border-[#EAE6E1] shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EAE6E1]">
              <ShieldCheck className="w-5 h-5 text-[#C5A880]" />
              <h2 className="font-serif text-lg text-boutique-charcoal font-medium">
                Admin Password Authentication
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-[#1A1A1A] pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-[#1A1A1A] pr-10"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-[#1A1A1A]"
                  placeholder="Repeat new password"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-8 py-3.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-luxury font-semibold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

