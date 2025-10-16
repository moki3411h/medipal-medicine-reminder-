// API Base URL
const API_URL = 'http://localhost:3000/api';

// State management
let medicines = [];
let profile = {};
let history = [];
let editingMedicineId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeClock();
    loadProfile();
    loadMedicines();
    loadHistory();
    setupEventListeners();
    startReminderCheck();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('medicineForm').addEventListener('submit', handleMedicineSubmit);
    document.getElementById('profileForm').addEventListener('submit', handleProfileSubmit);
}

// Clock functions
function initializeClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('currentTime').textContent = timeString;
    document.getElementById('currentDate').textContent = dateString;
}

// API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (!response.ok) throw new Error('API call failed');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showToast('Error', 'Failed to connect to server', 'error');
        return null;
    }
}

// Load data
async function loadMedicines() {
    medicines = await apiCall('/medicines') || [];
    renderMedicines();
    updateStats();
}

async function loadProfile() {
    profile = await apiCall('/profile') || {};
    renderProfile();
}

async function loadHistory() {
    history = await apiCall('/history') || [];
    updateStats();
}

// Medicine CRUD operations
async function handleMedicineSubmit(e) {
    e.preventDefault();
    
    const medicineData = {
        name: document.getElementById('medicineName').value,
        dosage: document.getElementById('dosage').value,
        reminderTime: document.getElementById('reminderTime').value,
        frequency: document.getElementById('frequency').value,
        duration: parseInt(document.getElementById('duration').value),
        instructions: document.getElementById('instructions').value,
    };
    
    if (editingMedicineId) {
        await apiCall(`/medicines/${editingMedicineId}`, 'PUT', medicineData);
        showToast('Success', 'Medicine updated successfully!', 'success');
        editingMedicineId = null;
    } else {
        await apiCall('/medicines', 'POST', medicineData);
        showToast('Success', 'Medicine reminder added successfully!', 'success');
    }
    
    document.getElementById('medicineForm').reset();
    await loadMedicines();
}

async function deleteMedicine(id) {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    
    await apiCall(`/medicines/${id}`, 'DELETE');
    showToast('Success', 'Medicine deleted successfully!', 'success');
    await loadMedicines();
}

function editMedicine(id) {
    const medicine = medicines.find(m => m.id === id);
    if (!medicine) return;
    
    document.getElementById('medicineName').value = medicine.name;
    document.getElementById('dosage').value = medicine.dosage;
    document.getElementById('reminderTime').value = medicine.reminderTime;
    document.getElementById('frequency').value = medicine.frequency;
    document.getElementById('duration').value = medicine.duration;
    document.getElementById('instructions').value = medicine.instructions || '';
    
    editingMedicineId = id;
    document.querySelector('#medicineForm .btn-primary').textContent = 'Update Reminder';
    
    // Scroll to form
    document.getElementById('medicineForm').scrollIntoView({ behavior: 'smooth' });
}

// Profile operations
async function handleProfileSubmit(e) {
    e.preventDefault();
    
    const profileData = {
        name: document.getElementById('userName').value,
        age: parseInt(document.getElementById('userAge').value),
        bloodGroup: document.getElementById('bloodGroup').value,
        emergencyContact: document.getElementById('emergencyContact').value,
    };
    
    await apiCall('/profile', 'POST', profileData);
    profile = profileData;
    renderProfile();
    showToast('Success', 'Profile saved successfully!', 'success');
    switchTab('view');
}

// Render functions
function renderMedicines() {
    const container = document.getElementById('medicineList');
    
    if (medicines.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💊</div>
                <div class="empty-text">No medicines added yet<br>Add your first reminder above!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = medicines.map(med => `
        <div class="medicine-card">
            <div class="medicine-info">
                <h4>${med.name}</h4>
                <div class="medicine-meta">
                    <span class="meta-badge">⏰ ${formatTime(med.reminderTime)}</span>
                    <span class="meta-badge">💊 ${med.dosage}</span>
                    <span class="meta-badge">📅 ${med.frequency}</span>
                    ${med.instructions ? `<span class="meta-badge">📝 ${med.instructions}</span>` : ''}
                </div>
            </div>
            <div class="medicine-actions">
                <button class="icon-btn btn-edit" onclick="editMedicine('${med.id}')">✏️</button>
                <button class="icon-btn btn-delete" onclick="deleteMedicine('${med.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

function renderProfile() {
    const container = document.getElementById('profileDisplay');
    
    if (!profile.name) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👤</div>
                <div class="empty-text">No profile created yet<br>Click Edit to get started</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="profile-card">
            <div class="profile-avatar">👤</div>
            <div class="profile-info">
                <div class="info-item">
                    <div class="info-label">Name</div>
                    <div class="info-value">${profile.name}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Age</div>
                    <div class="info-value">${profile.age} years</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Blood Group</div>
                    <div class="info-value">${profile.bloodGroup}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Emergency Contact</div>
                    <div class="info-value">${profile.emergencyContact}</div>
                </div>
            </div>
        </div>
    `;
}

function updateStats() {
    // Total active medicines
    document.getElementById('totalMeds').textContent = medicines.length;
    
    // Calculate today's doses based on frequency
    let todayDoses = 0;
    medicines.forEach(med => {
