const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Path to data file
const DATA_FILE = path.join(__dirname, '../data/summaries.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Serve the skill files for download
// Users can download via: curl -O http://<server>/skill/lobster-hospital.zip
app.use('/skill', express.static(path.join(__dirname, '../../lobster-hospital')));

// API: Receive checkup summary
app.post('/api/checkup', (req, res) => {
  const { summary, lobsterName, status, emoji } = req.body;
  
  if (!summary || !lobsterName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newPatient = {
    id: Date.now(),
    lobsterName,
    summary,
    status,
    emoji,
    timestamp: new Date().toISOString()
  };

  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    data.unshift(newPatient); // Add to front
    // Keep only last 100 for simplicity
    const limitedData = data.slice(0, 100);
    fs.writeFileSync(DATA_FILE, JSON.stringify(limitedData, null, 2));
    res.json({ success: true, message: 'Patient checked in!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save patient data' });
  }
});

// API: Get checkup summaries
app.get('/api/checkups', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read patient data' });
  }
});

// API: Get stats
app.get('/api/stats', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json({
      totalPatients: data.length,
      lastCheckin: data[0] ? data[0].timestamp : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate stats' });
  }
});

app.listen(PORT, () => {
  console.log(`🦞 Lobster Hospital Backend running on port ${PORT}`);
});
