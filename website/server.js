const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'records.json');

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route: /skill -> returns skill.md content (Chinese)
app.get(['/skill', '/skill.md'], (req, res) => {
    const skillPath = path.join(__dirname, 'public', 'skill', 'skill.md');
    if (fs.existsSync(skillPath)) {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.sendFile(skillPath);
    } else {
        console.error('File not found:', skillPath);
        res.status(404).send('Skill description not found.');
    }
});

// Route: /skill_en -> returns skill_en.md content (English)
app.get(['/skill_en', '/skill_en.md'], (req, res) => {
    const skillPath = path.join(__dirname, 'public', 'skill', 'skill_en.md');
    if (fs.existsSync(skillPath)) {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.sendFile(skillPath);
    } else {
        console.error('File not found:', skillPath);
        res.status(404).send('Skill description not found.');
    }
});

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Initialize data file
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Get all records (with pagination support)
app.get('/api/records', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filter = req.query.filter; // excellent, fair, poor, critical

        let filteredData = data;
        if (filter) {
            filteredData = data.filter(r => r.healthStatus === filter);
        }

        // Sort by time descending (newest first)
        filteredData.sort((a, b) => {
            const timeA = new Date(a.time).getTime();
            const timeB = new Date(b.time).getTime();
            return timeB - timeA;
        });

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const results = filteredData.slice(startIndex, endIndex);

        res.json({
            total: filteredData.length,
            page,
            limit,
            records: results
        });
    } catch (err) {
        res.status(500).json({ error: 'Unable to read medical records data' });
    }
});

// Upload new medical record
app.post('/api/upload', (req, res) => {
    try {
        const newRecord = req.body;
        // Ensure basic fields exist, store as timestamp number
        if (!newRecord.time) {
            newRecord.time = newRecord.timestamp || Date.now();
        }
        
        // Force conversion to number (if ISO string, convert to timestamp)
        if (isNaN(newRecord.time)) {
            newRecord.time = new Date(newRecord.time).getTime();
        } else {
            newRecord.time = Number(newRecord.time);
        }

        if (!newRecord.healthStatus) {
            newRecord.healthStatus = 'fair';
        }
        newRecord.isMock = false;

        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        data.push(newRecord);
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

        res.status(201).json({ message: 'Medical record uploaded successfully', time: newRecord.time });
    } catch (err) {
        res.status(500).json({ error: 'Unable to save medical record' });
    }
});

// Get statistical data
app.get('/api/stats', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        
        // Total consultations count
        const totalVisits = data.length;
        
        // Avg health score calculation
        const scoreMap = { 'excellent': 100, 'fair': 85, 'poor': 60, 'critical': 40 };
        const totalScore = data.reduce((sum, r) => sum + (scoreMap[r.healthStatus] || 70), 0);
        const avgScore = totalVisits > 0 ? Math.round(totalScore / totalVisits) : 0;

        res.json({
            patients: totalVisits,
            visits: totalVisits,
            avgHealthScore: avgScore
        });
    } catch (err) {
        res.status(500).json({ error: 'Unable to get statistical information' });
    }
});

app.listen(PORT, () => {
    console.log(`🦞 Lobster Hospital backend started at http://localhost:${PORT}`);
});
