// Global variables
let medicines = [];
let profile = {};
let editingMedicineId = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize application
async function initializeApp() {
    startClock();
    await loadProfile();
    await loadMedicines();
    await updateStatistics();
    setupEventListeners();
    startReminderChecker();
}

// Start real-time clock
function startClock() {
    function updateClock() {
        const now = new Date();
        
        // Update time
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        document.getElementById('currentTime').textContent = `${hours}:${minutes}:${seconds}`;
        
        // Update date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

// Setup event listeners
function setupEventListeners() {
    // Medicine form submission
    document.getElementById('medicineForm').addEventListener('submit', handleMedicineSubmit);
    
    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', handleProfileSubmit);
}

// Handle medicine form submission
async function handleMedicineSubmit(e) {
    e.preventDefault();
    
    const medicineData = {
        medicineName: document.getElementById('medicineName').value,
        dosage: document.getElementById('dosage').value,
        reminderTime: document.getElementById('reminderTime').value,
        frequency: document.getElementById('frequency').value,
        duration: document.getElementById('duration').value,
        instructions: document.getElementById('instructions').value
    };
    
    try {
        let response;
        if (editingMedicineId) {
            response = await fetch(`/api/medicines/${editingMedicineId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(medicineData)
            });
            editingMedicineId = null;
        } else {
            response = await fetch('/api/medicines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(medicineData)
            });
        }
        
        if (response.ok) {
            showToast('Success', 'Medicine reminder saved successfully!', 'success');
            document.getElementById('medicineForm').reset();
            await loadMedicines();
            await updateStatistics();
        }
    } catch (error) {
        console.error('Error saving medicine:', error);
        showToast('Error', 'Failed to save medicine reminder', 'error');
    }
}

// Handle profile form submission
async function handleProfileSubmit(e) {
    e.preventDefault();
    
    const profileData = {
        name: document.getElementById('userName').value,
        age: document.getElementById('userAge').value,
        bloodGroup: document.getElementById('bloodGroup').value,
        emergencyContact: document.getElementById('emergencyContact').value
    };
    
    try {
        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        
        if (response.ok) {
            profile = profileData;
            showToast('Success', 'Profile saved successfully!', 'success');
            displayProfile();
            switchTab('view');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showToast('Error', 'Failed to save profile', 'error');
    }
}

// Load medicines from server
async function loadMedicines() {
    try {
        const response = await fetch('/api/medicines');
        medicines = await response.json();
        displayMedicines();
    } catch (error) {
        console.error('Error loading medicines:', error);
    }
}

// Display medicines in the grid
function displayMedicines() {
    const medicineList = document.getElementById('medicineList');
    
    if (medicines.length === 0) {
        medicineList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💊</div>
                <div class="empty-text">No medicines added yet<br>Add your first reminder above!</div>
            </div>
        `;
        return;
    }
    
    medicineList.innerHTML = medicines.map(medicine => `
        <div class="medicine-card">
            <div class="medicine-info">
                <h4>${medicine.medicineName}</h4>
                <div class="medicine-meta">
                    <span class="meta-badge">⏰ ${medicine.reminderTime}</span>
                    <span class="meta-badge">💊 ${medicine.dosage}</span>
                    <span class="meta-badge">📅 ${medicine.frequency}</span>
                    <span class="meta-badge">⏱️ ${medicine.duration} days</span>
                    ${medicine.instructions ? `<span class="meta-badge">📝 ${medicine.instructions}</span>` : ''}
                </div>
            </div>
            <div class="medicine-actions">
                <button class="icon-btn btn-edit" onclick="editMedicine('${medicine.id}')" title="Edit">✏️</button>
                <button class="icon-btn btn-delete" onclick="deleteMedicine('${medicine.id}')" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Edit medicine
async function editMedicine(id) {
    const medicine = medicines.find(m => m.id === id);
    if (!medicine) return;
    
    document.getElementById('medicineName').value = medicine.medicineName;
    document.getElementById('dosage').value = medicine.dosage;
    document.getElementById('reminderTime').value = medicine.reminderTime;
    document.getElementById('frequency').value = medicine.frequency;
    document.getElementById('duration').value = medicine.duration;
    document.getElementById('instructions').value = medicine.instructions || '';
    
    editingMedicineId = id;
    
    // Scroll to form
    document.getElementById('medicineForm').scrollIntoView({ behavior: 'smooth' });
}

// Delete medicine
async function deleteMedicine(id) {
    if (!confirm('Are you sure you want to delete this medicine reminder?')) return;
    
    try {
        const response = await fetch(`/api/medicines/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Success', 'Medicine reminder deleted', 'success');
            await loadMedicines();
            await updateStatistics();
        }
    } catch (error) {
        console.error('Error deleting medicine:', error);
        showToast('Error', 'Failed to delete medicine', 'error');
    }
}

// Load profile from server
async function loadProfile() {
    try {
        const response = await fetch('/api/profile');
        profile = await response.json();
        
        if (profile.name) {
            displayProfile();
            
            // Fill form with existing data
            document.getElementById('userName').value = profile.name || '';
            document.getElementById('userAge').value = profile.age || '';
            document.getElementById('bloodGroup').value = profile.bloodGroup || '';
            document.getElementById('emergencyContact').value = profile.emergencyContact || '';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Display profile
function displayProfile() {
    const profileDisplay = document.getElementById('profileDisplay');
    
    if (!profile.name) {
        profileDisplay.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👤</div>
                <div class="empty-text">No profile created yet<br>Click Edit to get started</div>
            </div>
        `;
        return;
    }
    
    profileDisplay.innerHTML = `
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
                    <div class="info-label">Emergency</div>
                    <div class="info-value">${profile.emergencyContact}</div>
                </div>
            </div>
        </div>
    `;
}

// Switch between profile tabs
function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));
    
    if (tab === 'view') {
        tabs[0].classList.add('active');
        document.getElementById('viewTab').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('editTab').classList.add('active');
    }
}

// Update statistics
async function updateStatistics() {
    try {
        const response = await fetch('/api/statistics');
        const stats = await response.json();
        
        document.getElementById('totalMeds').textContent = stats.totalMedicines;
        document.getElementById('todayDoses').textContent = stats.todayDoses;
        document.getElementById('adherenceRate').textContent = `${stats.adherenceRate}%`;
        
        // Update quick stats
        document.getElementById('upcomingCount').textContent = getUpcomingCount();
        document.getElementById('takenCount').textContent = stats.todayDoses;
        document.getElementById('missedCount').textContent = stats.missedDoses;
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}

// Get count of upcoming reminders
function getUpcomingCount() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    return medicines.filter(m => m.active && m.reminderTime > currentTime).length;
}

// Start reminder checker
function startReminderChecker() {
    setInterval(checkReminders, 60000); // Check every minute
}

// Check for reminders
function checkReminders() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    medicines.forEach(medicine => {
        if (medicine.active && medicine.reminderTime === currentTime) {
            showAlarmToast(medicine);
            playAlarmSound();
        }
    });
}

// Show toast notification
function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    
    toast.className = `toast toast-${type} show`;
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Show alarm toast
function showAlarmToast(medicine) {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    
    toast.className = 'toast toast-alarm show';
    toastTitle.textContent = `💊 Time to take ${medicine.medicineName}!`;
    toastMessage.textContent = `${medicine.dosage} - ${medicine.instructions || 'No special instructions'}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 10000);
}

// Play alarm sound
function playAlarmSound() {
    const audio = document.getElementById('alarmSound');
    audio.play().catch(e => console.log('Could not play sound:', e));
}

// Make functions available globally
window.editMedicine = editMedicine;
window.deleteMedicine = deleteMedicine;
window.switchTab = switchTab;
