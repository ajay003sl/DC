import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Shield, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export const AdminLoginPage: React.FC = () => {
  const { storeInfo } = useStore();
  const [email, setEmail] = useState('admin@jershihafashion.com');
  const [password, setPassword] = useState('AdminPassword123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.auth.login(email.trim(), password);
      login(data.access_token, data.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link to="/" className="inline-block group mb-3">
            {storeInfo?.logo_url ? (
              <img
                src={storeInfo.logo_url}
                alt={storeInfo.store_name}
                className="w-20 h-20 object-cover rounded-full border-2 border-[#D4AF37]/60 shadow-md mx-auto mb-3"
              />
            ) : null}
            <span className="font-serif text-3xl tracking-[0.15em] font-medium text-[#1A1A1A] uppercase">
              {storeInfo?.store_name || 'JERSHIHA FASHION'}
            </span>
          </Link>
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#B86B5A] uppercase tracking-luxury font-semibold">
            <Shield className="w-4 h-4" />
            <span>Store Owner Portal</span>
          </div>
          <h2 className="mt-3 text-xl font-serif text-[#1A1A1A]">
            Administrative Dashboard Sign In
          </h2>
          <p className="mt-1 text-xs text-[#8C827A]">
            Manage products, stock variants, images & promotions
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 border border-[#EAE6E1] shadow-lg">
          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jershihafashion.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-boutique-charcoal"
                />
                <Mail className="w-4 h-4 text-[#8C827A] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1A1A] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-boutique-charcoal"
                />
                <Lock className="w-4 h-4 text-[#8C827A] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-luxury font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>

          {/* Seed demo credentials helper */}
          <div className="mt-8 pt-6 border-t border-[#F0ECE1] bg-[#FAF7F2] p-4 text-xs text-[#6B6B6B] space-y-1">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-boutique-charcoal flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Default Store Credentials:</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@jershihafashion.com');
                  setPassword('AdminPassword123!');
                }}
                className="text-[11px] text-[#B86B5A] hover:underline font-semibold"
              >
                Auto-fill
              </button>
            </div>
            <p className="font-mono text-[11px]">Email: admin@jershihafashion.com</p>
            <p className="font-mono text-[11px]">Password: AdminPassword123!</p>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs text-[#8C827A] hover:text-black uppercase tracking-wider inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

