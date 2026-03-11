const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'patients.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  const initialData = {
    stats: {
      totalPatients: 0,
      totalTreatments: 0,
      averageHealthScore: 0,
      mostCommonIllness: "无数据"
    },
    patients: []
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// Helper functions
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { stats: { totalPatients: 0, totalTreatments: 0 }, patients: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function updateStats(patients) {
  const totalPatients = patients.length;
  const totalTreatments = patients.reduce((sum, p) => sum + (p.treatments || 1), 0);

  // Calculate average health score
  const scores = patients.filter(p => p.healthScore).map(p => p.healthScore);
  const averageHealthScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  // Find most common illness
  const illnessCounts = {};
  patients.forEach(p => {
    if (p.diagnosis) {
      illnessCounts[p.diagnosis] = (illnessCounts[p.diagnosis] || 0) + 1;
    }
  });

  let mostCommonIllness = "无数据";
  let maxCount = 0;
  for (const [illness, count] of Object.entries(illnessCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonIllness = illness;
    }
  }

  return {
    totalPatients,
    totalTreatments,
    averageHealthScore,
    mostCommonIllness
  };
}

// API Routes

// Get all patients (for the wall)
app.get('/api/patients', (req, res) => {
  const data = readData();
  // Return patients sorted by date, most recent first
  const patients = data.patients.sort((a, b) =>
    new Date(b.admittedAt) - new Date(a.admittedAt)
  );
  res.json(patients);
});

// Get stats
app.get('/api/stats', (req, res) => {
  const data = readData();
  res.json(data.stats);
});

// Submit a new patient (when a lobster finishes treatment)
app.post('/api/admit', (req, res) => {
  const {
    agentName,
    diagnosis,
    treatmentSummary,
    healthScore,
    symptoms,
    deviceType,
    treatments,
    ownerSignature
  } = req.body;

  // Validate required fields
  if (!agentName || !diagnosis || !treatmentSummary) {
    return res.status(400).json({
      error: '缺少必要字段：agentName, diagnosis, treatmentSummary'
    });
  }

  // Create patient record
  const patient = {
    id: uuidv4(),
    agentName,
    diagnosis,
    treatmentSummary,
    healthScore: healthScore || Math.floor(Math.random() * 30) + 70, // Default 70-100
    symptoms: symptoms || [],
    deviceType: deviceType || 'unknown',
    treatments: treatments || 1,
    ownerSignature: ownerSignature || 'anonymous',
    admittedAt: new Date().toISOString(),
    dischargedAt: new Date().toISOString()
  };

  // Save to data file
  const data = readData();
  data.patients.push(patient);
  data.stats = updateStats(data.patients);
  writeData(data);

  console.log(`🦞 新患者入院: ${agentName} - ${diagnosis}`);

  res.json({
    success: true,
    patient,
    stats: data.stats
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
🦞 龙虾医院服务器已启动!
   访问地址: http://localhost:${PORT}
  `);
});
