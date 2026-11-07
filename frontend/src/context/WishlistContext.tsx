import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductCard } from '../types';

interface WishlistContextType {
  wishlist: ProductCard[];
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (product: ProductCard) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<ProductCard[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aura_boutique_wishlist');
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load wishlist from localStorage', e);
    }
  }, []);

  const saveToStorage = (items: ProductCard[]) => {
    setWishlist(items);
    localStorage.setItem('aura_boutique_wishlist', JSON.stringify(items));
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = (product: ProductCard) => {
    if (isInWishlist(product.id)) {
      saveToStorage(wishlist.filter((item) => item.id !== product.id));
    } else {
      saveToStorage([...wishlist, product]);
    }
  };

  const clearWishlist = () => {
    saveToStorage([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    return {
      wishlist: [],
      isInWishlist: () => false,
      toggleWishlist: () => {},
      clearWishlist: () => {}
    };
  }
  return context;
};

