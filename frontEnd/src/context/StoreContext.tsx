import type{ createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

import type{ Store } from '../types/product_types';

interface StoreContextType {
  selectedStore: Store | null;
  setSelectedStore: (store: Store) => void;
  clearStore: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const clearStore = () => {
    setSelectedStore(null);
  };

  return (
    <StoreContext.Provider value={{ selectedStore, setSelectedStore, clearStore }}>
      {children}
    </StoreContext.Provider>
  );
};

// Custom hook to use store context
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};