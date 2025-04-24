const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

const corsOptions = {
    origin: '*', // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*', // Allow all headers
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Add specific handling for OPTIONS requests
// app.options('*', cors(corsOptions)); // Enable pre-flight for all routes
app.use(cors(corsOptions));
app.use(express.json());

// Map numeric days to day names
const DAY_MAPPING = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
  7: 'sunday'
};

// At the top with other constants, add reverse mapping
const REVERSE_DAY_MAPPING = {
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
    'sunday': 7
};

// Add this near the top after your requires
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

app.get('/', async (req, res) => {
    try {
        res.json({ 
            status: 'ok',
            directory: __dirname,
            time: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/generate-plan', async (req, res) => {
    try {
        console.log('Received request:', req.body);  // Add this
        const { preferredDays, targetDate, experienceLevel } = req.body;
        
        // Load the boilerplate plan
        const templatePath = req.body.planType === 'return-from-injury' ? path.join(__dirname, 'plan-boilerplates', 'injury', 'beginner.json') : 
        path.join(__dirname, 'plan-boilerplates', 'marathon', 'weeks', '18', 'beginner.json');
        // const templatePath = path.join(__dirname, 'plan-boilerplates', 'marathon', 'weeks', '18', 'beginner.json');
        const templateData = await fs.readFile(templatePath, 'utf8');
        const template = JSON.parse(templateData);

        // Log the template structure to debug
        console.log('Template structure:', JSON.stringify(template).substring(0, 300) + '...');
        
        // Process the template to map numeric days to day names
        const processedSchedule = [];
        
        // Check if template is directly an array of weeks or has a nested structure
        const weeks = template.trainingPlan?.weeks || template.weeks || template;
        
        if (Array.isArray(weeks)) {
            weeks.forEach(week => {


                // we need the schedule to align with the passed in preffered days
                // for the first verison of this functionality we will just make sure each preferred day has a workout
                // and once we run out of workouts we can leave the rest as rest days
                // late I will add in combining of non long runs so that the weekly mileage stays the same even
                // if only two days of the week are preferred

                // iterate through the ordered preferred days array (ex: ["Monday", "Wednesday", "Friday"]) 
                // and for each day iterate through the week template and find the first non-rest day
                // and add it to the processedWeek for that day while removing it from the template so it isn't reused
                // then fill in the rest of the days with the remaining workouts

                // then for version two, after this process is done we will check to see what workouts are left
                // and then we will pick the best option to fill in the remaining workout
                // to do this, we will write a smart algorithm that intelligently finds the ideal day to fit in each remaining workout
                // this is the algorithm which is based on training principals of intensity and recovery
                   // each workout day of ther week is assigned an intensity score 
                   // each day of the week is assigned a recovery score which starts at 0
                   // the intensity score of a workout adds a recovery score to the *following day of the week*
                   // and it also maps a recovery score of 1/2 to the day of the week two days later
                   // Once each recovery score is calculated we can iterate through each possibility where we add the remaining workouts
                   // to each week to find the combination 

                   /* "schedule": {
                        "1": {
                        "type": "Rest",
                        "distance": 0,
                        "units": "miles"
                        },
                        "2": {
                        "type": "Run",
                        "distance": 3,
                        "units": "miles"
                        }, 
                        ...
                    },*/

                console.log('preferredDays',preferredDays);
                
                const processedWeek = {};
                
                // For each day in the week's schedule
                const schedule = week.schedule || week;
                
                // if (schedule) {
                //     Object.keys(schedule).forEach(dayNum => {
                //         // Map the numeric day to a day name
                //         const dayName = DAY_MAPPING[dayNum];
                //         if (dayName) {
                //             processedWeek[dayName] = schedule[dayNum];
                //         }
                //     });
                // }

                // we need to order the preferred days array chronologically
                preferredDays.sort((a, b) => {
                    const dayA = REVERSE_DAY_MAPPING[a.toLowerCase()];
                    const dayB = REVERSE_DAY_MAPPING[b.toLowerCase()];
                    return dayA - dayB;
                });
                
                preferredDays.forEach(day => {
                    // find the first non-rest day in the week
                    const nonRestDay = Object.keys(schedule).find(dayNum => schedule[dayNum].type === 'Run');
                    if (nonRestDay) {
                        processedWeek[day] = schedule[nonRestDay];
                        delete schedule[nonRestDay];
                    } else {
                        // processedWeek[day] = schedule[Object.keys(schedule)[0]];
                        // delete schedule[Object.keys(schedule)[0]];
                        // If we've run out of workouts, try to redistribute existing workouts for better spacing
                        const currentDayNum = REVERSE_DAY_MAPPING[day.toLowerCase()];
                        let foundWorkoutToSwap = false;

                        // Look backwards through previous days to find a workout we can swap
                        for (let i = currentDayNum - 1; i >= 1; i--) {
                            const previousDay = DAY_MAPPING[i];
                            // Check if this previous day has a workout and is one of our preferred days
                            if (processedWeek[previousDay] && 
                                processedWeek[previousDay].type === 'Run' &&
                                preferredDays.includes(previousDay)) {
                                
                                // Found a workout we can swap
                                processedWeek[day] = processedWeek[previousDay];  // Move workout to current day
                                processedWeek[previousDay] = schedule[Object.keys(schedule)[0]];  // Assign rest to previous day
                                delete schedule[Object.keys(schedule)[0]];
                                foundWorkoutToSwap = true;
                                break;
                            }
                        }

                        // If we couldn't find a workout to swap, just assign rest day as before
                        if (!foundWorkoutToSwap) {
                            processedWeek[day] = schedule[Object.keys(schedule)[0]];
                            delete schedule[Object.keys(schedule)[0]];
                        }
                    }
                });

                // Check if there's still a long run in the remaining schedule
                const longRunDay = Object.keys(schedule).find(dayNum => 
                    schedule[dayNum].type === 'Run' && schedule[dayNum].long === true
                );

                if (longRunDay) {
                    // Find the last workout day in our processed week
                    const lastWorkoutDay = Object.keys(processedWeek)
                        .reverse()
                        .find(day => processedWeek[day].type === 'Run');

                    if (lastWorkoutDay) {
                        // Swap the last workout with the long run
                        processedWeek[lastWorkoutDay] = schedule[longRunDay];
                        delete schedule[longRunDay];
                    }
                }
                
                console.log('processedWeek!',processedWeek);
                processedSchedule.push(processedWeek);
            });
        } else {
            console.error('Unexpected template structure:', template);
        }
        
        // Calculate start date (18 weeks before target date)
        const targetDateObj = new Date(targetDate);
        const startDateObj = new Date(targetDateObj);
        startDateObj.setDate(targetDateObj.getDate() - (18 * 7)); // 18 weeks before
        
        const plan = {
            startDate: startDateObj.toISOString(),
            targetDate: targetDateObj.toISOString(),
            schedule: processedSchedule
        };
        
        // Log the final plan for debugging
        // console.log('Generated plan structure:', 
        //     JSON.stringify({
        //         startDate: plan.startDate,
        //         targetDate: plan.targetDate,
        //         scheduleLength: plan.schedule.length,
        //         plan: plan.schedule
        //     })
        // );
        
        res.json(plan);
    } catch (error) {
        console.error('Full error details:', error);  // Changed this
        res.status(500).json({ 
            message: error.message,
            stack: error.stack,
            path: __dirname 
        });
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Server running on port ${PORT}`);
}); 