const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const MEDICINES_FILE = path.join(DATA_DIR, 'medicines.json');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Helper functions to read/write data
function readData(file) {
    try {
        if (fs.existsSync(file)) {
            const data = fs.readFileSync(file, 'utf8');
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error(`Error reading ${file}:`, error);
        return null;
    }
}

function writeData(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${file}:`, error);
        return false;
    }
}

// Initialize data files if they don't exist
if (!fs.existsSync(MEDICINES_FILE)) {
    writeData(MEDICINES_FILE, []);
}
if (!fs.existsSync(PROFILE_FILE)) {
    writeData(PROFILE_FILE, {});
}
if (!fs.existsSync(HISTORY_FILE)) {
    writeData(HISTORY_FILE, []);
}

// API Routes

// Get all medicines
app.get('/api/medicines', (req, res) => {
    const medicines = readData(MEDICINES_FILE) || [];
    res.json(medicines);
});

// Add new medicine
app.post('/api/medicines', (req, res) => {
    const medicines = readData(MEDICINES_FILE) || [];
    const newMedicine = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString(),
        active: true
    };
    medicines.push(newMedicine);
    
    if (writeData(MEDICINES_FILE, medicines)) {
        res.status(201).json(newMedicine);
    } else {
        res.status(500).json({ error: 'Failed to save medicine' });
    }
});

// Update medicine
app.put('/api/medicines/:id', (req, res) => {
    const medicines = readData(MEDICINES_FILE) || [];
    const index = medicines.findIndex(m => m.id === req.params.id);
    
    if (index !== -1) {
        medicines[index] = { ...medicines[index], ...req.body };
        if (writeData(MEDICINES_FILE, medicines)) {
            res.json(medicines[index]);
        } else {
            res.status(500).json({ error: 'Failed to update medicine' });
        }
    } else {
        res.status(404).json({ error: 'Medicine not found' });
    }
});

// Delete medicine
app.delete('/api/medicines/:id', (req, res) => {
    let medicines = readData(MEDICINES_FILE) || [];
    const initialLength = medicines.length;
    medicines = medicines.filter(m => m.id !== req.params.id);
    
    if (medicines.length < initialLength) {
        if (writeData(MEDICINES_FILE, medicines)) {
            res.json({ message: 'Medicine deleted successfully' });
        } else {
            res.status(500).json({ error: 'Failed to delete medicine' });
        }
    } else {
        res.status(404).json({ error: 'Medicine not found' });
    }
});

// Get profile
app.get('/api/profile', (req, res) => {
    const profile = readData(PROFILE_FILE) || {};
    res.json(profile);
});

// Save/Update profile
app.post('/api/profile', (req, res) => {
    if (writeData(PROFILE_FILE, req.body)) {
        res.json(req.body);
    } else {
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

// Get history
app.get('/api/history', (req, res) => {
    const history = readData(HISTORY_FILE) || [];
    res.json(history);
});

// Add history entry
app.post('/api/history', (req, res) => {
    const history = readData(HISTORY_FILE) || [];
    const newEntry = {
        id: Date.now().toString(),
        ...req.body,
        timestamp: new Date().toISOString()
    };
    history.push(newEntry);
    
    if (writeData(HISTORY_FILE, history)) {
        res.status(201).json(newEntry);
    } else {
        res.status(500).json({ error: 'Failed to save history' });
    }
});

// Get statistics
app.get('/api/statistics', (req, res) => {
    const medicines = readData(MEDICINES_FILE) || [];
    const history = readData(HISTORY_FILE) || [];
    const today = new Date().toDateString();
    
    const todayHistory = history.filter(h => 
        new Date(h.timestamp).toDateString() === today
    );
    
    const stats = {
        totalMedicines: medicines.filter(m => m.active).length,
        todayDoses: todayHistory.filter(h => h.status === 'taken').length,
        missedDoses: todayHistory.filter(h => h.status === 'missed').length,
        adherenceRate: calculateAdherence(history)
    };
    
    res.json(stats);
});

function calculateAdherence(history) {
    if (history.length === 0) return 100;
    const taken = history.filter(h => h.status === 'taken').length;
    return Math.round((taken / history.length) * 100);
}

// Cron job to check for medicine reminders every minute
cron.schedule('* * * * *', () => {
    const medicines = readData(MEDICINES_FILE) || [];
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    medicines.forEach(medicine => {
        if (medicine.active && medicine.reminderTime === currentTime) {
            console.log(`REMINDER: Time to take ${medicine.medicineName} - ${medicine.dosage}`);
            // In a real app, you would send push notifications here
        }
    });
});

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`MediPal server running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
        
