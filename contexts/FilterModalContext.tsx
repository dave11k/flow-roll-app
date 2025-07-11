import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterModalContextType {
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: (isOpen: boolean) => void;
}

const FilterModalContext = createContext<FilterModalContextType | undefined>(undefined);

export function FilterModalProvider({ children }: { children: ReactNode }) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  return (
    <FilterModalContext.Provider value={{ isFilterModalOpen, setIsFilterModalOpen }}>
      {children}
    </FilterModalContext.Provider>
  );
}

export function useFilterModal() {
  const context = useContext(FilterModalContext);
  if (context === undefined) {
    throw new Error('useFilterModal must be used within a FilterModalProvider');
  }
  return context;
}