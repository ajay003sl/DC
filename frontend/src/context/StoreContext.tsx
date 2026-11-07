import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, StoreInfo } from '../types';
import { api } from '../services/api';

interface StoreContextType {
  categories: Category[];
  storeInfo: StoreInfo | null;
  refreshCategories: () => Promise<void>;
  refreshStoreInfo: () => Promise<void>;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [cats, info] = await Promise.all([
        api.public.getCategories(),
        api.public.getStoreInfo()
      ]);
      setCategories(cats);
      setStoreInfo(info);
    } catch (err) {
      console.error('Failed to load store categories or info', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        categories,
        storeInfo,
        refreshCategories: fetchInitialData,
        refreshStoreInfo: fetchInitialData,
        isLoading
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

