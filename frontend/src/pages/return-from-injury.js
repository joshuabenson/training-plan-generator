import { useState } from 'react';
import PlanForm from '../components/PlanForm';
import TrainingPlan from '../components/TrainingPlan';
import Loading from '../components/Loading';
import styles from '../styles/Home.module.css';

export default function ReturnFromInjury() {
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
      setPlan(data);
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Error generating training plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Injury Recovery Plan Preview</h1>
      
      <div className={styles.content}>
        <div className={styles.formContainer}>
          <PlanForm onSubmit={handlePlanGeneration} planType="return-from-injury" />
        </div>
        
        {isLoading ? (
          <div className={styles.planContainer}>
            <Loading />
          </div>
        ) : plan && (
          <div className={styles.planContainer}>
            <TrainingPlan plan={plan} />
          </div>
        )}
      </div>
    </div>
  );
} 