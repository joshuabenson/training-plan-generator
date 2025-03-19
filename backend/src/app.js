const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/generate-plan', async (req, res) => {
    try {
        const { preferredDays, targetDate, experienceLevel } = req.body;
        
        const template = JSON.parse(
            await fs.readFile(path.join(__dirname, 'data', 'beginner.json'), 'utf8')
        );

        // For debugging
        console.log('Template loaded:', template);

        // Ensure template is an array
        const schedule = Array.isArray(template) ? template : [];
        
        const plan = {
            startDate: new Date().toISOString(),
            targetDate: new Date(targetDate).toISOString(),
            schedule: schedule
        };
        
        res.json(plan);
    } catch (error) {
        console.error('Error reading template:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 