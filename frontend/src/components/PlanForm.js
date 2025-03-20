import { useState } from 'react';
import styles from '../styles/PlanForm.module.css';

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

export default function PlanForm({ onSubmit }) {
  const [selectedDays, setSelectedDays] = useState([]);
  const [targetDate, setTargetDate] = useState(() => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 126); // 18 weeks * 7 days
    
    // Format as YYYY-MM-DD for the date input value
    return futureDate.toISOString().split('T')[0];
  });
  const [experienceLevel, setExperienceLevel] = useState('beginner');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('e', e);
    console.log('selectedDays', selectedDays);
    console.log('targetDate', targetDate);
    console.log('experienceLevel', experienceLevel);
    onSubmit({
      preferredDays: selectedDays,
      targetDate,
      experienceLevel,
    });
  };

  const handleDayToggle = (day) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label>Preferred Running Days</label>
        <div className={styles.checkboxGroup}>
          {DAYS_OF_WEEK.map(({ id, label }) => (
            <div key={id} className={styles.checkboxItem}>
              <input
                type="checkbox"
                id={id}
                checked={selectedDays.includes(id)}
                onChange={() => handleDayToggle(id)}
              />
              <label htmlFor={id}>{label}</label>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="targetDate">Target Marathon Date</label>
        <input
          type="date"
          id="targetDate"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          required
          className={styles.formInput}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="experienceLevel">Running Experience</label>
        <select
          id="experienceLevel"
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value)}
          className={styles.formInput}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <button type="submit" className={styles.button}>
        Generate Plan
      </button>
    </form>
  );
} 