import { createContext, useContext, useState } from 'react';

const PlanContext = createContext();

export function PlanProvider({ children }) {
  const [marathonPlan, setMarathonPlan] = useState(null);
  const [injuryPlan, setInjuryPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <PlanContext.Provider value={{ 
      marathonPlan, 
      setMarathonPlan,
      injuryPlan,
      setInjuryPlan,
      isLoading,
      setIsLoading
    }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
} 