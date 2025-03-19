import { format } from 'date-fns';
import styles from '../styles/TrainingPlan.module.css';

export default function TrainingPlan({ plan }) {
  return (
    <div className={styles.container}>
      <h2>Your Training Plan</h2>
      
      <div className={styles.dates}>
        <p>
          <span>Start Date:</span>{' '}
          {format(new Date(plan.startDate), 'MMMM d, yyyy')}
        </p>
        <p>
          <span>Target Date:</span>{' '}
          {format(new Date(plan.targetDate), 'MMMM d, yyyy')}
        </p>
      </div>

      <div className={styles.schedule}>
        <h3>Weekly Schedule</h3>
        <div className={styles.weeks}>
          {plan.schedule.map((week, weekIndex) => (
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