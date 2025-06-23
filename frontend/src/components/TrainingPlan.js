import { format, parseISO } from 'date-fns';
import styles from '../styles/TrainingPlan.module.css';
import { useUnit } from '../context/UnitContext';

const milesToKmFactor = 1.60934;

export default function TrainingPlan({ plan, planType = 'marathon' }) {
  const { useMiles } = useUnit();

  // Safely parse dates
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error parsing date:', error);
      return 'Invalid Date';
    }
  };

  // Get workout type for styling
  const getWorkoutType = (workout) => {
    if (!workout) return "Rest";
    if (typeof workout === 'object') {
      return workout.type || "Unknown";
    }
    return "Unknown";
  };

  // Format workout object into a readable string
  const formatWorkout = (workout) => {
    if (!workout) return 'Rest';
    
    if (typeof workout === 'object') {
      const { type, distance, units } = workout;
      if (type === 'Rest') return 'Rest';
      if (type === 'Cross') return 'Cross Training';
      if (type === 'Half Marathon') return 'Half Marathon Race';
      if (type === 'Marathon') return 'Marathon Race';
      
      // Convert distance if needed
      const displayDistance = units === 'miles' && !useMiles 
        ? Math.round(distance * milesToKmFactor * 10) / 10
        : distance;
      const displayUnits = useMiles ? 'mi' : 'km';
      
      return `${type}: ${displayDistance} ${displayUnits}`;
    }
    
    // If workout is already a string
    return String(workout);
  };

  // Ensure schedule exists and is an array
  const schedule = Array.isArray(plan?.schedule) ? plan.schedule : [];

  // Order days of the week consistently
  const orderedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Debug the structure
  console.log('Plan structure:', JSON.stringify(plan, null, 2).substring(0, 500));

  return (
    <div className={styles.container}>
      <h2>Your {planType === 'marathon' ? 'Marathon' : 'Return to Running'} Training Plan</h2>
      
      <div className={styles.dates}>
        <p>
          <span>Start Date:</span>{' '}
          {formatDate(plan.startDate)}
        </p>
        <p>
          <span>Race Date:</span>{' '}
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
                {orderedDays.map(day => {
                  const workout = week[day];
                  const workoutText = formatWorkout(workout);
                  const workoutType = getWorkoutType(workout);
                  
                  return (
                    <div 
                      key={day} 
                      className={styles.workout} 
                      data-type={workoutType}
                    >
                      <span>{day}:</span> 
                      {workoutText}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 