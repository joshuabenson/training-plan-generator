/**
 * Finds "island" preferred days in a schedule - days that have no workouts before or after them
 * @param {Object} schedule - The weekly schedule object containing workouts with day names as keys
 * @param {Array<string>} preferredDays - Array of preferred running days (monday, tuesday, etc.)
 * @returns {Array<string>} Array of preferred days that are "islands"
 */
function findIslands(schedule, preferredDays) {
  const islands = [];
  
  // Map day names to numbers for consistent handling
  const DAY_TO_NUM = {
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
    'sunday': 7
  };

//   const NUM_TO_DAY = {
//     1: 'monday',
//     2: 'tuesday',
//     3: 'wednesday',
//     4: 'thursday',
//     5: 'friday',
//     6: 'saturday',
//     7: 'sunday'
//   };

  // Convert schedule to a map of days with workouts
  const workoutDays = new Set();
  for (const [dayName, workout] of Object.entries(schedule)) {
    if (workout.type === 'Run') {
      workoutDays.add(DAY_TO_NUM[dayName.toLowerCase()]);
    }
  }

//   console.log('Workout days:', Array.from(workoutDays));

  // Check each preferred day
  for (const dayName of preferredDays) {
    const dayNum = DAY_TO_NUM[dayName.toLowerCase()];
    const dayBefore = dayNum === 1 ? 7 : dayNum - 1;
    const dayAfter = dayNum === 7 ? 1 : dayNum + 1;

    // console.log(`Checking ${dayName}:`, {
    //   dayNum,
    //   dayBefore,
    //   dayAfter,
    //   hasWorkout: workoutDays.has(dayNum),
    //   hasWorkoutBefore: workoutDays.has(dayBefore),
    //   hasWorkoutAfter: workoutDays.has(dayAfter)
    // });

    // If the preferred day isn't scheduled and has no workouts before or after
    if (!workoutDays.has(dayNum) && 
        !workoutDays.has(dayBefore) && 
        !workoutDays.has(dayAfter)) {
      islands.push(dayName);
    }
  }

  console.log('Found islands:', islands);
  return islands;
}

module.exports = findIslands;
