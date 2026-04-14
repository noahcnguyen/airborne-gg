import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useStores } from '@/hooks/useStores';

interface StoreContextType {
  stores: { id: string; ebay_username: string; connected_at: string; is_active: boolean }[];
  selectedStoreId: string;
  setSelectedStoreId: (id: string) => void;
  storesLoading: boolean;
}

const StoreContext = createContext<StoreContextType>({
  stores: [],
  selectedStoreId: '',
  setSelectedStoreId: () => {},
  storesLoading: true,
});

export const useStoreContext = () => useContext(StoreContext);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { data: stores = [], isLoading } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');

  // Auto-select first store only when stores load and nothing is selected
  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId]);

  return (
    <StoreContext.Provider value={{ stores, selectedStoreId, setSelectedStoreId, storesLoading: isLoading }}>
      {children}
    </StoreContext.Provider>
  );
}
