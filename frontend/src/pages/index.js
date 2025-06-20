import { useEffect } from 'react';
import PlanForm from '../components/PlanForm';
import TrainingPlan from '../components/TrainingPlan';
import Loading from '../components/Loading';
import styles from '../styles/Home.module.css';
import { usePlan } from '../context/PlanContext';

export default function Home() {
  const { marathonPlan, setMarathonPlan, isLoading, setIsLoading } = usePlan();

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
      setMarathonPlan(data);
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Error generating training plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Rerunnr Training Plan Preview</h1>
      
      <div className={styles.content}>
        <div className={styles.formContainer}>
          <PlanForm 
            onSubmit={handlePlanGeneration} 
            planType="marathon" 
            hasPlan={!!marathonPlan}
          />
        </div>
        
        {isLoading ? (
          <div className={styles.planContainer}>
            <Loading />
          </div>
        ) : marathonPlan && (
          <div className={styles.planContainer}>
            <TrainingPlan plan={marathonPlan} />
          </div>
        )}
      </div>
    </div>
  );
} 