const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const MEDICINES_FILE = path.join(DATA_DIR, 'medicines.json');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// Initialize data directory and files
async function initializeData() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Initialize medicines file
        try {
            await fs.access(MEDICINES_FILE);
        } catch {
            await fs.writeFile(MEDICINES_FILE, JSON.stringify([]));
        }
        
        // Initialize profile file
        try {
            await fs.access(PROFILE_FILE);
        } catch {
            await fs.writeFile(PROFILE_FILE, JSON.stringify({}));
        }
        
        // Initialize history file
        try {
            await fs.access(HISTORY_FILE);
        } catch {
            await fs.writeFile(HISTORY_FILE, JSON.stringify([]));
        }
    } catch (err) {
        console.error('Error initializing data:', err);
    }
}

// Helper functions to read/write data
async function readData(file) {
    try {
        const data = await fs.readFile(file, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading data:', err);
        return file === MEDICINES_FILE || file === HISTORY_FILE ? [] : {};
    }
}

async function writeData(file, data) {
    try {
        await fs.writeFile(file, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error('Error writing data:', err);
        return false;
    }
}

// API Routes

// Get all medicines
app.get('/api/medicines', async (req, res) => {
    try {
        const medicines = await readData(MEDICINES_FILE);
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch medicines' });
    }
});

// Add new medicine
app.post('/api/medicines', async (req, res) => {
    try {
        const medicines = await readData(MEDICINES_FILE);
        const newMedicine = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString(),
            active: true
        };
        medicines.push(newMedicine);
        await writeData(MEDICINES_FILE, medicines);
        res.status(201).json(newMedicine);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add medicine' });
    }
});

// Update medicine
app.put('/api/medicines/:id', async (req, res) => {
    try {
        const medicines = await readData(MEDICINES_FILE);
        const index = medicines.findIndex(m => m.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Medicine not found' });
        }
        
        medicines[index] = { ...medicines[index], ...req.body };
        await writeData(MEDICINES_FILE, medicines);
        res.json(medicines[index]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update medicine' });
    }
});

// Delete medicine
app.delete('/api/medicines/:id', async (req, res) => {
    try {
        const medicines = await readData(MEDICINES_FILE);
        const filtered = medicines.filter(m => m.id !== req.params.id);
        await writeData(MEDICINES_FILE, filtered);
        res.json({ message: 'Medicine deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete medicine' });
    }
});

// Get profile
app.get('/api/profile', async (req, res) => {
    try {
        const profile = await readData(PROFILE_FILE);
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Save profile
app.post('/api/profile', async (req, res) => {
    try {
        await writeData(PROFILE_FILE, req.body);
        res.json(req.body);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

// Get history
app.get('/api/history', async (req, res) => {
    try {
        const history = await readData(HISTORY_FILE);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Add history entry (when medicine is taken/missed)
app.post('/api/history', async (req, res) => {
    try {
        const history = await readData(HISTORY_FILE);
        const newEntry = {
            id: Date.now().toString(),
            ...req.body,
            timestamp: new Date().toISOString()
        };
        history.push(newEntry);
        await writeData(HISTORY_FILE, history);
        res.status(201).json(newEntry);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add history entry' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize and start server
initializeData().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 MediPal server running on http://localhost:${PORT}`);
        console.log(`📁 Data directory: ${DATA_DIR}`);
    });
});
