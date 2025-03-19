import { format, parseISO } from 'date-fns';
import styles from '../styles/TrainingPlan.module.css';

export default function TrainingPlan({ plan }) {
  // Safely parse dates
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error parsing date:', error);
      return 'Invalid Date';
    }
  };

  // Ensure schedule exists and is an array
  const schedule = Array.isArray(plan?.schedule) ? plan.schedule : [];

  return (
    <div className={styles.container}>
      <h2>Your Training Plan</h2>
      
      <div className={styles.dates}>
        <p>
          <span>Start Date:</span>{' '}
          {formatDate(plan.startDate)}
        </p>
        <p>
          <span>Target Date:</span>{' '}
          {formatDate(plan.targetDate)}
        </p>
      </div>

      <div className={styles.schedule}>
        <h3>Weekly Schedule</h3>
        <div className={styles.weeks}>
          {schedule.map((week, weekIndex) => (
            <div key={weekIndex} className={styles.week}>
              <h4>Week {weekIndex + 1}</h4>
              <div className={styles.workouts}>
                {Object.entries(week).map(([day, workout]) => (
                  <div key={day} className={styles.workout}>
                    <span>{day}:</span> {workout}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 