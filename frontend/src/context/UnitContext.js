import { createContext, useContext, useState } from 'react';

const UnitContext = createContext();

export function UnitProvider({ children }) {
  const [useMiles, setUseMiles] = useState(true);

  return (
    <UnitContext.Provider value={{ useMiles, setUseMiles }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  const context = useContext(UnitContext);
  if (context === undefined) {
    throw new Error('useUnit must be used within a UnitProvider');
  }
  return context;
} 