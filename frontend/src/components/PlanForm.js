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
const MOBILE_BREAKPOINT = 768;

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

// Custom hook for mobile detection
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
      }
    };

    // Check on mount
    checkMobile();

    // Add event listener
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);

      // Cleanup
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  return isMobile;
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
  const [raceDate, setRaceDate] = useState(getDefaultTargetDate); // Initialize with same default
  const [startDate, setStartDate] = useState(null);

  const handleTargetDateChange = useCallback((e) => {
    const selectedDate = e.target.value;
    console.log('Target date changed to:', selectedDate);
    
    // Update both target and race date
    setTargetDate(selectedDate);
    setRaceDate(selectedDate);
    
    // Calculate the nearest upcoming Monday from today
    const today = new Date();
    // Ensure we're working with the start of the day in local time
    today.setHours(0, 0, 0, 0);
    
    const day = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const daysUntilMonday = day === 0 ? 1 : 8 - day; // If Sunday, next day is Monday, otherwise calculate days until next Monday
    const nearestMonday = new Date(today);
    nearestMonday.setDate(today.getDate() + daysUntilMonday);
    
    // Format date as YYYY-MM-DD in local timezone
    const formattedStartDate = nearestMonday.toISOString().split('T')[0];
    console.log('Selected race date:', selectedDate);
    console.log('Calculated start date:', formattedStartDate);
    setStartDate(formattedStartDate);
    
    markFormChanged();
  }, [markFormChanged]);

  // Initialize start date when component mounts
  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    const daysUntilMonday = day === 0 ? 1 : 8 - day;
    const nearestMonday = new Date(today);
    nearestMonday.setDate(today.getDate() + daysUntilMonday);
    nearestMonday.setHours(0, 0, 0, 0);
    setStartDate(nearestMonday.toISOString().split('T')[0]);
  }, []);

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
      
      // Handle dates properly
      if (preferences.raceDate) {
        console.log('Loading race date from preferences:', preferences.raceDate);
        setRaceDate(preferences.raceDate);
        setTargetDate(preferences.raceDate);
      }
      
      if (preferences.startDate) {
        console.log('Loading start date from preferences:', preferences.startDate);
        setStartDate(preferences.startDate);
      } else {
        // Calculate new start date if not in preferences
        const today = new Date();
        const day = today.getDay();
        const daysUntilMonday = day === 0 ? 1 : 8 - day;
        const nearestMonday = new Date(today);
        nearestMonday.setDate(today.getDate() + daysUntilMonday);
        nearestMonday.setHours(0, 0, 0, 0);
        setStartDate(nearestMonday.toISOString().split('T')[0]);
      }
    }
  }, []);

  return {
    selectedDays,
    weeklyMileage,
    targetDate,
    experienceLevel,
    raceDate,
    startDate,
    handleTargetDateChange,
    handleExperienceLevelChange,
    handleWeeklyMileageChange,
    handleDayToggle,
    updateFormFromPreferences
  };
};

// Custom hook for preferences management
const usePreferences = (user, updateFormFromPreferences, setUseMiles, onSubmit, planType) => {
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isColdStartLoading, setIsColdStartLoading] = useState(false);
  const [hasAutoGenerated, setHasAutoGenerated] = useState(false);

  const loadUserPreferences = useCallback(async () => {
    if (!user || hasAutoGenerated) return;
    
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

        // Auto-generate plan with loaded preferences - only once
        if (!hasAutoGenerated) {
          const formData = {
            preferredDays: preferences.preferredDays || DEFAULT_FORM_VALUES.selectedDays,
            targetDate: preferences.raceDate,
            experienceLevel: preferences.experienceLevel || DEFAULT_FORM_VALUES.experienceLevel,
            planType,
            weeklyMileage: preferences.weeklyMileage || DEFAULT_FORM_VALUES.weeklyMileage,
            distanceUnit: preferences.distanceUnit || (preferences.useMiles ? 'mi' : 'km'),
            raceDate: preferences.raceDate,
            startDate: preferences.startDate
          };
          
          // Only generate if we have all required data
          if (formData.preferredDays.length > 0 && formData.targetDate && formData.startDate) {
            onSubmit(formData);
            setHasAutoGenerated(true);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoadingPreferences(false);
      setIsColdStartLoading(false);
    }
  }, [user, updateFormFromPreferences, setUseMiles, onSubmit, planType, hasAutoGenerated]);

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

  // Reset hasAutoGenerated when user changes
  useEffect(() => {
    setHasAutoGenerated(false);
  }, [user]);

  useEffect(() => {
    loadUserPreferences();
  }, [loadUserPreferences]);

  return { 
    isLoadingPreferences, 
    isSavingPreferences, 
    isColdStartLoading, 
    saveUserPreferences,
    hasAutoGenerated 
  };
};

// Main component
export default function PlanForm({ onSubmit, planType = 'marathon', hasPlan = false }) {
  const { useMiles, setUseMiles } = useUnit();
  const { user } = useAuth();
  const isMobile = useMobileDetection();
  
  const { buttonState, markFormChanged, markPlanGenerated } = useButtonState();
  
  const {
    selectedDays,
    weeklyMileage,
    targetDate,
    experienceLevel,
    raceDate,
    startDate,
    handleTargetDateChange,
    handleExperienceLevelChange,
    handleWeeklyMileageChange,
    handleDayToggle,
    updateFormFromPreferences
  } = useFormState(markFormChanged);

  const { 
    isLoadingPreferences, 
    isSavingPreferences, 
    isColdStartLoading, 
    saveUserPreferences,
    hasAutoGenerated 
  } = usePreferences(
    user, 
    updateFormFromPreferences, 
    setUseMiles,
    onSubmit,
    planType
  );

  // State for mobile collapsible form
  const [isFormExpanded, setIsFormExpanded] = useState(!isMobile || !hasPlan);

  // Auto-collapse form on mobile when a plan is generated, and ensure it's expanded on desktop
  useEffect(() => {
    if (isMobile && (hasPlan || hasAutoGenerated)) {
      setIsFormExpanded(false);
    } else if (!isMobile) {
      setIsFormExpanded(true);
    }
  }, [isMobile, hasPlan, hasAutoGenerated]);

  const handleUnitChange = useCallback((useMilesValue) => {
    setUseMiles(useMilesValue);
    markFormChanged();
  }, [setUseMiles, markFormChanged]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submission - Race Date:', raceDate);
    console.log('Form submission - Start Date:', startDate);
    
    const formData = {
      preferredDays: selectedDays,
      targetDate: raceDate,
      experienceLevel,
      planType,
      weeklyMileage,
      distanceUnit: useMiles ? 'mi' : 'km',
      raceDate,
      startDate
    };

    console.log('Submitting form data:', formData);

    // Generate the plan first
    onSubmit(formData);
    markPlanGenerated();

    // Save preferences if user is logged in
    if (user) {
      await saveUserPreferences({
        preferredDays: selectedDays,
        experienceLevel,
        weeklyMileage,
        distanceUnit: useMiles ? 'mi' : 'km',
        raceDate,
        startDate
      });
    }

    // Collapse the form on mobile after submission
    if (isMobile) {
      setIsFormExpanded(false);
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

  // Mobile collapsed button handler
  const handleExpandForm = () => {
    setIsFormExpanded(true);
  };

  // Show collapsed button on mobile when plan exists
  if (isMobile && hasPlan && !isFormExpanded) {
    return (
      <div className={styles.formContainer}>
        <button 
          onClick={handleExpandForm}
          className={`${styles.button} ${styles.expandButton}`}
        >
          <span>Modify My Plan Preferences</span>
          <svg 
            className={styles.expandIcon} 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.formContainer} ${isMobile && hasPlan ? styles.formExpanded : ''}`}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Preferred Running Days */}
        {!hasPlan && (
          <label><h3 className={styles.title}>
            {planType === 'marathon' ? 'Create Your Personalized Marathon Training Plan' : 'Create Your Personalized Return to Running Plan'}
          </h3></label>
        )}
        
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