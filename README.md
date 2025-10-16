# 💊 MediPal - Smart Medicine Reminder App

A complete medicine reminder application with a Node.js backend and modern frontend.

## 📁 Project Structure

```
medipal/
├── server.js           # Backend API server
├── package.json        # Dependencies
├── data/              # Auto-created data directory
│   ├── medicines.json # Medicines storage
│   ├── profile.json   # User profile
│   └── history.json   # Medicine taking history
└── public/            # Frontend files
    ├── index.html     # Main HTML file
    ├── style.css      # Styling
    └── app.js         # Frontend JavaScript
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Step 1: Install Node.js
Download and install from: https://nodejs.org/

### Step 2: Create Project Directory
```bash
mkdir medipal
cd medipal
```

### Step 3: Create Files

Create the following folder structure:
```bash
mkdir public
mkdir data
```

Copy the files to their respective locations:
- `server.js` → Root directory
- `package.json` → Root directory
- `index.html` → `public/` folder
- `style.css` → `public/` folder
- `app.js` → `public/` folder

### Step 4: Install Dependencies
```bash
npm install
```

### Step 5: Start the Server
```bash
npm start
```

Or for development (auto-restart on file changes):
```bash
npm run dev
```

### Step 6: Open the Application
Open your browser and go to:
```
http://localhost:3000
```

## ✨ Features

### 📋 Medicine Management
- Add medicines with dosage, time, and frequency
- Edit existing medicine reminders
- Delete medicines you no longer need
- View all active medicines in a clean interface

### ⏰ Smart Reminders
- Automatic reminders at scheduled times
- Visual notifications on screen
- Browser notifications (with permission)
- Audio alarm for important reminders

### 👤 User Profile
- Store personal information
- Track blood group and emergency contacts
- Easy profile editing

### 📊 Statistics & Tracking
- Total active medicines
- Today's doses count
- Adherence rate tracking
- Taken vs missed doses
- Upcoming reminders count

### 💾 Data Persistence
- All data saved to JSON files
- Data persists between sessions
- Automatic backup in `data/` folder

## 🎯 Usage Guide

### Adding a Medicine
1. Fill in the "Add Medicine Reminder" form
2. Enter medicine name, dosage, time, frequency, and duration
3. Add optional instructions (e.g., "After food")
4. Click "Add Reminder"

### Setting Up Profile
1. Click on the "Edit" tab under "Your Profile"
2. Fill in your details
3. Click "Save Profile"

### Managing Reminders
- **Edit**: Click the pencil icon on any medicine card
- **Delete**: Click the trash icon to remove a reminder
- **View**: All medicines appear in the schedule section

## 🔧 API Endpoints

### Medicines
- `GET /api/medicines` - Get all medicines
- `POST /api/medicines` - Add new medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Profile
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Save/update profile

### History
- `GET /api/history` - Get medicine taking history
- `POST /api/history` - Add history entry

## 🔔 Notification Setup

For browser notifications:
1. Click "Allow" when prompted for notification permission
2. Notifications will appear even when the browser is in the background
3. Audio alerts play automatically at reminder times

## 🛠️ Troubleshooting

### Port Already in Use
If port 3000 is taken, edit `server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Change 3000 to 3001
```

### Data Not Saving
- Check if `data/` folder exists
- Ensure write permissions for the folder
- Check console for error messages

### Notifications Not Working
- Allow browser notification permissions
- Check browser notification settings
- Ensure audio autoplay is allowed

## 📦 Dependencies

- **express**: Web server framework
- **cors**: Cross-origin resource sharing
- **nodemon**: Development auto-restart (dev only)

## 🎨 Customization

### Change Colors
Edit CSS variables in `style.css`:
```css
:root {
    --primary: #6366f1;
    --secondary: #8b5cf6;
    /* Add your custom colors */
}
```

### Change Port
Edit `server.js`:
```javascript
const PORT = 3000; // Change to your preferred port
```

## 📱 Mobile Support

The app is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones

## 🔐 Security Notes

- This is a local application
- Data is stored in JSON files on your computer
- No external data transmission
- For production, add authentication and use a proper database

## 🚀 Future Enhancements

Possible additions:
- Multiple user accounts
- Email/SMS notifications
- Medicine inventory tracking
- Doctor's appointments
- Prescription management
- Export data to PDF
- Cloud synchronization

## 📄 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

This is a local project. Feel free to customize it for your needs!

## ⚠️ Important Notes

1. **Data Backup**: Regularly backup your `data/` folder
2. **Browser Compatibility**: Works best on Chrome, Firefox, Safari, Edge
3. **Notifications**: Browser must be open for notifications to work
4. **Time Format**: Uses 24-hour format internally
5. **Data Storage**: All data stored locally in JSON files

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review server console for error messages
- Check browser console (F12) for frontend errors

---

**Made with ❤️ for better health management**
