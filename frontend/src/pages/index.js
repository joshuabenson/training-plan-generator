import { useState } from 'react';
import PlanForm from '../components/PlanForm';
import TrainingPlan from '../components/TrainingPlan';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [plan, setPlan] = useState(null);

  const handlePlanGeneration = async (formData) => {
    try {
      const response = await fetch('http://localhost:3001/generate-plan', {
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
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Marathon Training Plan Generator</h1>
      
      <div className={styles.content}>
        <div className={styles.formContainer}>
          <PlanForm onSubmit={handlePlanGeneration} />
        </div>
        
        {plan && (
          <div className={styles.planContainer}>
            <TrainingPlan plan={plan} />
          </div>
        )}
      </div>
    </div>
  );
} 