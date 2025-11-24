import React, { createContext, useContext, useState, useEffect } from 'react';
import type{ ReactNode } from 'react';
import type{ Store } from '../types/product_types';

interface StoreContextType {
  selectedStore: Store | null;
  setSelectedStore: (store: Store) => void;
  clearStore: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedStore, setSelectedStoreState] = useState<Store | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedStore = localStorage.getItem('selectedStore');
    if (savedStore) {
      setSelectedStoreState(JSON.parse(savedStore));
    }
  }, []);

  const setSelectedStore = (store: Store) => {
    setSelectedStoreState(store);
    localStorage.setItem('selectedStore', JSON.stringify(store));
  };

  const clearStore = () => {
    setSelectedStoreState(null);
    localStorage.removeItem('selectedStore');
  };

  const value: StoreContextType = {
    selectedStore,
    setSelectedStore,
    clearStore,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};