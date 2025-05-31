import { useState, useEffect } from 'react';
import styles from '../styles/PlanForm.module.css';
import { useUnit } from '../context/UnitContext';

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

const WEEKLY_MILEAGE_OPTIONS = [10, 15, 20, 25, 30, 35, 40];
const milesToKmFactor = 1.60934;

export default function PlanForm({ onSubmit, planType = 'marathon' }) {
  const { useMiles, setUseMiles } = useUnit();
  
  // Initialize state from localStorage if available, otherwise use defaults
  const [selectedDays, setSelectedDays] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferredRunningDays');
      return saved ? JSON.parse(saved) : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    }
    return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  });

  const [weeklyMileage, setWeeklyMileage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('weeklyMileage');
      return saved ? parseInt(saved) : 20;
    }
    return 20;
  });

  // Save to localStorage whenever values change
  useEffect(() => {
    localStorage.setItem('preferredRunningDays', JSON.stringify(selectedDays));
  }, [selectedDays]);

  useEffect(() => {
    localStorage.setItem('weeklyMileage', weeklyMileage.toString());
  }, [weeklyMileage]);

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
    onSubmit({
      preferredDays: selectedDays,
      targetDate,
      experienceLevel,
      planType,
      weeklyMileage,
      distanceUnit: useMiles ? 'mi' : 'km',
    });
  };

  const handleDayToggle = (day) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const MIN_TRAINING_DAYS = planType === 'marathon' ? 2 : 1;
  const hasMinimumDays = selectedDays.length >= MIN_TRAINING_DAYS;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label>Preferred Running Days
          <span className={`${styles.helperText} ${hasMinimumDays ? styles.helperTextHidden : ''}`}>
            select at least {MIN_TRAINING_DAYS} {MIN_TRAINING_DAYS === 1 ? 'day' : 'days'}
          </span>
        </label>

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
        <label htmlFor="targetDate">
          {planType === 'marathon' ? 'Target Marathon Date' : 'Full Strength Target Date'}
        </label>
        <input
          type="date"
          id="targetDate"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          required
          className={styles.formInput}
        />
      </div>

      {planType === 'return-from-injury' && (
        <div className={styles.formGroup}>
          <label htmlFor="weeklyMileage">Previous Weekly Mileage</label>
          <div className={styles.mileageContainer}>
            <select
              id="weeklyMileage"
              value={weeklyMileage}
              onChange={(e) => setWeeklyMileage(Number(e.target.value))}
              className={styles.mileageSelect}
            >
              {WEEKLY_MILEAGE_OPTIONS.map(miles => (
                <option key={miles} value={miles}>
                  {useMiles ? miles : Math.round(miles * milesToKmFactor)} {useMiles ? 'mi' : 'km'}
                </option>
              ))}
            </select>
            <div className={styles.unitToggle}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="distanceUnit"
                  value="mi"
                  checked={useMiles}
                  onChange={() => setUseMiles(true)}
                />
                mi
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="distanceUnit"
                  value="km"
                  checked={!useMiles}
                  onChange={() => setUseMiles(false)}
                />
                km
              </label>
            </div>
          </div>
        </div>
      )}

      {planType === 'marathon' && (
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
      )}

      <button 
        type="submit" 
        className={`${styles.button} ${!hasMinimumDays ? styles.buttonDisabled : ''}`}
        disabled={!hasMinimumDays}
      >
        Generate {planType === 'marathon' ? 'Marathon' : 'Return From Injury'} Plan
      </button>
    </form>
  );
} 