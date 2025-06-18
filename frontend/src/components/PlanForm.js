import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/PlanForm.module.css';
import { useUnit } from '../context/UnitContext';
import { useAuth } from '../context/AuthContext';
import { preferencesAPI } from '../services/api';
import ColdStartLoading from './ColdStartLoading';

// Constants
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
const MILES_TO_KM_FACTOR = 1.60934;
const DEFAULT_TRAINING_WEEKS = 18;

const BUTTON_STATES = {
  INITIAL: 'initial',
  PLAN_GENERATED: 'plan-generated',
  FORM_CHANGED: 'form-changed'
};

const DEFAULT_FORM_VALUES = {
  selectedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  weeklyMileage: 20,
  experienceLevel: 'beginner'
};

// Utility functions
const getDefaultTargetDate = () => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + (DEFAULT_TRAINING_WEEKS * 7));
  return futureDate.toISOString().split('T')[0];
};

const getMinTrainingDays = (planType) => planType === 'marathon' ? 2 : 1;

// Custom hook for button state management
const useButtonState = () => {
  const [buttonState, setButtonState] = useState(BUTTON_STATES.INITIAL);
  
  const markFormChanged = useCallback(() => {
    if (buttonState === BUTTON_STATES.PLAN_GENERATED) {
      setButtonState(BUTTON_STATES.FORM_CHANGED);
    }
  }, [buttonState]);

  const markPlanGenerated = useCallback(() => {
    setButtonState(BUTTON_STATES.PLAN_GENERATED);
  }, []);

  return { buttonState, markFormChanged, markPlanGenerated };
};

// Custom hook for form state management
const useFormState = (markFormChanged) => {
  const [selectedDays, setSelectedDays] = useState(DEFAULT_FORM_VALUES.selectedDays);
  const [weeklyMileage, setWeeklyMileage] = useState(DEFAULT_FORM_VALUES.weeklyMileage);
  const [targetDate, setTargetDate] = useState(getDefaultTargetDate);
  const [experienceLevel, setExperienceLevel] = useState(DEFAULT_FORM_VALUES.experienceLevel);

  const handleTargetDateChange = useCallback((e) => {
    setTargetDate(e.target.value);
    markFormChanged();
  }, [markFormChanged]);

  const handleExperienceLevelChange = useCallback((e) => {
    setExperienceLevel(e.target.value);
    markFormChanged();
  }, [markFormChanged]);

  const handleWeeklyMileageChange = useCallback((e) => {
    setWeeklyMileage(Number(e.target.value));
    markFormChanged();
  }, [markFormChanged]);

  const handleDayToggle = useCallback((day) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
    markFormChanged();
  }, [markFormChanged]);

  const updateFormFromPreferences = useCallback((preferences) => {
    if (preferences) {
      setSelectedDays(preferences.preferredDays || DEFAULT_FORM_VALUES.selectedDays);
      setExperienceLevel(preferences.experienceLevel || DEFAULT_FORM_VALUES.experienceLevel);
      setWeeklyMileage(preferences.weeklyMileage || DEFAULT_FORM_VALUES.weeklyMileage);
    }
  }, []);

  return {
    selectedDays,
    weeklyMileage,
    targetDate,
    experienceLevel,
    handleTargetDateChange,
    handleExperienceLevelChange,
    handleWeeklyMileageChange,
    handleDayToggle,
    updateFormFromPreferences
  };
};

// Custom hook for preferences management
const usePreferences = (user, updateFormFromPreferences, setUseMiles) => {
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isColdStartLoading, setIsColdStartLoading] = useState(false);

  const loadUserPreferences = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingPreferences(true);
    setIsColdStartLoading(false);
    
    try {
      const { preferences } = await preferencesAPI.getPreferences(
        user.uid,
        () => setIsColdStartLoading(true) // Cold start callback
      );
      
      if (preferences) {
        updateFormFromPreferences(preferences);
        setUseMiles(preferences.distanceUnit === 'mi');
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoadingPreferences(false);
      setIsColdStartLoading(false);
    }
  }, [user, updateFormFromPreferences, setUseMiles]);

  const saveUserPreferences = useCallback(async (preferences) => {
    if (!user) return;
    
    setIsSavingPreferences(true);
    try {
      await preferencesAPI.savePreferences(user.uid, preferences);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSavingPreferences(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserPreferences();
  }, [loadUserPreferences]);

  return { isLoadingPreferences, isSavingPreferences, isColdStartLoading, saveUserPreferences };
};

// Main component
export default function PlanForm({ onSubmit, planType = 'marathon' }) {
  const { useMiles, setUseMiles } = useUnit();
  const { user } = useAuth();
  
  const { buttonState, markFormChanged, markPlanGenerated } = useButtonState();
  
  const {
    selectedDays,
    weeklyMileage,
    targetDate,
    experienceLevel,
    handleTargetDateChange,
    handleExperienceLevelChange,
    handleWeeklyMileageChange,
    handleDayToggle,
    updateFormFromPreferences
  } = useFormState(markFormChanged);

  const { isLoadingPreferences, isSavingPreferences, isColdStartLoading, saveUserPreferences } = usePreferences(
    user, 
    updateFormFromPreferences, 
    setUseMiles
  );

  const handleUnitChange = useCallback((useMilesValue) => {
    setUseMiles(useMilesValue);
    markFormChanged();
  }, [setUseMiles, markFormChanged]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = {
      preferredDays: selectedDays,
      targetDate,
      experienceLevel,
      planType,
      weeklyMileage,
      distanceUnit: useMiles ? 'mi' : 'km',
    };

    // Generate the plan first
    onSubmit(formData);
    markPlanGenerated();

    // Save preferences if user is logged in
    if (user) {
      await saveUserPreferences({
        preferredDays: selectedDays,
        experienceLevel,
        weeklyMileage,
        distanceUnit: useMiles ? 'mi' : 'km'
      });
    }
  };

  // Button logic
  const minTrainingDays = getMinTrainingDays(planType);
  const hasMinimumDays = selectedDays.length >= minTrainingDays;

  const getButtonText = () => {
    if (isLoadingPreferences) return 'Loading...';
    if (isSavingPreferences) return 'Saving Preferences & Updating Plan...';
    
    switch (buttonState) {
      case BUTTON_STATES.INITIAL:
        return planType === 'marathon' ? 'Generate Your Marathon Plan' : 'Generate Your Return to Running Plan';
      case BUTTON_STATES.FORM_CHANGED:
        return 'Save Preferences and Update Plan';
      case BUTTON_STATES.PLAN_GENERATED:
      default:
        return 'Save Preferences and Update Plan';
    }
  };

  const isButtonDisabled = () => {
    return !hasMinimumDays || 
           isLoadingPreferences || 
           isSavingPreferences || 
           (buttonState === BUTTON_STATES.PLAN_GENERATED);
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Preferred Running Days */}
        <div className={styles.formGroup}>
          <label>
            Preferred Running Days
            <span className={`${styles.helperText} ${hasMinimumDays ? styles.helperTextHidden : ''}`}>
              select at least {minTrainingDays} {minTrainingDays === 1 ? 'day' : 'days'}
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
                  disabled={isColdStartLoading}
                />
                <label htmlFor={id}>{label}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Target Date */}
        <div className={styles.formGroup}>
          <label htmlFor="targetDate">
            {planType === 'marathon' ? 'Target Marathon Date' : 'Full Strength Target Date'}
          </label>
          <input
            type="date"
            id="targetDate"
            value={targetDate}
            onChange={handleTargetDateChange}
            required
            className={styles.formInput}
            disabled={isColdStartLoading}
          />
        </div>

        {/* Distance Units */}
        <div className={styles.formGroup}>
          <label>Distance Units</label>
          <div className={`${styles.formInput} ${styles.distanceUnitInput}`}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="distanceUnit"
                value="mi"
                checked={useMiles}
                onChange={() => handleUnitChange(true)}
                disabled={isColdStartLoading}
              />
              mi
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="distanceUnit"
                value="km"
                checked={!useMiles}
                onChange={() => handleUnitChange(false)}
                disabled={isColdStartLoading}
              />
              km
            </label>
          </div>
        </div>

        {/* Weekly Mileage (Return from Injury only) */}
        {planType === 'return-from-injury' && (
          <div className={styles.formGroup}>
            <label htmlFor="weeklyMileage">Previous Weekly Mileage</label>
            <div className={styles.mileageContainer}>
              <select
                id="weeklyMileage"
                value={weeklyMileage}
                onChange={handleWeeklyMileageChange}
                className={styles.mileageSelect}
                disabled={isColdStartLoading}
              >
                {WEEKLY_MILEAGE_OPTIONS.map(miles => (
                  <option key={miles} value={miles}>
                    {useMiles ? miles : Math.round(miles * MILES_TO_KM_FACTOR)} {useMiles ? 'mi' : 'km'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Experience Level (Marathon only) */}
        {planType === 'marathon' && (
          <div className={styles.formGroup}>
            <label htmlFor="experienceLevel">Running Experience</label>
            <select
              id="experienceLevel"
              value={experienceLevel}
              onChange={handleExperienceLevelChange}
              className={styles.formInput}
              disabled={isColdStartLoading}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          className={`${styles.button} ${isButtonDisabled() || isColdStartLoading ? styles.buttonDisabled : ''}`}
          disabled={isButtonDisabled() || isColdStartLoading}
        >
          {getButtonText()}
        </button>
      </form>
      
      <ColdStartLoading isVisible={isColdStartLoading} />
    </div>
  );
} 