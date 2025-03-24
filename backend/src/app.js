const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Map numeric days to day names
const DAY_MAPPING = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday'
};

app.post('/generate-plan', async (req, res) => {
    try {
        const { preferredDays, targetDate, experienceLevel } = req.body;
        
        // Load the boilerplate plan
        const templatePath = path.join(__dirname, 'plan-boilerplates', 'marathon', 'weeks', '18', 'beginner.json');
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

                // console.log('preferredDays',preferredDays);
                
                const processedWeek = {};
                
                // For each day in the week's schedule
                const schedule = week.schedule || week;
                
                if (schedule) {
                    Object.keys(schedule).forEach(dayNum => {
                        // Map the numeric day to a day name
                        const dayName = DAY_MAPPING[dayNum];
                        if (dayName) {
                            processedWeek[dayName] = schedule[dayNum];
                        }
                    });
                }
                
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
        console.log('Generated plan structure:', 
            JSON.stringify({
                startDate: plan.startDate,
                targetDate: plan.targetDate,
                scheduleLength: plan.schedule.length
            })
        );
        
        res.json(plan);
    } catch (error) {
        console.error('Error generating plan:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 