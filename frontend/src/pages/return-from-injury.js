import { useEffect } from 'react';
import PlanForm from '../components/PlanForm';
import TrainingPlan from '../components/TrainingPlan';
import Loading from '../components/Loading';
import styles from '../styles/Home.module.css';
import { usePlan } from '../context/PlanContext';

export default function ReturnFromInjury() {
  const { injuryPlan, setInjuryPlan, isLoading, setIsLoading } = usePlan();

  // Wake up the backend when the page loads
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/`).catch(() => {
      // Ignore errors - just trying to wake up the server
    });
  }, []);

  const handlePlanGeneration = async (formData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setInjuryPlan(data);
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Error generating training plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>

      <div className={styles.content}>
        <div className={styles.formContainer}>
          <PlanForm 
            onSubmit={handlePlanGeneration} 
            planType="return-from-injury" 
            hasPlan={!!injuryPlan}
          />
        </div>
        
        {isLoading ? (
          <div className={styles.planContainer}>
            <Loading />
          </div>
        ) : injuryPlan && (
          <div className={styles.planContainer}>
            <TrainingPlan plan={injuryPlan} planType="return-from-injury" />
          </div>
        )}
      </div>
    </div>
  );
} 