import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'jershiha_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load shopping cart from localStorage', e);
    }
  }, []);

  const saveToStorage = (updatedItems: CartItem[]) => {
    setItems(updatedItems);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
    } catch (e) {
      console.error('Failed to save shopping cart to localStorage', e);
    }
  };

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const itemId = `${item.productId}-${item.size}-${item.colour}`;
    const existingIndex = items.findIndex((i) => i.id === itemId);

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      const current = updated[existingIndex];
      const newQty = current.quantity + (item.quantity || 1);
      // Respect max stock if defined
      const finalQty = current.maxStock ? Math.min(newQty, current.maxStock) : newQty;
      updated[existingIndex] = { ...current, quantity: finalQty };
    } else {
      updated = [
        ...items,
        {
          ...item,
          id: itemId,
          quantity: item.quantity || 1
        }
      ];
    }

    saveToStorage(updated);
    setIsCartOpen(true); // Automatically open cart drawer to confirm addition
  };

  const removeItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    saveToStorage(updated);
  };

  const updateQuantity = (id: string, delta: number) => {
    const updated = items
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (item.maxStock && newQty > item.maxStock) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    saveToStorage(updated);
  };

  const setQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    const updated = items.map((item) => {
      if (item.id === id) {
        const finalQty = item.maxStock ? Math.min(quantity, item.maxStock) : quantity;
        return { ...item, quantity: finalQty };
      }
      return item;
    });
    saveToStorage(updated);
  };

  const clearCart = () => {
    saveToStorage([]);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        setQuantity,
        clearCart,
        totalCount,
        totalPrice,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return {
      items: [],
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      setQuantity: () => {},
      clearCart: () => {},
      totalCount: 0,
      totalPrice: 0,
      isCartOpen: false,
      openCart: () => {},
      closeCart: () => {}
    };
  }
  return context;
};
