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